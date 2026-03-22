import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Groq from "groq-sdk";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import path from "path";
import { UserRole, PermissionAction, PermissionModule, ROLE_PERMISSIONS } from "./src/types/hub";

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

// Use Service Role Key for backend operations to bypass RLS
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// AI Rate Limiter
const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { ok: false, error: "Limite de requisições de IA excedido. Tente novamente em 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-v2-secret-key-2026";
const EVO_URL = (process.env.EVO_URL || "").replace(/\/$/, ""); 
const EVO_KEY = process.env.EVO_KEY || "";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3002);

  app.use(cors({
    origin: ["https://app.tratatudo.pt", "https://tratatudo.pt", "https://www.tratatudo.pt", process.env.APP_URL].filter(Boolean) as string[],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }));

  // Stripe Webhook
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: any, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const clientId = session.metadata.clientId;
      await supabase.from("clients").update({ stripe_customer_id: session.customer, status: 'active' }).eq("id", clientId);
      await supabase.from("subscriptions").upsert({
        client_id: clientId,
        stripe_subscription_id: session.subscription,
        status: 'active',
        plan: 'Pro',
        updated_at: new Date().toISOString()
      });
    } else if (event.type === "customer.subscription.deleted") {
      const subDeleted = event.data.object as any;
      await supabase.from("subscriptions").update({ status: 'canceled' }).eq("stripe_subscription_id", subDeleted.id);
    }
    res.json({ received: true });
  });

  app.use(express.json());
  app.use(cookieParser());

  // --- Middlewares ---
  const requireClientSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.hub_session;
    if (!token) return res.status(401).json({ ok: false, error: "Não autenticado." });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { data: client } = await supabase.from("clients").select("*").eq("id", decoded.clientId).single();
      if (!client) return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      
      req.client = client;
      req.clientId = client.id;
      req.userRole = decoded.role || 'visualizador';
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.clearCookie("hub_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
  };

  const requirePermission = (module: string, action: string) => {
    return (req: any, res: any, next: any) => {
      const role = req.userRole;
      const permissions = ROLE_PERMISSIONS[role as UserRole];
      
      if (!permissions || !permissions[module as PermissionModule]?.includes(action as PermissionAction)) {
        return res.status(403).json({ ok: false, error: "Acesso negado. Permissões insuficientes." });
      }
      next();
    };
  };

  const requireAdminSession = async (req: any, res: any, next: any) => {
    const token = req.cookies.tratatudo_admin_session;
    if (!token) return res.status(401).json({ ok: false, error: "Não autorizado." });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded.isAdmin) throw new Error("Not admin");
      const { data: admin } = await supabase.from("admins").select("*").eq("user_id", decoded.userId).single();
      if (!admin) return res.status(403).json({ ok: false, error: "Acesso administrativo negado." });
      req.admin = admin;
      req.adminId = decoded.userId;
      next();
    } catch (err) {
      res.clearCookie("tratatudo_admin_session");
      return res.status(401).json({ ok: false, error: "Sessão administrativa expirada." });
    }
  };

  // --- API Routes ---
  app.get("/api/health", (req, res) => res.json({ ok: true, status: "healthy" }));

  // Auth
  app.post("/api/auth/send-otp", async (req, res) => {
    let { phone_e164 } = req.body;
    if (!phone_e164) return res.status(400).json({ ok: false, error: "Número obrigatório." });
    phone_e164 = normalizePhone(phone_e164);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    await supabase.from("auth_otps").update({ used_at: new Date().toISOString() }).eq("phone_e164", phone_e164).is("used_at", null);
    const { error } = await supabase.from("auth_otps").insert({ phone_e164, code_hash: codeHash, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), purpose: 'hub_login' });
    if (error) return res.status(500).json({ ok: false, error: "Erro ao gerar código." });
    try {
      const { data: client } = await supabase.from("clients").select("id").eq("phone_e164", phone_e164).single();
      await sendWhatsAppNotification(client?.id || "hub", phone_e164, `O seu código TrataTudo é: ${code}`);
      res.json({ ok: true, message: "Código enviado!" });
    } catch (err: any) {
      res.json({ ok: true, message: "Código gerado mas falha no envio", error: err.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    let { phone_e164, code } = req.body;
    phone_e164 = normalizePhone(phone_e164);
    const { data: otp } = await supabase.from("auth_otps").select("*").eq("phone_e164", phone_e164).is("used_at", null).order("created_at", { ascending: false }).limit(1).single();
    if (!otp || new Date(otp.expires_at) < new Date()) return res.status(400).json({ ok: false, error: "Código inválido ou expirado." });
    if (!(await bcrypt.compare(code, otp.code_hash))) return res.status(400).json({ ok: false, error: "Código incorreto." });
    
    await supabase.from("auth_otps").update({ used_at: new Date().toISOString() }).eq("id", otp.id);
    
    // Check if user is a client user
    const { data: clientUser } = await supabase.from("client_users").select("*").eq("email", phone_e164).single(); // Assuming login by phone/email
    
    let client;
    let role: UserRole = 'visualizador';
    let userId;

    if (clientUser) {
      const { data: c } = await supabase.from("clients").select("id, company_name, phone_e164").eq("id", clientUser.client_id).single();
      client = c;
      role = clientUser.role as UserRole;
      userId = clientUser.id;
    } else {
      // Check if user is the main client owner
      const { data: c } = await supabase.from("clients").select("id, company_name, phone_e164").eq("phone_e164", phone_e164).single();
      if (c) {
        client = c;
        role = 'admin';
        userId = c.id;
      }
    }

    if (!client) return res.status(404).json({ ok: false, error: "Utilizador não registado." });
    
    const token = jwt.sign({ 
      clientId: client.id, 
      phone_e164: client.phone_e164,
      role,
      userId
    }, JWT_SECRET, { expiresIn: "24h" });
    
    res.cookie("hub_session", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ ok: true, client: { ...client, role } });
  });

  app.get("/api/auth/session", async (req, res) => {
    const token = req.cookies.hub_session;
    if (!token) return res.json({ ok: true, authenticated: false });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { data: client } = await supabase.from("clients").select("id, company_name, phone_e164").eq("id", decoded.clientId).single();
      if (!client) throw new Error();
      res.json({ ok: true, authenticated: true, ...client, role: decoded.role, userId: decoded.userId });
    } catch {
      res.clearCookie("hub_session");
      res.json({ ok: true, authenticated: false });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("hub_session", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    res.json({ ok: true });
  });

  // Client Dashboard & Stats
  app.get("/api/client/dashboard/stats", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    try {
      const { count: msgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", clientId);
      const { count: tks } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", clientId);
      const { data: inst } = await supabase.from("client_instances").select("*").eq("client_id", clientId).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("client_id", clientId).single();
      
      const { count: complaints } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("kind", "reclamacao");
      const { count: sentMsgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("direction", "outbound");
      const { count: receivedMsgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("direction", "inbound");

      res.json({ 
        ok: true, 
        stats: { 
          messages: msgs || 0, 
          totalMessages: msgs || 0,
          sentMessages: sentMsgs || 0,
          receivedMessages: receivedMsgs || 0,
          totalTickets: tks || 0,
          complaints: complaints || 0
        }, 
        instance: inst, 
        subscription: sub || { plan: 'Trial', status: 'active' } 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Client Instance
  app.get("/api/client/instance", requireClientSession, async (req: any, res) => {
    const { data: instance, error } = await supabase.from("client_instances").select("*").eq("client_id", req.clientId).single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ ok: false, error: error.message });
    
    // Fetch stats for the instance page
    const { count: msgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId);
    const { count: tks } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId);
    const { count: complaints } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId).eq("kind", "reclamacao");
    const { count: sentMsgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId).eq("direction", "outbound");
    const { count: receivedMsgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId).eq("direction", "inbound");

    res.json({ 
      ok: true, 
      instance,
      stats: {
        totalMessages: msgs || 0,
        sentMessages: sentMsgs || 0,
        receivedMessages: receivedMsgs || 0,
        totalTickets: tks || 0,
        complaints: complaints || 0
      }
    });
  });

  app.post("/api/client/instance/sync", requireClientSession, async (req: any, res) => {
    // In a real app, this would trigger a sync with Evolution API
    // For now, we'll just update the last_activity
    const { data, error } = await supabase.from("client_instances")
      .update({ last_activity: new Date().toISOString() })
      .eq("client_id", req.clientId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, instance: data });
  });

  // Client Subscription
  app.get("/api/client/subscription", requireClientSession, async (req: any, res) => {
    const { data: sub, error } = await supabase.from("subscriptions").select("*").eq("client_id", req.clientId).single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ ok: false, error: error.message });
    
    const { count: msgs } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId);
    const { count: tks } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId);
    const { count: complaints } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).eq("client_id", req.clientId).eq("kind", "reclamacao");

    res.json({ 
      ok: true, 
      subscription: sub || { 
        plan: 'Trial', 
        status: 'Ativo', 
        started_at: req.client.created_at,
        ends_at: new Date(new Date(req.client.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      usage: {
        messages: msgs || 0,
        tickets: tks || 0,
        complaints: complaints || 0
      }
    });
  });

  app.post("/api/client/stripe/checkout", requireClientSession, async (req: any, res) => {
    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ ok: false, error: "Price ID obrigatório." });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/app/subscription?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/app/subscription?canceled=true`,
        metadata: { clientId: req.clientId },
        customer_email: req.client.email || undefined,
      });

      res.json({ ok: true, url: session.url });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/client/stripe/portal", requireClientSession, async (req: any, res) => {
    try {
      if (!req.client.stripe_customer_id) {
        return res.status(400).json({ ok: false, error: "Cliente sem ID Stripe. Por favor, realize um pagamento primeiro." });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: req.client.stripe_customer_id,
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}/app/subscription`,
      });

      res.json({ ok: true, url: session.url });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Client AI Chat
  app.post("/api/client/ai/chat", requireClientSession, aiRateLimiter, async (req: any, res) => {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ ok: false, error: "Mensagem obrigatória." });

    try {
      const systemPrompt = `Você é o assistente inteligente do TrataTudo Hub. 
      Seu papel é ajudar o utilizador (${req.client.company_name}) a gerir o seu negócio.
      Você tem acesso a Pedidos, Reclamações e Vendas.
      Seja profissional, prestativo e direto. Use português de Portugal.
      Ajude a resumir tickets, sugerir próximas ações e orientar nas tarefas do Hub.
      Instruções específicas do bot: ${req.client.bot_instructions || 'Nenhuma instrução específica.'}`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ];

      const completion = await groq.chat.completions.create({
        messages: messages as any,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || "Desculpe, não consegui processar o seu pedido.";
      res.json({ ok: true, text: responseText });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      res.status(500).json({ ok: false, error: "IA temporariamente indisponível. Tente novamente mais tarde." });
    }
  });

  app.post("/api/client/tickets/:id/analyze", requireClientSession, aiRateLimiter, async (req: any, res) => {
    const { id } = req.params;
    try {
      const { data: ticket } = await supabase.from("tickets").select("*").eq("id", id).eq("client_id", req.clientId).single();
      if (!ticket) return res.status(404).json({ ok: false, error: "Ticket não encontrado." });

      const { data: messages } = await supabase.from("ticket_messages").select("*").eq("ticket_id", id).order("created_at", { ascending: true });
      const conversation = messages?.map(m => `${m.sender_type === 'user' ? 'Cliente' : 'Suporte'}: ${m.text}`).join("\n") || ticket.description;

      const prompt = `Analise o seguinte ticket de suporte e forneça um resumo, causa provável, sentimento do cliente, solução sugerida e próximos passos.
      Assunto: ${ticket.subject}
      Descrição: ${ticket.description}
      Conversa:
      ${conversation}
      
      Responda APENAS em formato JSON válido com esta estrutura:
      {
        "summary": "...",
        "probable_cause": "...",
        "sentiment": "...",
        "suggested_solution": "...",
        "next_steps": ["...", "..."]
      }`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "És um assistente de suporte especializado em análise de tickets. Responde sempre em JSON." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json({ ok: true, analysis });
    } catch (err: any) {
      console.error("[AI Analysis Error]:", err);
      res.status(500).json({ ok: false, error: "IA temporariamente indisponível." });
    }
  });

  // Client Tickets
  app.get("/api/client/tickets", requireClientSession, requirePermission('tickets', 'view'), async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, client_profiles(company_name)").eq("client_id", req.clientId).order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, client_name: (t.client_profiles as any)?.company_name })) });
  });

  // Client CRM (Profiles)
  app.get("/api/client/profiles", requireClientSession, requirePermission('clients', 'view'), async (req: any, res) => {
    const { data: profiles, error } = await supabase.from("client_profiles")
      .select("*")
      .eq("client_id", req.clientId)
      .order("company_name", { ascending: true });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, profiles });
  });

  app.get("/api/client/profiles/:id", requireClientSession, async (req: any, res) => {
    const { id } = req.params;
    const { data: profile, error } = await supabase.from("client_profiles")
      .select("*, tickets(*), documents(*), emails(*), calendar_events(*), financial_documents(*)")
      .eq("id", id)
      .eq("client_id", req.clientId)
      .single();
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, profile });
  });

  app.post("/api/client/profiles", requireClientSession, requirePermission('clients', 'create'), async (req: any, res) => {
    const profileData = { ...req.body, client_id: req.clientId };
    const { data, error } = await supabase.from("client_profiles").insert(profileData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, profile: data });
  });

  // Client Team (Users)
  app.get("/api/client/users", requireClientSession, requirePermission('team', 'view'), async (req: any, res) => {
    const { data: users, error } = await supabase.from("client_users")
      .select("*")
      .eq("client_id", req.clientId)
      .order("name", { ascending: true });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, users });
  });

  app.post("/api/client/users", requireClientSession, requirePermission('team', 'create'), async (req: any, res) => {
    const userData = { ...req.body, client_id: req.clientId, status: 'invited' };
    const { data, error } = await supabase.from("client_users").insert(userData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, user: data });
  });

  app.patch("/api/client/users/:id", requireClientSession, async (req: any, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("client_users")
      .update(req.body)
      .eq("id", id)
      .eq("client_id", req.clientId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, user: data });
  });

  // Client Tasks
  app.get("/api/client/tasks", requireClientSession, async (req: any, res) => {
    const { data: tasks, error } = await supabase.from("tasks")
      .select("*, client_profiles(company_name), client_users(name)")
      .eq("client_id", req.clientId)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, tasks });
  });

  app.post("/api/client/tasks", requireClientSession, async (req: any, res) => {
    const taskData = { ...req.body, client_id: req.clientId };
    const { data, error } = await supabase.from("tasks").insert(taskData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, task: data });
  });

  app.patch("/api/client/tasks/:id", requireClientSession, async (req: any, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("tasks")
      .update(req.body)
      .eq("id", id)
      .eq("client_id", req.clientId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, task: data });
  });

  // Client Calendar Events
  app.get("/api/client/calendar-events", requireClientSession, async (req: any, res) => {
    const { data: events, error } = await supabase.from("calendar_events")
      .select("*, client_profiles(company_name), client_users(name)")
      .eq("client_id", req.clientId)
      .order("start_at", { ascending: true });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, events });
  });

  app.post("/api/client/calendar-events", requireClientSession, async (req: any, res) => {
    const eventData = { ...req.body, client_id: req.clientId };
    const { data, error } = await supabase.from("calendar_events").insert(eventData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, event: data });
  });

  app.patch("/api/client/calendar-events/:id", requireClientSession, async (req: any, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("calendar_events")
      .update(req.body)
      .eq("id", id)
      .eq("client_id", req.clientId)
      .select()
      .single();
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, event: data });
  });

  // Client Documents
  app.get("/api/client/documents", requireClientSession, async (req: any, res) => {
    const { data: documents, error } = await supabase.from("documents")
      .select("*, client_users(name)")
      .eq("client_id", req.clientId)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, documents });
  });

  app.post("/api/client/documents", requireClientSession, async (req: any, res) => {
    const docData = { ...req.body, client_id: req.clientId };
    const { data, error } = await supabase.from("documents").insert(docData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, document: data });
  });

  // Client Financial Documents
  app.get("/api/client/financial-documents", requireClientSession, requirePermission('financial', 'view'), async (req: any, res) => {
    const { data: documents, error } = await supabase.from("financial_documents")
      .select("*")
      .eq("client_id", req.clientId)
      .order("issue_date", { ascending: false });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, documents });
  });

  app.post("/api/client/financial-documents", requireClientSession, async (req: any, res) => {
    const docData = { ...req.body, client_id: req.clientId };
    const { data, error } = await supabase.from("financial_documents").insert(docData).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, document: data });
  });

  // Client Emails
  app.get("/api/client/emails", requireClientSession, async (req: any, res) => {
    const { data: emails, error } = await supabase.from("emails")
      .select("*")
      .eq("client_id", req.clientId)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, emails });
  });

  // Client Automations
  app.get("/api/client/automations", requireClientSession, requirePermission('automations', 'view'), async (req: any, res) => {
    const { data: automations, error } = await supabase.from("automations")
      .select("*")
      .eq("client_id", req.clientId)
      .order("created_at", { ascending: false });
    
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, automations });
  });

  // WhatsApp / Conversations
  app.get("/api/client/whatsapp/conversations", requireClientSession, requirePermission('whatsapp', 'view'), async (req: any, res) => {
    try {
      const { search, instance } = req.query;
      
      // 1. Get all messages for this client
      let query = supabase.from("wa_messages")
        .select("*")
        .eq("client_id", req.clientId)
        .order("created_at", { ascending: false });

      if (instance) {
        query = query.eq("instance", instance);
      }

      const { data: messages, error: msgError } = await query;
      if (msgError) throw msgError;

      // 2. Aggregate into conversations
      const conversationsMap = new Map();
      
      for (const msg of messages || []) {
        if (!conversationsMap.has(msg.phone_e164)) {
          conversationsMap.set(msg.phone_e164, {
            phone_e164: msg.phone_e164,
            last_message: msg.text,
            last_message_at: msg.created_at,
            instance: msg.instance,
            direction: msg.direction,
            unread_count: 0 // Placeholder for now
          });
        }
      }

      let conversations = Array.from(conversationsMap.values());

      // 3. Link with profiles and tickets
      const phones = conversations.map(c => c.phone_e164);
      
      const [ { data: profiles }, { data: tickets } ] = await Promise.all([
        supabase.from("client_profiles").select("id, company_name, contact_name, phone_e164").eq("client_id", req.clientId).in("phone_e164", phones),
        supabase.from("tickets").select("id, tracking_code, status, phone_e164").eq("client_id", req.clientId).in("phone_e164", phones).neq("status", "concluído")
      ]);

      conversations = conversations.map(c => {
        const profile = profiles?.find(p => p.phone_e164 === c.phone_e164);
        const ticket = tickets?.find(t => t.phone_e164 === c.phone_e164);
        
        return {
          ...c,
          display_name: profile?.company_name || profile?.contact_name || c.phone_e164,
          linked_client_id: profile?.id,
          linked_ticket_id: ticket?.id,
          ticket_status: ticket?.status,
          ticket_tracking_code: ticket?.tracking_code
        };
      });

      // 4. Filter by search
      if (search) {
        const s = (search as string).toLowerCase();
        conversations = conversations.filter(c => 
          c.phone_e164.includes(s) || 
          c.display_name?.toLowerCase().includes(s) || 
          c.last_message.toLowerCase().includes(s)
        );
      }

      res.json({ ok: true, conversations });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/whatsapp/conversations/:phone/messages", requireClientSession, requirePermission('whatsapp', 'view'), async (req: any, res) => {
    try {
      const { phone } = req.params;
      const { data: messages, error } = await supabase.from("wa_messages")
        .select("*")
        .eq("client_id", req.clientId)
        .eq("phone_e164", phone)
        .order("created_at", { ascending: true });

      if (error) throw error;
      res.json({ ok: true, messages });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/whatsapp/instances", requireClientSession, requirePermission('whatsapp', 'view'), async (req: any, res) => {
    try {
      const { data: instances, error } = await supabase.from("client_instances")
        .select("*")
        .eq("client_id", req.clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ ok: true, instances });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/whatsapp/stats", requireClientSession, requirePermission('whatsapp', 'view'), async (req: any, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ { count: totalConversations }, { count: messagesToday }, { data: instances }, { count: conversationsWithTickets } ] = await Promise.all([
        supabase.from("wa_messages").select("phone_e164", { count: 'exact', head: true }).eq("client_id", req.clientId),
        supabase.from("wa_messages").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId).gte("created_at", today.toISOString()),
        supabase.from("client_instances").select("status").eq("client_id", req.clientId),
        supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId).neq("status", "concluído").not("phone_e164", "is", null)
      ]);

      // Note: totalConversations count is tricky with head: true and grouping. 
      // For simplicity in this phase, we'll use a more direct approach if needed, 
      // but head: true on a select with phone_e164 might not give unique count.
      // Let's just return what we have for now.

      res.json({ 
        ok: true, 
        stats: {
          totalConversations: totalConversations || 0,
          messagesToday: messagesToday || 0,
          activeInstances: instances?.filter(i => i.status === 'open').length || 0,
          conversationsWithTickets: conversationsWithTickets || 0
        } 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Client Dashboard Operational Metrics
  app.get("/api/client/dashboard/operational-metrics", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    try {
      const [
        { count: totalClients },
        { count: activeClients },
        { count: totalTasks },
        { count: pendingTasks },
        { count: totalEvents },
        { count: upcomingEvents },
        { count: totalDocs },
        { count: totalFinDocs },
        { count: overdueFinDocs },
        { count: totalEmails },
        { count: totalAutos },
        { count: activeAutos },
        { count: failedAutos }
      ] = await Promise.all([
        supabase.from("client_profiles").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("client_profiles").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("customer_type", "Ativo"),
        supabase.from("tasks").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("tasks").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("status", "pendente"),
        supabase.from("calendar_events").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("calendar_events").select("*", { count: 'exact', head: true }).eq("client_id", clientId).gte("start_at", new Date().toISOString()),
        supabase.from("documents").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("financial_documents").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("financial_documents").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("status", "atrasado"),
        supabase.from("emails").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("automations").select("*", { count: 'exact', head: true }).eq("client_id", clientId),
        supabase.from("automations").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("status", "ativa"),
        supabase.from("automations").select("*", { count: 'exact', head: true }).eq("client_id", clientId).eq("status", "falha")
      ]);

      const [
        { data: recentClients },
        { data: recentTasks },
        { data: recentEvents },
        { data: recentDocs },
        { data: recentEmails },
        { data: recentFinDocs }
      ] = await Promise.all([
        supabase.from("client_profiles").select("id, company_name, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3),
        supabase.from("tasks").select("id, title, status, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3),
        supabase.from("calendar_events").select("id, title, start_at, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3),
        supabase.from("documents").select("id, title, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3),
        supabase.from("emails").select("id, subject, status, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3),
        supabase.from("financial_documents").select("id, document_number, status, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(3)
      ]);

      const activities: any[] = [
        ...(recentClients || []).map(c => ({ id: c.id, type: 'cliente', title: 'Novo Cliente', description: c.company_name, created_at: c.created_at })),
        ...(recentTasks || []).map(t => ({ id: t.id, type: 'tarefa', title: 'Tarefa Atualizada', description: t.title, created_at: t.created_at, status: t.status })),
        ...(recentEvents || []).map(e => ({ id: e.id, type: 'evento', title: 'Próximo Evento', description: e.title, created_at: e.created_at })),
        ...(recentDocs || []).map(d => ({ id: d.id, type: 'documento', title: 'Novo Documento', description: d.title, created_at: d.created_at })),
        ...(recentEmails || []).map(em => ({ id: em.id, type: 'email', title: 'Email', description: em.subject, created_at: em.created_at, status: em.status })),
        ...(recentFinDocs || []).map(f => ({ id: f.id, type: 'financeiro', title: 'Documento Financeiro', description: f.document_number, created_at: f.created_at, status: f.status }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      res.json({
        ok: true,
        metrics: {
          total_clients: totalClients || 0,
          active_clients: activeClients || 0,
          new_clients_this_week: recentClients?.length || 0,
          total_tasks: totalTasks || 0,
          pending_tasks: pendingTasks || 0,
          completed_tasks_today: recentTasks?.filter(t => t.status === 'concluída').length || 0,
          total_events: totalEvents || 0,
          upcoming_events: upcomingEvents || 0,
          events_today: recentEvents?.length || 0,
          total_documents: totalDocs || 0,
          recent_documents: recentDocs?.length || 0,
          total_financial_documents: totalFinDocs || 0,
          overdue_financial_documents: overdueFinDocs || 0,
          total_emails: totalEmails || 0,
          failed_emails: recentEmails?.filter(e => e.status === 'falha').length || 0,
          total_automations: totalAutos || 0,
          active_automations: activeAutos || 0,
          failed_automations: failedAutos || 0,
          recent_activity: activities
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Tickets Routes
  app.get("/api/client/tickets/stats", requireClientSession, async (req: any, res) => {
    try {
      const { data: tickets, error } = await supabase.from("tickets")
        .select("status, priority")
        .eq("client_id", req.clientId);

      if (error) throw error;

      const stats = {
        total: tickets?.length || 0,
        open: tickets?.filter(t => t.status === 'aberto' || t.status === 'novo' || t.status === 'nova').length || 0,
        in_progress: tickets?.filter(t => ['em análise', 'em investigação', 'em execução', 'a aguardar cliente', 'a aguardar resposta'].includes(t.status)).length || 0,
        completed: tickets?.filter(t => ['concluído', 'resolvida', 'encerrada', 'resolvido'].includes(t.status)).length || 0,
        urgent: tickets?.filter(t => t.priority === 'urgente').length || 0
      };

      res.json({ ok: true, stats });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets", requireClientSession, async (req: any, res) => {
    try {
      const { status, priority, category, assigned_to, search } = req.query;
      let query = supabase.from("tickets").select(`
        *,
        assigned_user:client_users!assigned_user_id(name),
        client:client_profiles!client_profile_id(company_name)
      `).eq("client_id", req.clientId);

      if (status) query = query.eq("status", status);
      if (priority) query = query.eq("priority", priority);
      if (category) query = query.eq("category", category);
      if (assigned_to) query = query.eq("assigned_user_id", assigned_to);
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,tracking_code.ilike.%${search}%`);
      }

      const { data: tickets, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      res.json({ 
        ok: true, 
        tickets: tickets?.map(t => ({
          ...t,
          assigned_user_name: (t.assigned_user as any)?.name,
          client_name: (t.client as any)?.company_name
        })) 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets/:id", requireClientSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { data: ticket, error } = await supabase.from("tickets").select(`
        *,
        assigned_user:client_users!assigned_user_id(name),
        client:client_profiles!client_profile_id(company_name, phone_e164)
      `).eq("id", id).eq("client_id", req.clientId).single();

      if (error) throw error;
      if (!ticket) return res.status(404).json({ ok: false, error: "Ticket não encontrado." });

      res.json({ 
        ok: true, 
        ticket: {
          ...ticket,
          assigned_user_name: (ticket.assigned_user as any)?.name,
          client_name: (ticket.client as any)?.company_name,
          client_phone: (ticket.client as any)?.phone_e164
        } 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets/:id/messages", requireClientSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { data: messages, error } = await supabase.from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      res.json({ ok: true, messages });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/tickets/:id/history", requireClientSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { data: history, error } = await supabase.from("ticket_history")
        .select(`
          *,
          user:client_users!created_by(name)
        `)
        .eq("ticket_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ 
        ok: true, 
        history: history?.map(h => ({
          ...h,
          user_name: (h.user as any)?.name
        })) 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/client/tickets", requireClientSession, async (req: any, res) => {
    try {
      const { title, description, category, priority, client_profile_id } = req.body;
      if (!title || !description) return res.status(400).json({ ok: false, error: "Título e descrição obrigatórios." });
      
      const trackingCode = `TT-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const { data: ticket, error } = await supabase.from("tickets").insert({
        client_id: req.clientId, 
        title, 
        description, 
        category: category || "suporte", 
        priority: priority || "média", 
        status: "aberto", 
        tracking_code: trackingCode,
        client_profile_id,
        created_by: req.userId
      }).select().single();

      if (error) throw error;

      // Initial message
      await supabase.from("ticket_messages").insert({ 
        ticket_id: ticket.id, 
        sender_type: "user", 
        sender_name: "Sistema",
        message: description 
      });

      // Initial history
      await supabase.from("ticket_history").insert({
        ticket_id: ticket.id,
        event_type: "create",
        event_label: "Ticket criado",
        created_by: req.userId
      });

      res.json({ ok: true, ticket });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Client Messages
  app.get("/api/client/messages", requireClientSession, async (req: any, res) => {
    const { data: messages } = await supabase.from("wa_messages").select("*").eq("client_id", req.clientId).order("created_at", { ascending: false });
    const convs = new Map();
    messages?.forEach(m => { if (!convs.has(m.phone_e164)) convs.set(m.phone_e164, { phone_e164: m.phone_e164, lastMsg: m.text, time: m.created_at }); });
    res.json({ ok: true, messages: Array.from(convs.values()) });
  });

  // Billing & Subscriptions
  app.get("/api/client/billing/subscription", requireClientSession, requirePermission('billing', 'view'), async (req: any, res) => {
    try {
      const { data: subscription, error } = await supabase.from("subscriptions")
        .select("*")
        .eq("client_id", req.clientId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      res.json({ ok: true, subscription: subscription || null });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/client/billing/usage", requireClientSession, requirePermission('billing', 'view'), async (req: any, res) => {
    try {
      const [ { count: users }, { count: instances }, { count: messages }, { count: tickets }, { count: documents } ] = await Promise.all([
        supabase.from("client_users").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId),
        supabase.from("client_instances").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId),
        supabase.from("wa_messages").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId),
        supabase.from("tickets").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId),
        supabase.from("documents").select("id", { count: 'exact', head: true }).eq("client_id", req.clientId)
      ]);

      res.json({ 
        ok: true, 
        usage: {
          client_id: req.clientId,
          total_users: users || 0,
          total_instances: instances || 0,
          total_messages: messages || 0,
          total_tickets: tickets || 0,
          total_documents: documents || 0,
          last_updated: new Date().toISOString()
        } 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Admin Billing (SaaS Operation)
  app.get("/api/admin/billing/stats", requireAdminSession, async (req: any, res) => {
    try {
      const [ { count: totalClients }, { data: subs } ] = await Promise.all([
        supabase.from("clients").select("id", { count: 'exact', head: true }),
        supabase.from("subscriptions").select("status, price_monthly")
      ]);

      const stats = {
        totalClients: totalClients || 0,
        activeSubscriptions: subs?.filter(s => s.status === 'active').length || 0,
        trialSubscriptions: subs?.filter(s => s.status === 'trial').length || 0,
        suspendedSubscriptions: subs?.filter(s => s.status === 'suspended' || s.status === 'past_due').length || 0,
        estimatedMonthlyRevenue: subs?.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.price_monthly || 0), 0) || 0
      };

      res.json({ ok: true, stats });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/admin/billing/subscriptions", requireAdminSession, async (req: any, res) => {
    try {
      const { status, plan } = req.query;
      
      let query = supabase.from("subscriptions")
        .select(`
          *,
          client:clients(company_name)
        `)
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);
      if (plan) query = query.eq("plan_name", plan);

      const { data: subscriptions, error } = await query;
      if (error) throw error;

      res.json({ 
        ok: true, 
        subscriptions: subscriptions?.map(s => ({
          ...s,
          company_name: (s.client as any)?.company_name
        })) 
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Admin Routes
  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) return res.status(401).json({ ok: false, error: "Credenciais inválidas." });
    const { data: admin } = await supabase.from("admins").select("*").eq("user_id", authData.user.id).single();
    if (!admin) return res.status(403).json({ ok: false, error: "Acesso negado." });
    const token = jwt.sign({ userId: authData.user.id, email: authData.user.email, isAdmin: true }, JWT_SECRET, { expiresIn: "12h" });
    res.cookie("tratatudo_admin_session", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 12 * 60 * 60 * 1000 });
    res.json({ ok: true, email: authData.user.email });
  });

  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, clients(company_name)").order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, company_name: (t.clients as any)?.company_name })) });
  });

  app.patch("/api/admin/tickets/:id/status", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { data: ticket } = await supabase.from("tickets").update({ status }).eq("id", id).select().single();
    if (status === 'resolvido' && ticket) {
      await sendWhatsAppNotification(ticket.client_id, ticket.phone_e164, `O seu ticket #${ticket.tracking_code} foi resolvido!`);
    }
    res.json({ ok: true, ticket });
  });

  // Helpers
  function normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 9) return "+351" + cleaned;
    if (!cleaned.startsWith("+") && cleaned.length > 0) return "+" + cleaned;
    return phone;
  }

  async function sendWhatsAppNotification(clientId: string, phone: string, text: string) {
    if (!EVO_URL || !EVO_KEY) throw new Error("Evolution API config missing");
    const { data: inst } = await supabase.from("client_instances").select("instance_name").eq("client_id", clientId).eq("status", "online").single();
    const instanceName = inst?.instance_name || "TrataTudo bot";
    const url = `${EVO_URL}/message/sendText/${encodeURIComponent(instanceName)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVO_KEY },
      body: JSON.stringify({ number: phone.replace("+", ""), text, delay: 1000 })
    });
    if (!res.ok) throw new Error(`Evolution API error: ${res.status}`);
    await supabase.from("wa_messages").insert({ client_id: clientId === "hub" ? null : clientId, phone_e164: phone, instance: instanceName, direction: "outbound", text });
  }

  // Webhook Evolution
  app.post("/api/webhook/evolution", async (req, res) => {
    const { event, data, instance: instanceName } = req.body;
    if (event !== "messages.upsert") return res.json({ ok: true });
    const remoteJid = data.key.remoteJid;
    if (remoteJid.endsWith("@g.us")) return res.json({ ok: true });
    const phone = "+" + remoteJid.split("@")[0];
    const text = data.message?.conversation || data.message?.extendedTextMessage?.text || "";
    if (!text) return res.json({ ok: true });
    
    // Simple resolution logic
    const { data: client } = await supabase.from("clients").select("id, status, bot_instructions").eq("phone_e164", phone).single();
    const clientId = client?.id;
    if (clientId) {
      await supabase.from("wa_messages").insert({ client_id: clientId, phone_e164: phone, instance: instanceName, direction: data.key.fromMe ? "outbound" : "inbound", text });
      if (!data.key.fromMe && client.status === 'active') {
        // AI logic here (simplified)
        const completion = await groq.chat.completions.create({
          messages: [{ role: "system", content: client.bot_instructions }, { role: "user", content: text }],
          model: "llama-3.3-70b-versatile",
        });
        const aiText = completion.choices[0]?.message?.content || "";
        await sendWhatsAppNotification(clientId, phone, aiText);
      }
    }
    res.json({ ok: true });
  });

  // Static files for production
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer().catch(console.error);
