import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // 1. Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Número de WhatsApp é obrigatório." });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

    // Store in Supabase
    const { error } = await supabase
      .from("otps")
      .upsert({ phone, code, expires_at: expiresAt }, { onConflict: "phone" });

    if (error) {
      console.error("Supabase error (OTP):", error);
      return res.status(500).json({ error: "Erro ao processar código OTP." });
    }

    // --- REAL WHATSAPP LOGIC WOULD GO HERE ---
    console.log(`[WHATSAPP OTP] Enviando código ${code} para ${phone}`);
    // ------------------------------------------

    res.json({ success: true, message: "Código enviado com sucesso!" });
  });

  // 2. Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "Número e código são obrigatórios." });
    }

    const { data: row, error: fetchError } = await supabase
      .from("otps")
      .select("*")
      .eq("phone", phone)
      .single();

    if (fetchError || !row) {
      return res.status(400).json({ error: "Nenhum código encontrado para este número." });
    }

    if (row.code !== code) {
      return res.status(400).json({ error: "Código inválido." });
    }

    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: "Código expirado." });
    }

    // Success! Create session
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({ id: sessionId, phone, expires_at: sessionExpiresAt });

    if (sessionError) {
      console.error("Supabase error (Session):", sessionError);
      return res.status(500).json({ error: "Erro ao criar sessão." });
    }

    // Set cookie
    res.cookie("hub_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Clean up OTP
    await supabase.from("otps").delete().eq("phone", phone);

    res.json({ success: true, message: "Login efetuado com sucesso!" });
  });

  // 3. Check Session
  app.get("/api/auth/session", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada ou inválida." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    res.json({ 
      authenticated: true, 
      phone: session.phone, 
      client_id: client?.client_id 
    });
  });

  // 4. Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    const phone = session.phone;
    
    // Get client_id from clients table using phone
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", phone)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente não encontrado no Supabase." });
    }

    const clientId = client.client_id;

    // 1. Messages count
    const { count: messagesCount, error: msgError } = await supabase
      .from("wa_messages")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId);

    // 2. Tickets stats
    const { count: totalTickets, error: ticketError } = await supabase
      .from("tickets")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId);

    const { count: openTickets, error: openError } = await supabase
      .from("tickets")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId)
      .in("status", ["aberto", "em análise"]);

    const { count: complaints, error: complaintError } = await supabase
      .from("tickets")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId)
      .eq("type", "reclamação");

    // 3. Instance info
    const { data: instance, error: instanceError } = await supabase
      .from("client_instances")
      .select("*")
      .eq("client_id", clientId)
      .single();

    // 5. Recent Activity
    const { data: recentTickets, error: rtError } = await supabase
      .from("tickets")
      .select("subject, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentMessages, error: rmError } = await supabase
      .from("wa_messages")
      .select("content, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    const activity = [
      ...(recentTickets || []).map(t => ({ type: 'ticket', title: t.subject, status: t.status, created_at: t.created_at })),
      ...(recentMessages || []).map(m => ({ type: 'message', title: m.content, status: 'enviada', created_at: m.created_at }))
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    res.json({
      stats: {
        messages: messagesCount || 0,
        totalTickets: totalTickets || 0,
        openTickets: openTickets || 0,
        complaints: complaints || 0,
      },
      instance: instance || null,
      subscription: client || null,
      activity: activity
    });
  });

  // 5. Logout
  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (sessionId) {
      await supabase.from("sessions").delete().eq("id", sessionId);
    }
    res.clearCookie("hub_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ success: true });
  });

  // 6. Get Conversations
  app.get("/api/messages/conversations", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });

    // Fetch messages to group into conversations
    // We fetch more to ensure we get several unique conversations
    const { data: messages, error } = await supabase
      .from("wa_messages")
      .select("text, direction, created_at, phone_e164, type")
      .eq("client_id", client.client_id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) return res.status(500).json({ error: error.message });

    // Group by phone_e164
    const conversationsMap = new Map();
    (messages || []).forEach(msg => {
      if (!conversationsMap.has(msg.phone_e164)) {
        conversationsMap.set(msg.phone_e164, {
          phone_e164: msg.phone_e164,
          lastMsg: msg.text,
          time: msg.created_at,
          direction: msg.direction,
          type: msg.type || 'Interação'
        });
      }
    });

    res.json(Array.from(conversationsMap.values()));
  });

  // 7. Get Message History
  app.get("/api/messages/history/:phone", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    const { phone } = req.params;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });

    const { data: messages, error } = await supabase
      .from("wa_messages")
      .select("text, direction, created_at, phone_e164, type")
      .eq("client_id", client.client_id)
      .eq("phone_e164", phone)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });

    res.json(messages.reverse()); // Return in chronological order for the UI
  });

  // 8. Get Tickets
  app.get("/api/tickets", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });

    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("client_id", client.client_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(tickets);
  });

  // 9. Get Ticket Messages
  app.get("/api/tickets/:id/messages", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    const { id } = req.params;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });

    // First verify the ticket belongs to the client
    const { data: ticket } = await supabase
      .from("tickets")
      .select("id")
      .eq("id", id)
      .eq("client_id", client.client_id)
      .single();

    if (!ticket) return res.status(403).json({ error: "Acesso negado." });

    const { data: messages, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array as per requirements
      if (error.code === 'PGRST116' || error.message.includes('relation "ticket_messages" does not exist')) {
        return res.json([]);
      }
      return res.status(500).json({ error: error.message });
    }

    res.json(messages);
  });

  // 10. Get Instance Details
  app.get("/api/instance", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client_id
    const { data: client } = await supabase
      .from("clients")
      .select("client_id")
      .eq("phone", session.phone)
      .single();

    if (!client) return res.status(404).json({ error: "Cliente não encontrado." });

    const clientId = client.client_id;

    // 1. Instance info
    const { data: instance, error: instanceError } = await supabase
      .from("client_instances")
      .select("*")
      .eq("client_id", clientId)
      .single();

    // 2. Stats for the instance page
    // Messages count
    const { count: messagesCount } = await supabase
      .from("wa_messages")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId);

    const { count: sentMessages } = await supabase
      .from("wa_messages")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId)
      .eq("direction", "sent");

    const { count: receivedMessages } = await supabase
      .from("wa_messages")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId)
      .eq("direction", "received");

    // Tickets stats
    const { count: totalTickets } = await supabase
      .from("tickets")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId);

    const { count: complaints } = await supabase
      .from("tickets")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", clientId)
      .eq("type", "reclamação");

    res.json({
      instance: instance || null,
      stats: {
        totalMessages: messagesCount || 0,
        sentMessages: sentMessages || 0,
        receivedMessages: receivedMessages || 0,
        totalTickets: totalTickets || 0,
        complaints: complaints || 0,
      }
    });
  });

  // 11. Get Subscription Details
  app.get("/api/subscription", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", session.phone)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const clientId = client.client_id;

    // Fetch usage stats
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
      .eq("type", "reclamação");

    // Mock limits for now (could be in a plans table in a real app)
    const limits = {
      messages: 10000,
      tickets: 500,
      complaints: 100
    };

    res.json({
      client,
      usage: {
        messages: { used: messagesCount || 0, limit: limits.messages },
        tickets: { used: totalTickets || 0, limit: limits.tickets },
        complaints: { used: complaints || 0, limit: limits.complaints }
      }
    });
  });

  // 12. Get Client Settings
  app.get("/api/client/settings", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", session.phone)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    res.json(client);
  });

  // 13. Update Client Settings
  app.patch("/api/client/settings", async (req, res) => {
    const sessionId = req.cookies.hub_session;
    if (!sessionId) return res.status(401).json({ error: "Não autenticado." });

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão expirada." });
    }

    const { company_name, email, bot_instructions } = req.body;

    const { data: updatedClient, error: updateError } = await supabase
      .from("clients")
      .update({ company_name, email, bot_instructions })
      .eq("phone", session.phone)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Erro ao atualizar definições." });
    }

    res.json(updatedClient);
  });

  // --- ADMIN API ROUTES ---

  // 1. Admin Login
  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    // In a real app, we would verify against an 'admins' table
    // For this demo, we'll use a hardcoded admin if the table doesn't exist or for simplicity
    // But let's try to fetch from 'admins' table first
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    // Mock admin for demo if table doesn't exist or is empty
    const isMockAdmin = email === "admin@tratatudo.com" && password === "admin123";
    
    if (!isMockAdmin && (error || !admin || admin.password !== password)) {
      return res.status(401).json({ error: "Credenciais de administrador inválidas." });
    }

    const adminData = admin || { email: "admin@tratatudo.com", role: "superadmin" };

    // Create admin session
    const sessionId = "admin_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const sessionExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours

    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({ id: sessionId, phone: "admin", expires_at: sessionExpiresAt });

    if (sessionError) {
      console.error("Supabase error (Admin Session):", sessionError);
      return res.status(500).json({ error: "Erro ao criar sessão administrativa." });
    }

    // Set cookie
    res.cookie("tratatudo_admin_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.json({ success: true, email: adminData.email, role: adminData.role });
  });

  // 2. Admin Session Check
  app.get("/api/admin/auth/session", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId || !sessionId.startsWith("admin_")) {
      return res.status(401).json({ error: "Não autenticado como admin." });
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: "Sessão administrativa expirada." });
    }

    res.json({ authenticated: true, email: "admin@tratatudo.com", role: "superadmin" });
  });

  // 3. Admin Logout
  app.post("/api/admin/auth/logout", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (sessionId) {
      await supabase.from("sessions").delete().eq("id", sessionId);
    }
    res.clearCookie("tratatudo_admin_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ success: true });
  });

  // 4. Admin Dashboard Stats
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    // Global stats
    const { count: totalClients } = await supabase.from("clients").select("*", { count: 'exact', head: true });
    const { count: onlineInstances } = await supabase.from("client_instances").select("*", { count: 'exact', head: true }).eq("status", "online");
    const { count: messagesToday } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true });
    const { count: openTickets } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).in("status", ["aberto", "em análise"]);

    // Recent activity (mix of clients, tickets, instances)
    const { data: recentClients } = await supabase.from("clients").select("company_name, created_at").order("created_at", { ascending: false }).limit(3);
    const { data: recentTickets } = await supabase.from("tickets").select("subject, status, created_at").order("created_at", { ascending: false }).limit(3);
    const { data: recentInstances } = await supabase.from("client_instances").select("instance_name, status, updated_at").order("updated_at", { ascending: false }).limit(3);

    const activity = [
      ...(recentClients || []).map(c => ({ type: 'client', title: `Novo cliente: ${c.company_name}`, status: 'novo', created_at: c.created_at })),
      ...(recentTickets || []).map(t => ({ type: 'ticket', title: `Ticket: ${t.subject}`, status: t.status, created_at: t.created_at })),
      ...(recentInstances || []).map(i => ({ type: 'instance', title: `Instância: ${i.instance_name}`, status: i.status, created_at: i.updated_at }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

    res.json({
      stats: {
        totalClients: totalClients || 0,
        onlineInstances: onlineInstances || 0,
        messagesToday: messagesToday || 0,
        openTickets: openTickets || 0,
      },
      recentActivity: activity,
      systemHealth: {
        status: 'healthy',
        uptime: '14 dias, 6 horas',
        lastBackup: new Date().toISOString()
      }
    });
  });

  // 5. Admin Clients List
  app.get("/api/admin/clients", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(clients);
  });

  // 6. Admin Update Client Status
  app.patch("/api/admin/clients/:id/status", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from("clients")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // 7. Admin Instances List
  app.get("/api/admin/instances", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    // Join with clients to get company name
    const { data: instances, error } = await supabase
      .from("client_instances")
      .select(`
        *,
        clients (company_name)
      `)
      .order("updated_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    
    // Flatten the result
    const result = (instances || []).map(inst => ({
      ...inst,
      company_name: (inst.clients as any)?.company_name || 'Desconhecido'
    }));

    res.json(result);
  });

  // 8. Admin Global Messages
  app.get("/api/admin/messages", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { data: messages, error } = await supabase
      .from("wa_messages")
      .select(`
        *,
        clients (company_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });

    const result = (messages || []).map(msg => ({
      ...msg,
      company_name: (msg.clients as any)?.company_name || 'Desconhecido'
    }));

    res.json(result);
  });

  // 9. Admin Global Tickets
  app.get("/api/admin/tickets", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`
        *,
        clients (company_name)
      `)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const result = (tickets || []).map(t => ({
      ...t,
      company_name: (t.clients as any)?.company_name || 'Desconhecido'
    }));

    res.json(result);
  });

  // 10. Admin Update Ticket Status
  app.patch("/api/admin/tickets/:id/status", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // 11. Admin Subscriptions
  app.get("/api/admin/subscriptions", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, client_id, company_name, plan, status, created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Mock some billing data for the UI
    const result = (clients || []).map(c => ({
      ...c,
      amount: c.plan === 'pro' ? 49.90 : c.plan === 'enterprise' ? 199.00 : 0,
      next_billing: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    }));

    res.json(result);
  });

  // 12. Admin System Logs
  app.get("/api/admin/logs", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    // In a real app, we would have a 'logs' table
    // For now, let's return some mock logs to demonstrate the UI
    const mockLogs = [
      { id: '1', level: 'error', source: 'whatsapp', message: 'Falha na ligação à instância INST-001', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: '2', level: 'warning', source: 'api', message: 'Latência elevada detectada na API do WhatsApp', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: '3', level: 'info', source: 'auth', message: 'Novo administrador autenticado: admin@tratatudo.com', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: '4', level: 'error', source: 'database', message: 'Timeout na consulta de estatísticas globais', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: '5', level: 'info', source: 'api', message: 'Backup diário concluído com sucesso', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: '6', level: 'critical', source: 'server', message: 'Utilização de CPU acima de 95% no nó principal', created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    ];

    res.json(mockLogs);
  });

  // 13. Evolution API: Create Instance
  app.post("/api/admin/instances/create", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { client_id } = req.body;
    if (!client_id) return res.status(400).json({ error: "client_id é obrigatório." });

    const instance_name = `client-${client_id}`;
    const EVO_URL = process.env.EVO_URL;
    const EVO_KEY = process.env.EVO_KEY;

    if (!EVO_URL || !EVO_KEY) {
      return res.status(500).json({ error: "Configuração da Evolution API em falta (EVO_URL/EVO_KEY)." });
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
        return res.status(evoResponse.status).json({ error: evoData.message || "Erro na Evolution API" });
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

      if (error) return res.status(500).json({ error: error.message });

      res.json({ success: true, instance: data });
    } catch (err) {
      console.error("Error creating instance:", err);
      res.status(500).json({ error: "Erro interno ao criar instância." });
    }
  });

  // 14. Evolution API: Get QR Code
  app.get("/api/admin/instances/qrcode/:instance", async (req, res) => {
    const sessionId = req.cookies.tratatudo_admin_session;
    if (!sessionId) return res.status(401).json({ error: "Não autorizado." });

    const { instance } = req.params;
    const EVO_URL = process.env.EVO_URL;
    const EVO_KEY = process.env.EVO_KEY;

    if (!EVO_URL || !EVO_KEY) {
      return res.status(500).json({ error: "Configuração da Evolution API em falta." });
    }

    try {
      const evoResponse = await fetch(`${EVO_URL}/instance/connect/${instance}`, {
        method: 'GET',
        headers: {
          'apikey': EVO_KEY
        }
      });

      const evoData = await evoResponse.json();
      
      if (!evoResponse.ok) {
        return res.status(evoResponse.status).json({ error: evoData.message || "Erro ao obter QR Code" });
      }

      // Evolution API returns QR code in different formats depending on version/config
      // Usually it's in evoData.base64 or similar
      res.json(evoData);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      res.status(500).json({ error: "Erro interno ao obter QR Code." });
    }
  });

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
