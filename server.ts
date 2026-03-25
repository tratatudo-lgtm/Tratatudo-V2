import "dotenv/config";
import Groq from "groq-sdk";
import bcrypt from "bcrypt";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = 3002;

// 🔐 ENV
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-secret";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ""
});

// 🔌 SUPABASE
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔐 ADMIN MIDDLEWARE
function requireAdminSession(req: any, res: any, next: any) {
  const token = req.cookies.tratatudo_admin_session;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded?.isAdmin) return res.status(403).json({ error: "forbidden" });
    next();
  } catch {
    return res.status(401).json({ error: "invalid session" });
  }
}

// ❤️ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// 🔑 ADMIN SESSION
app.post("/api/admin/auth/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body || {};

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email e password são obrigatórios" });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        isAdmin: true,
        email: ADMIN_EMAIL
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("tratatudo_admin_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      ok: true,
      email: ADMIN_EMAIL,
      role: "admin"
    });

  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao iniciar sessão"
    });
  }
});

app.get("/api/admin/auth/session", async (req: any, res: any) => {
  const token = req.cookies.tratatudo_admin_session;
  if (!token) return res.json({ authenticated: false });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded?.isAdmin) return res.json({ authenticated: false });

    return res.json({
      authenticated: true,
      email: decoded.email || "",
      role: "admin"
    });
  } catch {
    return res.json({ authenticated: false });
  }
});

app.post("/api/admin/auth/logout", async (req: any, res: any) => {
  res.clearCookie("tratatudo_admin_session");
  return res.json({ ok: true });
});

// 📊 DASHBOARD
app.get("/api/admin/dashboard/stats", requireAdminSession, async (req, res) => {
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: totalMessages } = await supabase
    .from("wa_messages")
    .select("*", { count: "exact", head: true });

  res.json({
    total_clients: totalClients || 0,
    active_clients: totalClients || 0,
    trial_clients: 0,
    total_messages_24h: totalMessages || 0,
    active_instances: 1,
    system_health: 100,
    messages_chart: []
  });
});

// 👥 CLIENTES
  app.get("/api/admin/clients", requireAdminSession, async (req: any, res) => {
    try {
      const [{ data: clientsRows, error }, { data: instancesRows }] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("client_instances").select("*")
      ]);

      if (error) throw error;

      const instances = instancesRows || [];

      const clients = (clientsRows || []).map((c: any) => {
        const clientInstance = instances.find((i: any) => String(i.client_id) === String(c.id));

        return {
          id: String(c.id),
          client_id: c.client_id || String(c.id),
          company_name: c.company_name || "",
          contact_name: c.contact_name || "",
          email: c.email || "",
          phone: c.phone_e164 || c.phone || "",
          status: c.status || "pending",
          plan: c.plan || "starter",
          trial_start: c.trial_start || null,
          trial_end: c.trial_end || null,
          production_activated_at: c.production_activated_at || null,
          bot_instructions: c.bot_instructions || "",
          created_at: c.created_at || new Date().toISOString(),
          instance: clientInstance ? {
            instance_name: clientInstance.instance_name || "",
            status: clientInstance.status || "unknown",
            is_hub: clientInstance.is_hub === true || clientInstance.instance_name === "TrataTudo bot"
          } : null
        };
      });

      return res.json({ ok: true, clients });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
app.get("/api/admin/messages", requireAdminSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("wa_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.json({
      ok: true,
      messages: (data || []).map((m: any) => ({
        id: String(m.id),
        client_id: m.client_id ? String(m.client_id) : "",
        phone_e164: m.phone_e164 || "",
        phone: m.phone_e164 || "",
        text: m.text || "",
        direction: m.direction || "inbound",
        instance: m.instance || "",
        created_at: m.created_at
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao carregar mensagens" });
  }
});

app.get("/api/admin/instances", requireAdminSession, async (req, res) => {
  const { data } = await supabase.from("client_instances").select("*");

  res.json({
    instances: (data || []).map((i: any) => ({
      id: i.id,
      instance_name: i.instance_name,
      status: i.status || "unknown",
      company_name: i.instance_name === "TrataTudo bot" ? "TrataTudo Hub" : "Cliente",
      is_hub: i.instance_name === "TrataTudo bot"
    }))
  });
});

// 📝 ALERTAS
app.get("/api/admin/alerts", requireAdminSession, async (req, res) => {
  res.json({ alerts: [] });
});

// 📊 TICKETS
app.get("/api/admin/tickets", requireAdminSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.json({
      ok: true,
      tickets: (data || []).map((t: any) => ({
        id: String(t.id),
        client_id: t.client_id ? String(t.client_id) : "",
        subject: t.subject || "Ticket",
        description: t.description || "",
        status: t.status || "new",
        priority: t.priority || "medium",
        tracking_code: t.tracking_code || "",
        customer_name: t.customer_name || "",
        customer_contact: t.customer_contact || "",
        category: t.category || "",
        kind: t.kind || "",
        created_at: t.created_at,
        updated_at: t.updated_at || t.created_at
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao carregar tickets" });
  }
});

app.get("/api/admin/tickets/:id/status", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ ok: false, error: "Id é obrigatório" });
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("status")
      .eq("id", id);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, status: data[0].status });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao obter status do ticket"
    });
  }
});

