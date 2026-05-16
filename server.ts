import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";

// --- ENV & CONFIG ---
const PORT = 3002;
const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-super-admin-secret-2026";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

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
   * and double-check against public.admins table
   */
  const requireAdminSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.tratatudo_admin_session || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ ok: false, error: "Sessão não encontrada. Por favor, faça login." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Categorical check: user must exist in public.admins
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", decoded.userId)
        .single();

      if (error || !admin) {
        return res.status(403).json({ ok: false, error: "Acesso administrativo negado. Utilizador não é um Super Admin." });
      }

      req.admin = admin;
      req.adminEmail = decoded.email;
      req.adminId = decoded.userId;
      next();
    } catch (err) {
      res.clearCookie("tratatudo_admin_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
  };

  // --- ADMIN AUTH ROUTES ---

  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "E-mail e password são obrigatórios." });
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({ ok: false, error: "Credenciais de acesso inválidas." });
      }

      // 2. Validate if user is in public.admins
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError || !admin) {
        return res.status(403).json({ ok: false, error: "Acesso negado. Este utilizador não possui privilégios de Super Admin." });
      }

      // 3. Generate Admin JWT
      const token = jwt.sign(
        { userId: authData.user.id, email: authData.user.email, role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      // 4. Set Cookie & Respond
      res.cookie("tratatudo_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      res.json({ ok: true, token, data: { user: authData.user, admin } });
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

  app.get("/api/admin/auth/session", requireAdminSession, async (req: any, res) => { res.json({ ok: true, authenticated: true, email: req.admin.email || req.adminEmail, role: "super_admin" }); });

  // --- CLIENT HUB AUTH (Multitenant) ---

  const normalizePhone = (p: string) => p?.replace(/\D/g, "") || "";

  app.post("/api/auth/send-otp", async (req, res) => {
    let { phone_e164 } = req.body;
    if (!phone_e164) return res.status(400).json({ ok: false, error: "Número obrigatório." });
    
    phone_e164 = normalizePhone(phone_e164);

    // Validate if user exists (client OR client_user)
    const [ { data: client }, { data: clientUser } ] = await Promise.all([
      supabase.from("clients").select("id").eq("phone_e164", phone_e164).single(),
      supabase.from("client_users").select("id").eq("phone_e164", phone_e164).single()
    ]);

    if (!client && !clientUser) {
      return res.status(404).json({ ok: false, error: "Este número não está associado a nenhuma conta." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // In dev, we just log it. In prod, we'd send via WhatsApp Evolution API.
    console.log(`[AUTH] OTP for ${phone_e164}: ${code}`);

    const { error } = await supabase.from("auth_otps").insert({
      phone_e164,
      code_hash: code, // Ideally hashed, but for brevity or simple demo we store plain or salt it
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      purpose: 'hub_login'
    });

    if (error) return res.status(500).json({ ok: false, error: "Erro ao gerar código." });
    res.json({ ok: true, message: "Código enviado com sucesso!" });
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    let { phone_e164, code, clientId } = req.body;
    phone_e164 = normalizePhone(phone_e164);

    const { data: otp, error } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("code_hash", code)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otp || new Date(otp.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: "Código inválido ou expirado." });
    }

    await supabase.from("auth_otps").update({ used_at: new Date().toISOString() }).eq("id", otp.id);

    // Determine role and tenant
    const { data: clientUser } = await supabase.from("client_users").select("*").eq("phone_e164", phone_e164).single();
    const { data: clientOwner } = await supabase.from("clients").select("*").eq("phone_e164", phone_e164).single();

    let client = clientOwner || (clientUser ? await supabase.from("clients").select("*").eq("id", clientUser.client_id).single().then(r => r.data) : null);
    
    if (!client) return res.status(404).json({ ok: false, error: "Registo não encontrado." });

    const token = jwt.sign({
      clientId: client.id,
      phone_e164,
      role: clientUser?.role || 'admin',
      userId: clientUser?.id || client.id
    }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("hub_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ ok: true, client, role: clientUser?.role || 'admin' });
  });

  app.get("/api/auth/session", async (req, res) => {
    const token = req.cookies.hub_session;
    if (!token) return res.json({ ok: true, authenticated: false });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { data: client } = await supabase.from("clients").select("*").eq("id", decoded.clientId).single();
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

  app.get("/api/admin/dashboard/stats", requireAdminSession, async (req, res) => {
    try {
      const [
        { count: activeClients },
        { count: pendingTickets },
        { data: subscriptions },
        { count: expiredSubs }
      ] = await Promise.all([
        supabase.from("clients").select("*", { count: 'exact', head: true }).eq("status", "active"),
        supabase.from("tickets").select("*", { count: 'exact', head: true }).neq("status", "resolved"),
        supabase.from("subscriptions").select("plan, status"),
        supabase.from("clients").select("*", { count: 'exact', head: true }).lt("subscription_expires_at", new Date().toISOString())
      ]);
      res.json({ ok: true, data: { activeClients: activeClients || 0, pendingTickets: pendingTickets || 0, expiredSubscriptions: expiredSubs || 0, billingSummary: subscriptions || [], systemStatus: { database: "online", evolution_api: "online", stripe: "online" } } });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  });
  app.get("/api/admin/alerts", requireAdminSession, async (req, res) => {
    res.json({ ok: true, alerts: [] });
  });

  app.get("/api/admin/instances", requireAdminSession, async (req, res) => {
    res.json({ ok: true, data: [] });
  });

  app.get("/api/admin/messages", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return res.status(500).json({ ok: false, error: error.message });
      const mapped = (data || []).map((m: any) => ({ ...m, text: m.body || m.text || '', client_id: m.phone_e164, instance: m.instance_name }));
      res.json({ ok: true, data: mapped });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  });

  app.get("/api/admin/subscriptions", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
      if (error) return res.status(500).json({ ok: false, error: error.message });
      res.json({ ok: true, data: data || [] });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  });

  app.get("/api/admin/logs", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) return res.status(500).json({ ok: false, error: error.message });
      res.json({ ok: true, data: data || [] });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  });

  app.get("/api/admin/clients/trial", requireAdminSession, async (req, res) => {
    try {
      const { data, error } = await supabase.from("clients").select("*").eq("status", "trial");
      if (error) return res.status(500).json({ ok: false, error: error.message });
      res.json({ ok: true, data: data || [] });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
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
        .single();

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
        .single();

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
        .single();

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
        .single();

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
        .single();

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
        .single();

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
        .single();

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
        .single();

      if (error) throw error;
      res.json({ ok: true, data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] TrataTudo Super Admin running on port ${PORT}`);
  });
}

startServer();
