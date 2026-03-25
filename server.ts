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
app.get("/api/admin/clients", requireAdminSession, async (req, res) => {
  const { data } = await supabase.from("clients").select("*");

  res.json({
    clients: (data || []).map((c: any) => ({
      id: c.id,
      company_name: c.company_name,
      phone: c.phone_e164,
      status: c.status
    }))
  });
});

app.post("/api/admin/clients/trial", requireAdminSession, async (req: any, res: any) => {
  try {
    const { company_name, phone_e164 } = req.body || {};

    if (!company_name || !phone_e164) {
      return res.status(400).json({ ok: false, error: "Company name e phone são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("clients")
      .insert([{ company_name, phone_e164, status: "trial" }]);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, client: data[0] });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao criar cliente trial"
    });
  }
});

app.put("/api/admin/clients/:id", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { company_name, phone_e164 } = req.body || {};

    if (!id || !company_name || !phone_e164) {
      return res.status(400).json({ ok: false, error: "Id, company name e phone são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("clients")
      .update({ id: id, company_name: company_name, phone_e164: phone_e164 });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, client: data[0] });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao atualizar cliente"
    });
  }
});

app.delete("/api/admin/clients/:id", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ ok: false, error: "Id é obrigatório" });
    }

    const { error } = await supabase
      .from("clients")
      .delete({ id: id });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao deletar cliente"
    });
  }
});

app.patch("/api/admin/clients/:id/status", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};

    if (!id || !status) {
      return res.status(400).json({ ok: false, error: "Id e status são obrigatórios" });
    }

    const { data, error } = await supabase
      .from("clients")
      .update({ id: id, status: status });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, client: data[0] });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao atualizar status do cliente"
    });
  }
});

app.post("/api/admin/clients/:id/activate-production", requireAdminSession, async (req: any, res: any) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ ok: false, error: "Id é obrigatório" });
    }

    const { data, error } = await supabase
      .from("clients")
      .update({ id: id, status: "production" });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, client: data[0] });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao ativar produção do cliente"
    });
  }
});

// 💬 MENSAGENS
app.get("/api/admin/messages", requireAdminSession, async (req, res) => {
  const { data } = await supabase
    .from("wa_messages")
    .select("*")
    .limit(200)
    .order("created_at", { ascending: false });

  res.json({ messages: data || [] });
});

// 🤖 INSTÂNCIAS
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
  const { data } = await supabase.from("tickets").select("*");

  res.json({ tickets: data || [] });
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
app.listen(PORT, () => {
  console.log("🔥 TrataTudo API running on port", PORT);
});