// 📊 SUBSCRIÇÕES
app.get("/api/admin/subscriptions", requireAdminSession, async (req, res) => {
  const { data } = await supabase.from("subscriptions").select("*");

  res.json({ subscriptions: data || [] });
});

// 📝 LOGS
app.get("/api/admin/logs", requireAdminSession, async (req, res) => {
  res.json({ logs: [] });
});

// 🚀 START

app.post("/api/admin/clients/trial", requireAdminSession, async (req: any, res: any) => {
  try {
    const { company_name, phone_e164, contact_name, email, bot_instructions, plan } = req.body || {};
    if (!company_name || !phone_e164) {
      return res.status(400).json({ ok: false, error: "company_name e phone_e164 são obrigatórios" });
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("clients")
      .insert({
        company_name,
        phone_e164,
        contact_name: contact_name || "",
        email: email || "",
        bot_instructions: bot_instructions || "",
        plan: plan || "starter",
        status: "trial",
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, client: data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar cliente trial" });
  }
});

app.put("/api/admin/clients/:id", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    if (!id) {
      return res.status(400).json({ ok: false, error: "Id é obrigatório" });
    }

    const payload: any = {
      updated_at: new Date().toISOString()
    };

    if (body.company_name !== undefined) payload.company_name = body.company_name;
    if (body.email !== undefined) payload.email = body.email;
    if (body.bot_instructions !== undefined) payload.bot_instructions = body.bot_instructions;
    if (body.phone !== undefined) payload.phone_e164 = body.phone;
    if (body.phone_e164 !== undefined) payload.phone_e164 = body.phone_e164;

    const { data, error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.json({ ok: true, client: data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao atualizar cliente" });
  }
});

app.delete("/api/admin/clients/:id", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ ok: false, error: "Id é obrigatório" });

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao eliminar cliente" });
  }
});

app.patch("/api/admin/clients/:id/status", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    if (!id || !status) return res.status(400).json({ ok: false, error: "Id e status são obrigatórios" });

    const { data, error } = await supabase
      .from("clients")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, client: data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao atualizar estado do cliente" });
  }
});

app.post("/api/admin/clients/:id/activate-production", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ ok: false, error: "Id é obrigatório" });

    const { data: client, error } = await supabase
      .from("clients")
      .update({
        status: "active",
        production_activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });

    const instanceName = `client-${id}`;
    const { data: existingInstance } = await supabase
      .from("client_instances")
      .select("*")
      .eq("client_id", id)
      .eq("instance_name", instanceName)
      .maybeSingle();

    if (!existingInstance) {
      const { error: instanceError } = await supabase
        .from("client_instances")
        .insert({
          client_id: id,
          instance_name: instanceName,
          status: "pending",
          is_hub: false
        });

      if (instanceError) return res.status(500).json({ ok: false, error: instanceError.message });
    }

    return res.json({ ok: true, client, instance_name: instanceName });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao ativar produção do cliente" });
  }
});



function mapTicketStatusForClient(status: string) {
  const s = (status || "").toLowerCase();
  if (["new", "open", "aberto", "novo"].includes(s)) return "open";
  if (["in_review", "in_progress", "em análise", "em analise", "em tratamento"].includes(s)) return "in_progress";
  if (["resolved", "done", "closed", "concluido", "concluído", "resolvido"].includes(s)) return "resolved";
  return "open";
}

app.get("/api/admin/tickets/support", requireAdminSession, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .or("kind.eq.support,category.eq.support,subject.ilike.%suporte%,subject.ilike.%support%")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.json({
      ok: true,
      tickets: (data || []).map((t: any) => ({
        id: String(t.id),
        client_id: t.client_id ? String(t.client_id) : "",
        subject: t.subject || "Ticket de suporte",
        description: t.description || "",
        status: mapTicketStatusForClient(t.status || "open"),
        priority: t.priority || "medium",
        tracking_code: t.tracking_code || "",
        customer_name: t.customer_name || "",
        customer_contact: t.customer_contact || "",
        category: t.category || "",
        kind: t.kind || "",
        created_at: t.created_at,
        updated_at: t.updated_at || t.created_at
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao carregar tickets de suporte" });
  }
});

app.get("/api/client/tickets", async (req: any, res: any) => {
  try {
    const clientId = String(req.query.client_id || "").trim();

    if (!clientId) {
      return res.status(400).json({ ok: false, error: "client_id é obrigatório" });
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.json({
      ok: true,
      tickets: (data || []).map((t: any) => ({
        id: String(t.id),
        client_id: t.client_id ? String(t.client_id) : "",
        tracking_code: t.tracking_code || "",
        subject: t.subject || "Pedido",
        description: t.description || "",
        status: mapTicketStatusForClient(t.status || "open"),
        priority: t.priority || "medium",
        created_at: t.created_at,
        updated_at: t.updated_at || t.created_at
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao carregar tickets do cliente" });
  }
});


app.listen(PORT, () => {
  console.log("🔥 TrataTudo API running on port", PORT);
});
