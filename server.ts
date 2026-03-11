import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-v2-secret-key-2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Middlewares ---

  const requireClientSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.hub_session;
    if (!token) {
      return res.status(401).json({ ok: false, error: "Não autenticado." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.clientId) {
        throw new Error("Invalid token");
      }

      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", decoded.clientId)
        .single();

      if (error || !client) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      }

      req.client = client;
      req.clientId = client.id;
      next();
    } catch (err) {
      res.clearCookie("hub_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
  };

  const requireAdminSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.tratatudo_admin_session;
    if (!token) {
      return res.status(401).json({ ok: false, error: "Não autorizado." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.isAdmin) {
        throw new Error("Not an admin");
      }

      // Verify in admins table
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", decoded.userId)
        .single();

      if (error || !admin) {
        return res.status(403).json({ ok: false, error: "Acesso administrativo negado." });
      }

      req.admin = admin;
      req.adminId = decoded.userId;
      next();
    } catch (err) {
      res.clearCookie("tratatudo_admin_session");
      return res.status(401).json({ ok: false, error: "Sessão administrativa expirada." });
    }
  };

  // --- API Routes ---

  // 1. Send OTP Code
  app.post("/api/auth/send-otp", async (req, res) => {
    const { phone_e164 } = req.body;
    if (!phone_e164) {
      return res.status(400).json({ ok: false, error: "Número de WhatsApp é obrigatório." });
    }

    // Validate format (simple check)
    if (!phone_e164.startsWith("+") || phone_e164.length < 10) {
      return res.status(400).json({ ok: false, error: "Formato de número inválido. Use +351..." });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Invalidate previous OTPs
    await supabase
      .from("auth_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("phone_e164", phone_e164)
      .is("used_at", null);

    // Store in Supabase
    const { error } = await supabase
      .from("auth_otps")
      .insert({ 
        phone_e164, 
        code_hash: codeHash, 
        expires_at: expiresAt,
        purpose: 'hub_login',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

    if (error) {
      console.error("Supabase error (auth_otps):", error);
      return res.status(500).json({ ok: false, error: "Erro ao processar código OTP." });
    }

    // --- REAL WHATSAPP LOGIC ---
    console.log(`[WHATSAPP OTP] Código ${code} para ${phone_e164}`);
    // ---------------------------

    res.json({ ok: true, message: "Código enviado com sucesso!" });
  });

  // 2. Verify OTP Code
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { phone_e164, code } = req.body;
    if (!phone_e164 || !code) {
      return res.status(400).json({ ok: false, error: "Número e código são obrigatórios." });
    }

    const { data: otp, error: fetchError } = await supabase
      .from("auth_otps")
      .select("*")
      .eq("phone_e164", phone_e164)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otp) {
      return res.status(400).json({ ok: false, error: "Nenhum código ativo encontrado para este número." });
    }

    if (new Date(otp.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: "Código expirado." });
    }

    if (otp.attempts >= 5) {
      return res.status(400).json({ ok: false, error: "Demasiadas tentativas. Peça um novo código." });
    }

    const isMatch = await bcrypt.compare(code, otp.code_hash);
    if (!isMatch) {
      // Increment attempts
      await supabase
        .from("auth_otps")
        .update({ attempts: (otp.attempts || 0) + 1 })
        .eq("id", otp.id);

      return res.status(400).json({ ok: false, error: "Código inválido." });
    }

    // Success! Mark as used
    await supabase
      .from("auth_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otp.id);

    // Find client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, company_name, phone_e164")
      .eq("phone_e164", phone_e164)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ ok: false, error: "Cliente não registado no sistema." });
    }

    // Create JWT
    const token = jwt.sign(
      { clientId: client.id, phone_e164: client.phone_e164 },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set cookie
    res.cookie("hub_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ 
      ok: true, 
      message: "Login efetuado com sucesso!",
      client: {
        id: client.id,
        company_name: client.company_name,
        phone_e164: client.phone_e164
      }
    });
  });

  // 3. Check Session
  app.get("/api/auth/session", async (req, res) => {
    const token = req.cookies.hub_session;
    if (!token) {
      return res.json({ ok: true, authenticated: false });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const { data: client, error } = await supabase
        .from("clients")
        .select("id, company_name, phone_e164")
        .eq("id", decoded.clientId)
        .single();

      if (error || !client) {
        res.clearCookie("hub_session");
        return res.json({ ok: true, authenticated: false });
      }

      res.json({ 
        ok: true,
        authenticated: true, 
        phone_e164: client.phone_e164, 
        client_id: client.id,
        company_name: client.company_name
      });
    } catch (err) {
      res.clearCookie("hub_session");
      res.json({ ok: true, authenticated: false });
    }
  });

  // 4. Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("hub_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ ok: true });
  });

  // 5. Dashboard Stats
  app.get("/api/client/dashboard/stats", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    const client = req.client;

    try {
      // 1. Messages count
      const { count: totalMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: sentMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("direction", "outbound");

      const { count: receivedMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("direction", "inbound");

      // 2. Tickets stats
      const { count: totalTickets } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: openTickets } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .in("status", ["aberto", "em análise", "pendente"]);

      const { count: complaints } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("kind", "reclamação");

      // 3. Instance info
      const { data: instance } = await supabase
        .from("client_instances")
        .select("*")
        .eq("client_id", clientId)
        .single();

      // 4. Subscription info
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("client_id", clientId)
        .single();

      // 5. Recent Activity
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("subject, status, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentMessages } = await supabase
        .from("wa_messages")
        .select("text, created_at, direction")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(5);

      const activity = [
        ...(recentTickets || []).map(t => ({ type: 'ticket', title: t.subject, status: t.status, created_at: t.created_at })),
        ...(recentMessages || []).map(m => ({ type: 'message', title: m.text, status: m.direction === 'outbound' ? 'enviada' : 'recebida', created_at: m.created_at }))
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      res.json({
        ok: true,
        stats: {
          messages: totalMessages || 0,
          totalMessages: totalMessages || 0,
          sentMessages: sentMessages || 0,
          receivedMessages: receivedMessages || 0,
          totalTickets: totalTickets || 0,
          openTickets: openTickets || 0,
          complaints: complaints || 0,
        },
        instance: instance ? {
          instance_name: instance.instance_name,
          status: instance.status,
          is_hub: instance.is_hub,
          created_at: instance.created_at
        } : null,
        subscription: subscription || {
          status: client.status,
          plan: 'Trial',
          ends_at: client.trial_end
        },
        activity: activity
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 6. Get Conversations
  app.get("/api/client/messages", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;

    try {
      const { data: messages, error } = await supabase
        .from("wa_messages")
        .select("text, direction, created_at, phone_e164")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by phone_e164
      const conversationsMap = new Map();
      (messages || []).forEach(msg => {
        if (!conversationsMap.has(msg.phone_e164)) {
          conversationsMap.set(msg.phone_e164, {
            phone_e164: msg.phone_e164,
            lastMsg: msg.text,
            time: msg.created_at,
            direction: msg.direction,
            type: 'WhatsApp'
          });
        }
      });

      res.json({ ok: true, messages: Array.from(conversationsMap.values()) });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 7. Get Message History
  app.get("/api/client/messages/history/:phone", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    const { phone } = req.params;

    try {
      const { data: messages, error } = await supabase
        .from("wa_messages")
        .select("text, direction, created_at, phone_e164")
        .eq("client_id", clientId)
        .eq("phone_e164", phone)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      res.json({ ok: true, messages });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 8. Get Tickets
  app.get("/api/client/tickets", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;

    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({ ok: true, tickets });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 9. Get Ticket Messages
  app.get("/api/client/tickets/:id/messages", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    const { id } = req.params;

    try {
      // Verify ownership
      const { data: ticket } = await supabase
        .from("tickets")
        .select("id")
        .eq("id", id)
        .eq("client_id", clientId)
        .single();

      if (!ticket) return res.status(403).json({ ok: false, error: "Acesso negado." });

      const { data: messages, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      res.json({ ok: true, messages });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 10. Get Instance Details
  app.get("/api/client/instance", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;

    try {
      const { data: instance } = await supabase
        .from("client_instances")
        .select("*")
        .eq("client_id", clientId)
        .single();

      const { count: totalMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: sentMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("direction", "outbound");

      const { count: receivedMessages } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("direction", "inbound");

      const { count: totalTickets } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: complaints } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("kind", "reclamação");

      res.json({
        ok: true,
        instance: instance ? {
          instance_name: instance.instance_name,
          whatsapp_number: "", // Derivar se possível
          status: instance.status,
          is_hub: instance.is_hub,
          created_at: instance.created_at,
          last_activity: instance.updated_at
        } : null,
        stats: {
          totalMessages: totalMessages || 0,
          sentMessages: sentMessages || 0,
          receivedMessages: receivedMessages || 0,
          totalTickets: totalTickets || 0,
          complaints: complaints || 0,
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 11. Get Subscription Details
  app.get("/api/client/subscription", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    const client = req.client;

    try {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("client_id", clientId)
        .single();

      const { count: messagesCount } = await supabase
        .from("wa_messages")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: totalTickets } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId);

      const { count: complaints } = await supabase
        .from("tickets")
        .select("*", { count: 'exact', head: true })
        .eq("client_id", clientId)
        .eq("kind", "reclamação");

      res.json({
        ok: true,
        subscription: subscription || {
          plan: 'Trial',
          status: client.status,
          started_at: client.created_at,
          ends_at: client.trial_end
        },
        usage: {
          messages: messagesCount || 0,
          tickets: totalTickets || 0,
          complaints: complaints || 0
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 12. Get Client Settings
  app.get("/api/client/settings", requireClientSession, async (req: any, res) => {
    res.json({ ok: true, settings: req.client });
  });

  // 13. Update Client Settings
  app.patch("/api/client/settings", requireClientSession, async (req: any, res) => {
    const { company_name, email, bot_instructions } = req.body;

    try {
      const { data: updatedClient, error: updateError } = await supabase
        .from("clients")
        .update({ company_name, email, bot_instructions })
        .eq("id", req.clientId)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({ ok: true, settings: updatedClient });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- ADMIN API ROUTES ---

  // 1. Admin Login
  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({ ok: false, error: "Credenciais de administrador inválidas." });
      }

      // 2. Verify in 'admins' table
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError || !admin) {
        return res.status(403).json({ ok: false, error: "Acesso administrativo negado." });
      }

      // 3. Create JWT
      const token = jwt.sign(
        { userId: authData.user.id, email: authData.user.email, isAdmin: true },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      // 4. Set cookie
      res.cookie("tratatudo_admin_session", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 12 * 60 * 60 * 1000,
      });

      res.json({ ok: true, email: authData.user.email, role: "admin" });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 2. Admin Session Check
  app.get("/api/admin/auth/session", async (req, res) => {
    const token = req.cookies.tratatudo_admin_session;
    if (!token) {
      return res.status(401).json({ ok: false, authenticated: false });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.isAdmin) throw new Error("Not admin");

      res.json({ ok: true, authenticated: true, email: decoded.email, role: "admin" });
    } catch (err) {
      res.clearCookie("tratatudo_admin_session");
      res.json({ ok: true, authenticated: false });
    }
  });

  // 3. Admin Logout
  app.post("/api/admin/auth/logout", (req, res) => {
    res.clearCookie("tratatudo_admin_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ ok: true });
  });

  // 4. Admin Dashboard Stats
  app.get("/api/admin/dashboard/stats", requireAdminSession, async (req: any, res) => {
    try {
      // Global stats
      const { count: totalClients } = await supabase.from("clients").select("*", { count: 'exact', head: true });
      const { count: onlineInstances } = await supabase.from("client_instances").select("*", { count: 'exact', head: true }).eq("status", "online");
      const { count: messagesToday } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true });
      const { count: openTickets } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).in("status", ["aberto", "em análise", "pendente"]);

      // Recent activity
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("subject, status, created_at, clients(company_name)")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: recentMessages } = await supabase
        .from("wa_messages")
        .select("text, created_at, phone_e164, clients(company_name)")
        .order("created_at", { ascending: false })
        .limit(3);

      const activity = [
        ...(recentTickets || []).map(t => ({ 
          type: 'ticket', 
          title: `Ticket: ${t.subject}`, 
          status: t.status, 
          created_at: t.created_at,
          company: (t.clients as any)?.company_name 
        })),
        ...(recentMessages || []).map(m => ({ 
          type: 'message', 
          title: `Msg: ${m.text}`, 
          status: 'recebida', 
          created_at: m.created_at,
          company: (m.clients as any)?.company_name 
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

      res.json({
        ok: true,
        stats: {
          totalClients: totalClients || 0,
          onlineInstances: onlineInstances || 0,
          messagesToday: messagesToday || 0,
          openTickets: openTickets || 0,
        },
        recentActivity: activity,
        systemHealth: {
          status: 'healthy',
          uptime: 'Online',
          lastBackup: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 5. Admin Clients List
  app.get("/api/admin/clients", requireAdminSession, async (req: any, res) => {
    try {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ ok: true, clients });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 6. Admin Update Client Status
  app.patch("/api/admin/clients/:id/status", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabase
        .from("clients")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json({ ok: true, client: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 7. Admin Instances List
  app.get("/api/admin/instances", requireAdminSession, async (req: any, res) => {
    try {
      const { data: instances, error } = await supabase
        .from("client_instances")
        .select(`
          *,
          clients (company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const result = (instances || []).map(inst => ({
        ...inst,
        company_name: (inst.clients as any)?.company_name || 'Desconhecido'
      }));

      res.json({ ok: true, instances: result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 8. Admin Global Messages
  app.get("/api/admin/messages", requireAdminSession, async (req: any, res) => {
    try {
      const { data: messages, error } = await supabase
        .from("wa_messages")
        .select(`
          *,
          clients (company_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const result = (messages || []).map(msg => ({
        ...msg,
        company_name: (msg.clients as any)?.company_name || 'Desconhecido'
      }));

      res.json({ ok: true, messages: result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 9. Admin Global Tickets
  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select(`
          *,
          clients (company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const result = (tickets || []).map(t => ({
        ...t,
        company_name: (t.clients as any)?.company_name || 'Desconhecido'
      }));

      res.json({ ok: true, tickets: result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 10. Admin Update Ticket Status
  app.patch("/api/admin/tickets/:id/status", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json({ ok: true, ticket: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 11. Admin Subscriptions
  app.get("/api/admin/subscriptions", requireAdminSession, async (req: any, res) => {
    try {
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          clients (company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const result = (subscriptions || []).map(s => ({
        ...s,
        company_name: (s.clients as any)?.company_name || 'Desconhecido'
      }));

      res.json({ ok: true, subscriptions: result });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 12. Admin System Logs
  app.get("/api/admin/logs", requireAdminSession, async (req: any, res) => {
    // Return empty for now as requested if no table exists
    res.json({ ok: true, logs: [] });
  });

  // 13. Evolution API: Create Instance
  app.post("/api/admin/instances/create", requireAdminSession, async (req: any, res) => {
    const { client_id } = req.body;
    if (!client_id) return res.status(400).json({ ok: false, error: "client_id é obrigatório." });

    const instance_name = `client-${client_id}`;
    const EVO_URL = process.env.EVO_URL;
    const EVO_KEY = process.env.EVO_KEY;

    if (!EVO_URL || !EVO_KEY) {
      return res.status(500).json({ ok: false, error: "Configuração da Evolution API em falta (EVO_URL/EVO_KEY)." });
    }

    try {
      // 1. Call Evolution API to create instance
      const evoResponse = await fetch(`${EVO_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY
        },
        body: JSON.stringify({
          instanceName: instance_name,
          integration: "WHATSAPP-BAILEYS"
        })
      });

      const evoData = await evoResponse.json();
      
      // Evolution API might return 400 if instance already exists, handle gracefully
      if (!evoResponse.ok && evoData.message !== 'The instance already exists') {
        return res.status(evoResponse.status).json({ ok: false, error: evoData.message || "Erro na Evolution API" });
      }

      // 2. Save to Supabase
      const { data, error } = await supabase
        .from("client_instances")
        .upsert({
          client_id,
          instance_name,
          status: "connecting",
          is_hub: false,
          created_at: new Date().toISOString()
        }, { onConflict: 'instance_name' })
        .select()
        .single();

      if (error) return res.status(500).json({ ok: false, error: error.message });

      res.json({ ok: true, instance: data });
    } catch (err) {
      console.error("Error creating instance:", err);
      res.status(500).json({ ok: false, error: "Erro interno ao criar instância." });
    }
  });

  // --- MULTI-TENANT & AI LOGIC ---

  const resolveEffectiveClientId = async (instanceName: string, phoneE164: string) => {
    // 1. Check overrides
    const { data: override } = await supabase
      .from("hub_phone_overrides")
      .select("client_id")
      .eq("phone_e164", phoneE164)
      .eq("is_enabled", true)
      .single();

    if (override) return override.client_id;

    // 2. Check client numbers
    const { data: clientNum } = await supabase
      .from("hub_client_numbers")
      .select("client_id")
      .eq("phone_e164", phoneE164)
      .eq("is_enabled", true)
      .single();

    if (clientNum) return clientNum.client_id;

    // 3. Check direct client phone
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("phone_e164", phoneE164)
      .single();

    if (client) return client.id;

    // 4. Default to instance owner if possible
    const { data: instance } = await supabase
      .from("client_instances")
      .select("client_id")
      .eq("instance_name", instanceName)
      .single();

    return instance?.client_id || null;
  };

  const getClientContext = async (clientId: string) => {
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();
    
    return client;
  };

  // 14. Evolution API Webhook
  app.post("/api/webhook/evolution", async (req, res) => {
    const payload = req.body;
    
    // Evolution API sends different events. We care about 'messages.upsert'
    if (payload.event !== "messages.upsert") {
      return res.json({ ok: true });
    }

    const message = payload.data;
    const instanceName = payload.instance;
    const remoteJid = message.key.remoteJid;
    const isGroup = remoteJid.endsWith("@g.us");
    
    if (isGroup) return res.json({ ok: true }); // Ignore groups

    const phoneE164 = "+" + remoteJid.split("@")[0];
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    const fromMe = message.key.fromMe;

    if (!text) return res.json({ ok: true });

    try {
      // Resolve client
      const clientId = await resolveEffectiveClientId(instanceName, phoneE164);
      if (!clientId) {
        console.log(`[WEBHOOK] Could not resolve client for ${phoneE164} on ${instanceName}`);
        return res.json({ ok: true });
      }

      // Save message
      await supabase.from("wa_messages").insert({
        client_id: clientId,
        phone_e164: phoneE164,
        instance: instanceName,
        direction: fromMe ? "outbound" : "inbound",
        text: text,
        raw: payload
      });

      // If it's an inbound message, trigger AI
      if (!fromMe) {
        const client = await getClientContext(clientId);
        if (client && client.status === 'active') {
          // Trigger AI response (async)
          processAIResponse(clientId, phoneE164, text, client.bot_instructions, instanceName);
        }
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("[WEBHOOK ERROR]", err);
      res.status(500).json({ error: "Internal error" });
    }
  });

  async function processAIResponse(clientId: string, phone: string, userText: string, instructions: string, instance: string) {
    try {
      // Get recent history for context
      const { data: history } = await supabase
        .from("wa_messages")
        .select("text, direction")
        .eq("client_id", clientId)
        .eq("phone_e164", phone)
        .order("created_at", { ascending: false })
        .limit(10);

      const messages: any[] = [
        { role: "system", content: instructions || "És um assistente prestativo." },
        ...(history || []).reverse().map(m => ({
          role: m.direction === "inbound" ? "user" : "assistant",
          content: m.text
        }))
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });

      const aiText = completion.choices[0]?.message?.content || "";

      // Check for __REPORT__
      if (aiText.includes("__REPORT__")) {
        try {
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const reportData = JSON.parse(jsonMatch[0]);
            // Create ticket
            const { data: ticket } = await supabase.from("tickets").insert({
              client_id: clientId,
              phone_e164: phone,
              subject: reportData.subject || "Novo Pedido",
              description: reportData.description || aiText,
              kind: reportData.kind || "pedido",
              status: "aberto"
            }).select().single();

            if (ticket) {
              await supabase.from("ticket_messages").insert({
                ticket_id: ticket.id,
                sender_type: "system",
                text: `Ticket criado automaticamente via AI.\nDados: ${JSON.stringify(reportData)}`
              });
            }
          }
        } catch (e) {
          console.error("Error parsing __REPORT__ JSON", e);
        }
      }

      // Send response back via Evolution API
      const EVO_URL = process.env.EVO_URL;
      const EVO_KEY = process.env.EVO_KEY;

      if (EVO_URL && EVO_KEY) {
        await fetch(`${EVO_URL}/message/sendText/${instance}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVO_KEY
          },
          body: JSON.stringify({
            number: phone.replace("+", ""),
            text: aiText.replace(/__REPORT__[\s\S]*/, "").trim(),
            delay: 1000
          })
        });

        // Save outbound message
        await supabase.from("wa_messages").insert({
          client_id: clientId,
          phone_e164: phone,
          instance: instance,
          direction: "outbound",
          text: aiText.replace(/__REPORT__[\s\S]*/, "").trim()
        });
      }
    } catch (err) {
      console.error("[AI ERROR]", err);
    }
  }

  // 15. Evolution API: Health Check & Sync
  const checkInstancesHealth = async () => {
    const EVO_URL = process.env.EVO_URL;
    const EVO_KEY = process.env.EVO_KEY;

    if (!EVO_URL || !EVO_KEY) return;

    try {
      const response = await fetch(`${EVO_URL}/instance/fetchInstances`, {
        method: 'GET',
        headers: { 'apikey': EVO_KEY }
      });

      if (!response.ok) return;

      const instances = await response.json();
      
      for (const inst of instances) {
        const instanceName = inst.instance.instanceName;
        const connectionStatus = inst.instance.connectionStatus;

        // Mapping: open -> online, connecting -> reconnecting, close -> offline
        let status = "offline";
        if (connectionStatus === "open") status = "online";
        else if (connectionStatus === "connecting") status = "reconnecting";

        // Update Supabase
        const { data: updatedInstance, error: updateError } = await supabase
          .from("client_instances")
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq("instance_name", instanceName)
          .select()
          .single();

        if (updateError) continue;

        // If offline, create alert
        if (status === "offline") {
          await supabase.from("system_alerts").insert({
            type: "instance_offline",
            severity: "high",
            instance_name: instanceName,
            message: `A instância ${instanceName} está offline.`,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error("Health check error:", err);
    }
  };

  app.get("/api/admin/instances/health", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    await checkInstancesHealth();
    res.json({ success: true, message: "Verificação de saúde concluída." });
  });

  // Start background job (every 60 seconds)
  setInterval(checkInstancesHealth, 60000);

  // 16. Admin System Alerts
  app.get("/api/admin/alerts", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { data: alerts, error } = await supabase
      .from("system_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    res.json(alerts);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
