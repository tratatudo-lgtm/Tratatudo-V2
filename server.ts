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
      next();
    } catch (err) {
      res.clearCookie("hub_session");
      return res.status(401).json({ ok: false, error: "Sessão expirada ou inválida." });
    }
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
    const { data: client } = await supabase.from("clients").select("id, company_name, phone_e164").eq("phone_e164", phone_e164).single();
    if (!client) return res.status(404).json({ ok: false, error: "Cliente não registado." });
    const token = jwt.sign({ clientId: client.id, phone_e164: client.phone_e164 }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("hub_session", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ ok: true, client });
  });

  app.get("/api/auth/session", async (req, res) => {
    const token = req.cookies.hub_session;
    if (!token) return res.json({ ok: true, authenticated: false });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { data: client } = await supabase.from("clients").select("id, company_name, phone_e164").eq("id", decoded.clientId).single();
      if (!client) throw new Error();
      res.json({ ok: true, authenticated: true, ...client });
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
      res.json({ ok: true, stats: { messages: msgs || 0, totalTickets: tks || 0 }, instance: inst, subscription: sub || { plan: 'Trial', status: 'active' } });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Client Tickets
  app.get("/api/client/tickets", requireClientSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*").eq("client_id", req.clientId).order("created_at", { ascending: false });
    res.json({ ok: true, tickets });
  });

  app.post("/api/client/tickets", requireClientSession, async (req: any, res) => {
    const { subject, description, category, priority, kind = "suporte" } = req.body;
    if (!subject || !description) return res.status(400).json({ ok: false, error: "Assunto e descrição obrigatórios." });
    const trackingCode = `SUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: ticket, error } = await supabase.from("tickets").insert({
      client_id: req.clientId, subject, description, category, priority: priority || "média", kind, status: "aberto", tracking_code: trackingCode
    }).select().single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, sender_type: "user", text: description });
    res.json({ ok: true, ticket });
  });

  // Client Messages
  app.get("/api/client/messages", requireClientSession, async (req: any, res) => {
    const { data: messages } = await supabase.from("wa_messages").select("*").eq("client_id", req.clientId).order("created_at", { ascending: false });
    const convs = new Map();
    messages?.forEach(m => { if (!convs.has(m.phone_e164)) convs.set(m.phone_e164, { phone_e164: m.phone_e164, lastMsg: m.text, time: m.created_at }); });
    res.json({ ok: true, messages: Array.from(convs.values()) });
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
