import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// --- ENV & CONFIG ---
const PORT = Number(process.env.PORT || "3005");
const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-super-admin-secret-2026";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODY2NDIsImV4cCI6MjA4Nzg2MjY0Mn0.FfxryvS33JUfIf5HOqJyhBRANKzdH0Snuu3p-RDOs_k";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://lghsbjgjrogkadczikou.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Dummy keys for initialization safety
const GROQ_API_KEY = process.env.GROQ_API_KEY || "gsk_dummy_key";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key";

// Initialize Supabase (Service Role to bypass RLS for Admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // --- MIDDLEWARES ---

  /**
   * Middleware to validate Super Admin session via JWT
   */
  const requireAdminSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.tratatudo_admin_session || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ ok: false, error: "Sessão não encontrada. Por favor, faça login." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      if (decoded.email !== "juliocosta@protonmail.com") {
        return res.status(403).json({ ok: false, error: "Acesso administrativo negado. Utilizador não autorizado." });
      }

      req.admin = { email: decoded.email, role: 'super_admin' };
      req.adminId = decoded.userId;
      next();
    } catch (err) {
      res.clearCookie("tratatudo_admin_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
  };

  /**
   * Middleware to validate Client Hub session via JWT
   */
  const requireClientSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.hub_session || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ ok: false, error: "Sessão não encontrada. Por favor, faça login." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", decoded.clientId)
        .maybeSingle();

      if (error || !client) {
        return res.status(403).json({ ok: false, error: "Acesso de cliente negado." });
      }

      req.client = client;
      req.clientId = decoded.clientId;
      next();
    } catch (err) {
      res.clearCookie("hub_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
  };

  // --- ADMIN AUTH ROUTES ---

  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "E-mail e password são obrigatórios." });
    }

    if (email !== "juliocosta@protonmail.com") {
      return res.status(403).json({ ok: false, error: "Acesso negado. Apenas o e-mail administrador juliocosta@protonmail.com tem acesso." });
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({ ok: false, error: "E-mail ou palavra-passe incorretos." });
      }

      // 2. Generate Admin JWT
      const token = jwt.sign(
        { userId: authData.user.id, email: authData.user.email, role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      // 3. Set Cookie & Respond
      res.cookie("tratatudo_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      res.json({ ok: true, data: { admin: { email: authData.user.email, id: authData.user.id } } });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: "Erro interno no servidor de autenticação." });
    }
  });

  app.get("/api/admin/me", requireAdminSession, async (req: any, res) => {
    res.json({ ok: true, data: req.admin });
  });

  app.post("/api/admin/auth/logout", (req, res) => {
    res.clearCookie("tratatudo_admin_session");
    res.json({ ok: true, message: "Logout efetuado com sucesso." });
  });

  // --- CLIENT HUB AUTH (Multitenant) ---

  const normalizePhone = (p: string) => p?.replace(/\D/g, "") || "";

  app.post("/api/auth/send-otp", async (req, res) => {
    let { phone_e164 } = req.body;
    if (!phone_e164) return res.status(400).json({ ok: false, error: "Número obrigatório." });
    
    phone_e164 = normalizePhone(phone_e164);

    // Validate if user exists (clients table only)
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id")
      .eq("phone_e164", phone_e164)
      .maybeSingle();

    if (clientErr || !client) {
      return res.status(404).json({ ok: false, error: "Este número não está associado a nenhuma conta." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AUTH] OTP for ${phone_e164}: ${code}`);

    // Call Evolution API natively to send OTP via WhatsApp
    try {
      await fetch("http://127.0.0.1:8080/message/sendText/FinalWAV", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "TrataTudo_2026_Negocio"
        },
        body: JSON.stringify({
          number: phone_e164,
          text: "*TrataTudo*\nO teu código é: *" + code + "*"
        })
      });
      console.log(`[EVOLUTION API] OTP sent successfully to ${phone_e164}`);
    } catch (fetchErr: any) {
      console.log(`[EVOLUTION API (FALLBACK)] Failed to contact standard Evolution service: ${fetchErr.message}`);
    }

    const { error } = await supabase.from("auth_otps").insert({
      phone_e164,
      code_hash: code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      purpose: 'hub_login'
    });

    if (error) return res.status(500).json({ ok: false, error: "Erro ao gerar código." });
    res.json({ ok: true, message: "Código enviado com sucesso!" });
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    let { phone_e164, code } = req.body;
    phone_e164 = normalizePhone(phone_e164);

    const { data: otp, error } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("code_hash", code)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !otp || new Date(otp.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: "Código inválido ou expirado." });
    }

    await supabase.from("auth_otps").update({ used_at: new Date().toISOString() }).eq("id", otp.id);

    // Determine role and tenant (clients only)
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("phone_e164", phone_e164)
      .maybeSingle();
    
    if (clientErr || !client) {
      return res.status(404).json({ ok: false, error: "Registo não encontrado." });
    }

    const token = jwt.sign({
      clientId: client.id,
      phone_e164,
      role: 'admin',
      userId: client.id
    }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("hub_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ ok: true, client, role: 'admin' });
  });

  app.get("/api/auth/session", async (req, res) => {
    const token = req.cookies.hub_session;
    if (!token) return res.json({ ok: true, authenticated: false });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { data: client } = await supabase.from("clients").select("*").eq("id", decoded.clientId).maybeSingle();
      if (!client) throw new Error();
      res.json({ ok: true, authenticated: true, client, role: decoded.role, userId: decoded.userId });
    } catch {
      res.clearCookie("hub_session");
      res.json({ ok: true, authenticated: false });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("hub_session");
    res.json({ ok: true });
  });

  // --- CLIENT API SERVICES (Secured by requireClientSession) ---

  app.get("/api/client/dashboard", requireClientSession, async (req: any, res) => {
    try {
      // Fetch count of client's own pending tickets
      const { count: pendingTickets } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", req.clientId)
        .neq("status", "resolved");

      res.json({
        ok: true,
        data: {
          activeClients: req.client.plan ? req.client.plan.toUpperCase() : "TRIAL",
          pendingTickets: pendingTickets || 0,
          expiredSubscriptions: req.client.subscription_expires_at 
            ? new Date(req.client.subscription_expires_at).toLocaleDateString('pt') 
            : "Sem Expiração",
          systemStatus: {
            database: "online",
            evolution_api: "online",
            stripe: "online"
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets", requireClientSession, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, clients(company_name)")
        .eq("client_id", req.clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets/:id", requireClientSession, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, clients(company_name), ticket_messages(*)")
        .eq("id", req.params.id)
        .eq("client_id", req.clientId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ ok: false, error: "Ticket não localizado ou sem autorização." });

      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/client/tickets/:id/messages", requireClientSession, async (req: any, res) => {
    try {
      const { text } = req.body;
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("id")
        .eq("id", req.params.id)
        .eq("client_id", req.clientId)
        .maybeSingle();

      if (ticketError || !ticket) {
        return res.status(403).json({ ok: false, error: "Mensagem não autorizada." });
      }

      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: req.params.id,
          text,
          role: 'client',
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.put("/api/client/tickets/:id/status", requireClientSession, async (req: any, res) => {
    try {
      const { status } = req.body;
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("id")
        .eq("id", req.params.id)
        .eq("client_id", req.clientId)
        .maybeSingle();

      if (ticketError || !ticket) {
        return res.status(403).json({ ok: false, error: "Atualização não autorizada." });
      }

      const { data, error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- ADMIN DASHBOARD ---

  app.get("/api/admin/dashboard", requireAdminSession, async (req, res) => {
    try {
      const [
        { count: activeClients },
        { count: pendingTickets },
        { data: subscriptions },
        { data: expiredSubs }
      ] = await Promise.all([
        supabase.from("clients").select("*", { count: 'exact', head: true }).eq("status", "active"),
        supabase.from("tickets").select("*", { count: 'exact', head: true }).neq("status", "resolved"),
        supabase.from("subscriptions").select("plan, status"),
        supabase.from("clients").select("*", { count: 'exact', head: true }).lt("subscription_expires_at", new Date().toISOString())
      ]);

      res.json({
        ok: true,
        data: {
          activeClients: activeClients || 0,
          pendingTickets: pendingTickets || 0,
          expiredSubscriptions: expiredSubs || 0,
          billingSummary: subscriptions || [],
          systemStatus: {
            database: "online",
            evolution_api: "online",
            stripe: "online"
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- CLIENT MANAGEMENT (CRUD) ---

  app.get("/api/admin/clients", requireAdminSession, async (req, res) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const from = (Number(page) - 1) * Number(limit);
      const to = from + Number(limit) - 1;

      let query = supabase
        .from("clients")
        .select(`
          *,
          client_profiles(*),
          subscriptions(*)
        `, { count: 'exact' });

      if (search) {
        query = query.ilike("company_name", `%${search}%`);
      }

      const { data, count, error } = await query
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({ ok: true, data, total: count });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/admin/clients/:id", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(`
          *,
          client_profiles(*),
          subscriptions(*),
          tickets(*)
        `)
        .eq("id", req.params.id)
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/admin/clients", requireAdminSession, async (req, res) => {
    try {
      const { client, profile } = req.body;
      
      // 1. Create client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert(client)
        .select()
        .maybeSingle();

      if (clientError) throw clientError;

      // 2. Create profile if provided
      if (profile) {
        const { error: profileError } = await supabase
          .from("client_profiles")
          .insert({ ...profile, client_id: newClient.id });
        
        if (profileError) throw profileError;
      }

      res.json({ ok: true, data: newClient });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.put("/api/admin/clients/:id", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.put("/api/admin/clients/:id/bot-config", requireAdminSession, async (req, res) => {
    try {
      const { master_prompt, bot_instructions, bot_instructions_compact } = req.body;
      
      const { data, error } = await supabase
        .from("clients")
        .update({
          master_prompt,
          bot_instructions,
          bot_instructions_compact
        })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.delete("/api/admin/clients/:id", requireAdminSession, async (req, res) => {
    try {
      // Prefer soft delete (status inactive) or based on user choice
      const { data, error } = await supabase
        .from("clients")
        .update({ status: 'inactive' })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- BILLING MODULE ---

  app.get("/api/admin/billing/stats", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status");

      if (error) throw error;

      // Group by plan
      const stats = data.reduce((acc: any, sub: any) => {
        acc[sub.plan] = (acc[sub.plan] || 0) + 1;
        return acc;
      }, {});

      res.json({ ok: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/admin/billing/subscriptions", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, clients(company_name)")
        .order("ends_at", { ascending: true });

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- TICKETS MODULE ---

  app.get("/api/admin/tickets", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, clients(company_name)")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/admin/tickets/:id", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, clients(company_name), ticket_messages(*)")
        .eq("id", req.params.id)
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/admin/tickets/:id/messages", requireAdminSession, async (req: any, res) => {
    try {
      const { text } = req.body;
      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: req.params.id,
          text,
          role: 'admin',
          admin_id: req.adminId,
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.put("/api/admin/tickets/:id/status", requireAdminSession, async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", req.params.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- SERVE VANILLA FRONTEND ---
  // Serve static assets (CSS, JS, etc.) from the public folder
  app.use(express.static(path.join(process.cwd(), "public")));

  // Clean URL mappings
  app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });

  app.get("/login", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "login.html"));
  });

  app.get("/login.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "login.html"));
  });

  app.get("/admin", (req, res) => {
    res.redirect("/admin/login");
  });

  app.get("/admin/login", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "admin", "login.html"));
  });

  app.get("/admin/login.html", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "admin", "login.html"));
  });

  app.get("/admin/:page", (req, res) => {
    const page = req.params.page;
    if (page === "login" || page === "login.html") {
      return res.sendFile(path.join(process.cwd(), "public", "admin", "login.html"));
    }
    const filePath = path.join(process.cwd(), "public", "app", `${page}.html`);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.redirect("/admin/dashboard");
      }
    });
  });

  app.get("/app/:page", (req, res) => {
    const page = req.params.page;
    const filePath = path.join(process.cwd(), "public", "app", `${page}.html`);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.redirect("/app/dashboard");
      }
    });
  });

  // Global Fallback
  app.get("*", (req, res) => {
    res.redirect("/");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] TrataTudo Super Admin running on port ${PORT}`);
  });
}

startServer();
