import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Groq from "groq-sdk";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

// Use Service Role Key for backend operations to bypass RLS
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const isServiceRole = !!supabaseServiceKey;

console.log("[SUPABASE INIT]", {
  url: supabaseUrl ? "Present" : "MISSING",
  keyType: isServiceRole ? "SERVICE_ROLE" : "ANON_KEY",
  hasKey: !!supabaseKey
});

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// AI Rate Limiter (10 requests per minute per IP)
const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { ok: false, error: "Limite de requisições de IA excedido. Tente novamente em 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || "tratatudo-v2-secret-key-2026";
const EVO_URL = (process.env.EVO_URL || "").replace(/\/$/, ""); // Remove trailing slash
const EVO_KEY = process.env.EVO_KEY || "";

console.log("[EVO INIT]", {
  url: EVO_URL ? "Present" : "MISSING",
  hasKey: !!EVO_KEY
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3002);

  app.use(cors({
    origin: ["https://app.tratatudo.pt", "https://tratatudo.pt", "https://www.tratatudo.pt"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }));

  // 11.2. Stripe Webhook - MUST be before express.json() to use raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: any, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      console.error("[STRIPE WEBHOOK ERROR]", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as any;
        const clientId = session.metadata.clientId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Update client and subscription
        await supabase
          .from("clients")
          .update({ 
            stripe_customer_id: customerId,
            status: 'active'
          })
          .eq("id", clientId);

        await supabase
          .from("subscriptions")
          .upsert({
            client_id: clientId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plan: 'Pro', // Default to Pro for now, can be derived from priceId
            updated_at: new Date().toISOString()
          });
        
        console.log(`[STRIPE] Checkout completed for client ${clientId}`);
        break;
      
      case "customer.subscription.deleted":
        const subDeleted = event.data.object as any;
        await supabase
          .from("subscriptions")
          .update({ status: 'canceled' })
          .eq("stripe_subscription_id", subDeleted.id);
        break;
    }

    res.json({ received: true });
  });

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
      res.clearCookie("tratatudo_admin_session", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.status(401).json({ ok: false, error: "Sessão administrativa expirada." });
    }
  };

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, status: "healthy", timestamp: new Date().toISOString() });
  });

  // 1. Send OTP Code
  app.post("/api/auth/send-otp", async (req, res) => {
    let { phone_e164 } = req.body;
    if (!phone_e164) {
      return res.status(400).json({ ok: false, error: "Número de WhatsApp é obrigatório." });
    }

    phone_e164 = normalizePhone(phone_e164);

    // Validate format
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
    const { error: dbError } = await supabase
      .from("auth_otps")
      .insert({ 
        phone_e164, 
        code_hash: codeHash, 
        expires_at: expiresAt,
        purpose: 'hub_login',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      });

    if (dbError) {
      console.error("[OTP DB ERROR]", {
        error: dbError,
        code: dbError.code,
        message: dbError.message,
        phone_e164,
        isServiceRole
      });
      
      // Specific error for permission denied
      if (dbError.message?.includes("permission denied")) {
        return res.status(500).json({ 
          ok: false, 
          error: "Erro de permissão na base de dados. Contacte o suporte.",
          details: "Permission denied on auth_otps"
        });
      }

      return res.status(500).json({ 
        ok: false, 
        error: "Erro interno ao gerar código",
        details: dbError.message 
      });
    }

    // --- REAL WHATSAPP LOGIC ---
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("phone_e164", phone_e164)
        .single();
      
      const effectiveClientId = client?.id || "hub";
      
      // The sendWhatsAppNotification function will handle the "TrataTudo bot" fallback
      await sendWhatsAppNotification(effectiveClientId, phone_e164, `O seu código de acesso TrataTudo é: ${code}. Válido por 10 minutos.`);
      
      console.log("[OTP DEBUG]", {
        phone_e164,
        clientId: effectiveClientId,
        status: "success"
      });

      return res.json({ ok: true, message: "Código enviado com sucesso!" });
    } catch (err: any) {
      console.error("[OTP WHATSAPP ERROR]", err);
      return res.status(500).json({ 
        ok: true, // Still return ok: true because OTP is in DB, but notify about WhatsApp failure
        message: "Código gerado mas falha no envio",
        error: err.message
      });
    }
  });

  // 2. Verify OTP Code
  app.post("/api/auth/verify-otp", async (req, res) => {
    let { phone_e164, code } = req.body;
    if (!phone_e164 || !code) {
      return res.status(400).json({ ok: false, error: "Número e código são obrigatórios." });
    }

    phone_e164 = normalizePhone(phone_e164);

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
  // Dashboard Charts Data
  app.get("/api/client/dashboard/charts", requireClientSession, async (req: any, res) => {
    try {
      const clientId = req.client.id;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Get tickets by day for the last 30 days
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('created_at, kind, status')
        .eq('client_id', clientId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (ticketsError) throw ticketsError;

      // Process data for charts
      const dailyStats: Record<string, { date: string; tickets: number; complaints: number; resolved: number }> = {};
      
      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = { date: dateStr, tickets: 0, complaints: 0, resolved: 0 };
      }

      tickets?.forEach(t => {
        const dateStr = new Date(t.created_at).toISOString().split('T')[0];
        if (dailyStats[dateStr]) {
          dailyStats[dateStr].tickets++;
          if (t.kind?.toLowerCase() === 'reclamação') dailyStats[dateStr].complaints++;
          if (t.status?.toLowerCase() === 'resolvido') dailyStats[dateStr].resolved++;
        }
      });

      // Distribution by status
      const statusDistribution = {
        aberto: tickets?.filter(t => t.status?.toLowerCase() === 'aberto').length || 0,
        analise: tickets?.filter(t => t.status?.toLowerCase() === 'em análise').length || 0,
        resolvido: tickets?.filter(t => t.status?.toLowerCase() === 'resolvido').length || 0
      };

      // Distribution by type
      const typeDistribution = {
        pedido: tickets?.filter(t => t.kind?.toLowerCase() === 'pedido').length || 0,
        reclamacao: tickets?.filter(t => t.kind?.toLowerCase() === 'reclamação').length || 0,
        outro: tickets?.filter(t => t.kind?.toLowerCase() !== 'pedido' && t.kind?.toLowerCase() !== 'reclamação').length || 0
      };

      res.json({
        ok: true,
        daily: Object.values(dailyStats),
        statusDistribution,
        typeDistribution
      });
    } catch (error: any) {
      console.error("[API] Dashboard charts error:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  });

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

  // 7.1 Send Message
  app.post("/api/client/messages/send", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;
    const { phone, text } = req.body;

    if (!phone || !text) {
      return res.status(400).json({ ok: false, error: "Telefone e texto são obrigatórios" });
    }

    try {
      // Get client's instance
      const { data: instance } = await supabase
        .from("client_instances")
        .select("*")
        .eq("client_id", clientId)
        .single();

      if (!instance || instance.status !== 'online') {
        return res.status(400).json({ ok: false, error: "Instância não encontrada ou offline" });
      }

      // Send via Evolution API
      if (!EVO_URL || !EVO_KEY) {
        return res.status(500).json({ ok: false, error: "Configuração do WhatsApp em falta" });
      }

      const encodedInstance = encodeURIComponent(instance.instance_name);
      const evoRes = await fetch(`${EVO_URL}/message/sendText/${encodedInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY
        },
        body: JSON.stringify({
          number: phone.replace("+", ""),
          text: text,
          delay: 500
        })
      });

      if (!evoRes.ok) {
        const errData = await evoRes.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao enviar mensagem via WhatsApp");
      }

      // Save to database
      const { data: savedMsg, error: saveError } = await supabase.from("wa_messages").insert({
        client_id: clientId,
        phone_e164: phone,
        instance: instance.instance_name,
        direction: "outbound",
        text: text
      }).select().single();

      if (saveError) throw saveError;

      res.json({ ok: true, message: savedMsg });
    } catch (err: any) {
      console.error("[SEND MESSAGE ERROR]", err);
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

  // 9.1. AI Analyze Ticket
  app.post("/api/client/tickets/:id/analyze", requireClientSession, aiRateLimiter, async (req: any, res) => {
    const clientId = req.clientId;
    const { id } = req.params;

    try {
      // Verify ownership
      const { data: ticket } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .eq("client_id", clientId)
        .single();

      if (!ticket) return res.status(403).json({ ok: false, error: "Acesso negado." });

      // Get messages
      const { data: messages } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      if (!messages || messages.length === 0) {
        return res.json({ 
          ok: true, 
          analysis: {
            summary: "Sem mensagens suficientes para análise.",
            probable_cause: "N/A",
            suggested_solution: "Aguardar mais interações do cliente.",
            next_steps: ["Aguardar mensagens"],
            sentiment: "Neutro"
          }
        });
      }

      // Call Groq AI
      const prompt = `Analise o seguinte ticket de suporte e as mensagens trocadas.
Ticket: ${ticket.subject} (${ticket.kind})
Prioridade: ${ticket.priority}
Status: ${ticket.status}

Mensagens:
${messages.map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Sistema/Agente'}: ${m.text}`).join('\n')}

Responda APENAS em formato JSON com os seguintes campos:
{
  "summary": "resumo curto",
  "probable_cause": "causa provável",
  "suggested_solution": "solução sugerida",
  "next_steps": ["passo 1", "passo 2"],
  "sentiment": "Positivo/Negativo/Neutro"
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!groqRes.ok) throw new Error("Erro ao chamar API de IA");

      const groqData = await groqRes.json();
      const analysis = JSON.parse(groqData.choices[0].message.content);

      res.json({ ok: true, analysis });
    } catch (err: any) {
      console.error("[AI ANALYZE ERROR]", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 9.2. AI General Insights (Dashboard/Global)
  app.post("/api/client/ai/insights", requireClientSession, aiRateLimiter, async (req: any, res) => {
    const clientId = req.clientId;
    const { context } = req.body; // 'dashboard', 'messages', etc.

    try {
      // Gather context data
      const { data: stats } = await supabase.rpc('get_client_stats', { p_client_id: clientId });
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      const { data: recentMessages } = await supabase
        .from("wa_messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10);

      const prompt = `És um consultor de IA para o TrataTudo. Analisa os dados operacionais do cliente e fornece 3 insights curtos e acionáveis.
Contexto: ${context || 'geral'}
Estatísticas: ${JSON.stringify(stats || {})}
Tickets Recentes: ${JSON.stringify(recentTickets || [])}
Mensagens Recentes: ${JSON.stringify(recentMessages || [])}

Responda APENAS em formato JSON com os seguintes campos:
{
  "insights": [
    {"title": "título curto", "description": "descrição curta", "type": "info/warning/success/error"},
    ...
  ],
  "summary": "resumo geral da operação em uma frase"
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!groqRes.ok) throw new Error("Erro ao contactar Groq AI");
      const groqData = await groqRes.json();
      const analysis = JSON.parse(groqData.choices[0].message.content);

      res.json({ ok: true, ...analysis });
    } catch (err: any) {
      console.error("[AI INSIGHTS ERROR]", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 9.3. AI Summarize Conversation
  app.post("/api/client/ai/summarize-chat", requireClientSession, aiRateLimiter, async (req: any, res) => {
    const clientId = req.clientId;
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ ok: false, error: "Telefone obrigatório" });

    try {
      const { data: messages } = await supabase
        .from("wa_messages")
        .select("*")
        .eq("client_id", clientId)
        .eq("phone_e164", phone)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!messages || messages.length === 0) {
        return res.json({ ok: true, summary: "Sem mensagens para resumir." });
      }

      const prompt = `Resume a seguinte conversa de WhatsApp entre a empresa e o cliente ${phone}.
Identifica o problema principal, o estado atual e o sentimento do cliente.

Mensagens (da mais recente para a mais antiga):
${messages.map(m => `${m.direction === 'inbound' ? 'Cliente' : 'Empresa/Bot'}: ${m.text}`).join('\n')}

Responda APENAS em formato JSON:
{
  "summary": "resumo executivo",
  "main_issue": "problema principal",
  "sentiment": "Positivo/Negativo/Neutro",
  "suggested_reply": "sugestão de resposta para o agente"
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      if (!groqRes.ok) throw new Error("Erro ao contactar Groq AI");
      const groqData = await groqRes.json();
      const analysis = JSON.parse(groqData.choices[0].message.content);

      res.json({ ok: true, ...analysis });
    } catch (err: any) {
      console.error("[AI CHAT SUMMARIZE ERROR]", err);
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

  // 10.1. Sync Instance Status
  app.post("/api/client/instance/sync", requireClientSession, async (req: any, res) => {
    const clientId = req.clientId;

    try {
      const { data: instance } = await supabase
        .from("client_instances")
        .select("*")
        .eq("client_id", clientId)
        .single();

      if (!instance) return res.status(404).json({ ok: false, error: "Instância não encontrada." });

      if (!EVO_URL || !EVO_KEY) throw new Error("Configuração da Evolution API em falta");

      // Call Evolution API
      const evoRes = await fetch(`${EVO_URL}/instance/connectionState/${encodeURIComponent(instance.instance_name)}`, {
        headers: { "apikey": EVO_KEY }
      });

      if (!evoRes.ok) throw new Error("Erro ao consultar Evolution API");

      const evoData = await evoRes.json();
      const newState = evoData.instance?.state || "DISCONNECTED";

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("client_instances")
        .update({ 
          status: newState === "open" ? "online" : "offline",
          updated_at: new Date().toISOString()
        })
        .eq("id", instance.id);

      if (updateError) throw updateError;

      res.json({ ok: true, state: newState });
    } catch (err: any) {
      console.error("[SYNC INSTANCE ERROR]", err);
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

  // 11.1. Stripe Checkout
  app.post("/api/client/stripe/checkout", requireClientSession, async (req: any, res) => {
    const { priceId } = req.body;
    const client = req.client;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.APP_URL}/app/dashboard?success=true`,
        cancel_url: `${process.env.APP_URL}/app/subscription?canceled=true`,
        customer_email: client.email,
        metadata: {
          clientId: client.id,
        },
      });

      res.json({ ok: true, url: session.url });
    } catch (err: any) {
      console.error("[STRIPE CHECKOUT ERROR]", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 11.2. Stripe Webhook
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: any, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err: any) {
      console.error("[STRIPE WEBHOOK ERROR]", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as any;
        const clientId = session.metadata.clientId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Update client and subscription
        await supabase
          .from("clients")
          .update({ 
            stripe_customer_id: customerId,
            status: 'active'
          })
          .eq("id", clientId);

        await supabase
          .from("subscriptions")
          .upsert({
            client_id: clientId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plan: 'Pro', // Default to Pro for now, can be derived from priceId
            updated_at: new Date().toISOString()
          });
        
        console.log(`[STRIPE] Checkout completed for client ${clientId}`);
        break;
      
      case "customer.subscription.deleted":
        const subDeleted = event.data.object as any;
        await supabase
          .from("subscriptions")
          .update({ status: 'canceled' })
          .eq("stripe_subscription_id", subDeleted.id);
        break;
    }

    res.json({ received: true });
  });

  // 12. Get Client Settings
  app.get("/api/client/settings", requireClientSession, async (req: any, res) => {
    res.json({ ok: true, settings: req.client });
  });

  // 13. Update Client Settings
  app.patch("/api/client/settings", requireClientSession, async (req: any, res) => {
    const { company_name, bot_instructions } = req.body;

    try {
      const { data: updatedClient, error: updateError } = await supabase
        .from("clients")
        .update({ company_name, bot_instructions })
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
      res.clearCookie("tratatudo_admin_session", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
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
      const now = new Date().toISOString();
      
      // Global stats
      const { count: totalClients } = await supabase.from("clients").select("*", { count: 'exact', head: true });
      const { count: trialClients } = await supabase.from("clients").select("*", { count: 'exact', head: true }).gt("trial_end", now);
      const { count: activeClients } = await supabase.from("clients").select("*", { count: 'exact', head: true }).eq("status", "active").is("trial_end", null);
      
      const { count: onlineInstances } = await supabase.from("client_instances").select("*", { count: 'exact', head: true }).eq("status", "online");
      const { count: offlineInstances } = await supabase.from("client_instances").select("*", { count: 'exact', head: true }).eq("status", "offline");
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count: messagesToday } = await supabase.from("wa_messages").select("*", { count: 'exact', head: true }).gt("created_at", startOfDay.toISOString());
      
      const { count: openTickets } = await supabase.from("tickets").select("*", { count: 'exact', head: true }).in("status", ["aberto", "em análise", "pendente"]);

      // Recent activity (Real data)
      const { data: recentActivity } = await supabase
        .from("wa_messages")
        .select("text, created_at, direction, phone_e164, clients(company_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      const activity = (recentActivity || []).map(m => ({
        type: 'message',
        title: `${m.direction === 'inbound' ? 'Recebida' : 'Enviada'}: ${m.text.substring(0, 30)}...`,
        status: (m.clients as any)?.company_name || m.phone_e164,
        created_at: m.created_at
      }));

      res.json({
        ok: true,
        stats: {
          totalClients: totalClients || 0,
          trialClients: trialClients || 0,
          activeClients: activeClients || 0,
          onlineInstances: onlineInstances || 0,
          offlineInstances: offlineInstances || 0,
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
        .select("*, client_instances(instance_name, status, is_hub), subscriptions(plan, status, ends_at)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Flatten for easier frontend use
      const flattenedClients = (clients || []).map(c => ({
        ...c,
        instance: c.client_instances?.[0] || null,
        subscription: c.subscriptions?.[0] || null,
        plan: c.subscriptions?.[0]?.plan || 'Nenhum'
      }));

      res.json({ ok: true, clients: flattenedClients });
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

      // Send notification if resolved and NOT already notified (Race-safe atomic update)
      if (status === 'resolvido') {
        const { data: updatedTicket, error: updateError } = await supabase
          .from("tickets")
          .update({ notified_resolved_at: new Date().toISOString() })
          .eq("id", id)
          .is("notified_resolved_at", null)
          .select()
          .single();

        if (!updateError && updatedTicket) {
          try {
            // Use tracking_code instead of unsafe split ID
            // Destination: Use phone_e164 or fallback to customer_contact if it exists
            const destination = updatedTicket.phone_e164 || (updatedTicket as any).customer_contact;
            if (destination) {
              await sendWhatsAppNotification(updatedTicket.client_id, destination, `O seu ticket #${updatedTicket.tracking_code} foi resolvido com sucesso!`);
            }
          } catch (notifyErr) {
            console.error("[NOTIFICATION ERROR]", notifyErr);
          }
        }
      }

      res.json({ ok: true, ticket: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 11. Admin Client Management
  app.post("/api/admin/clients", requireAdminSession, async (req: any, res) => {
    const { company_name, email, phone_e164, status, bot_instructions } = req.body;
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          company_name,
          email,
          phone_e164,
          status: status || 'trial',
          bot_instructions: bot_instructions || "És um assistente prestativo.",
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create default subscription
      await supabase.from("subscriptions").insert({
        client_id: data.id,
        plan: 'Trial',
        status: 'active',
        started_at: new Date().toISOString()
      });

      res.json({ ok: true, client: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.put("/api/admin/clients/:id", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    const { company_name, email, phone_e164, status, bot_instructions } = req.body;
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({
          company_name,
          email,
          phone_e164,
          status,
          bot_instructions,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json({ ok: true, client: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.delete("/api/admin/clients/:id", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.json({ ok: true, message: "Cliente removido com sucesso." });
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
        company_name: (s.clients as any)?.company_name || 'Desconhecido',
        amount: s.plan === 'Pro' ? 49.90 : s.plan === 'Enterprise' ? 149.90 : 0,
        next_billing: s.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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

  // 12.1 Create Trial Client
  app.post("/api/admin/clients/trial", requireAdminSession, async (req: any, res) => {
    const { phone_e164, company_name, contact_name } = req.body;

    if (!phone_e164 || !company_name) {
      return res.status(400).json({ ok: false, error: "Telefone e Nome da Empresa são obrigatórios" });
    }

    try {
      // 1. Create Client
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7); // 7 days trial

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          phone_e164,
          company_name,
          contact_name: contact_name || company_name,
          status: 'active',
          trial_end: trialEnd.toISOString(),
          bot_instructions: "És um assistente prestativo para a empresa " + company_name + "."
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Create Subscription
      await supabase.from("subscriptions").insert({
        client_id: client.id,
        plan: 'Trial',
        status: 'active',
        ends_at: trialEnd.toISOString()
      });

      // 3. Associate with Shared Hub Instance "TrataTudo bot"
      await supabase.from("client_instances").insert({
        client_id: client.id,
        instance_name: "TrataTudo bot",
        status: 'online',
        is_hub: true
      });

      res.json({ ok: true, client });
    } catch (err: any) {
      console.error("[CREATE TRIAL ERROR]", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.post("/api/admin/clients/:id/activate-production", requireAdminSession, async (req: any, res) => {
    const { id } = req.params;
    try {
      // 0. Get Client Info
      const { data: client, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !client) throw new Error("Cliente não encontrado");

      const privateInstanceName = `prod-${String(id).replace(/[^a-zA-Z0-9]/g, '')}`;

      if (!EVO_URL || !EVO_KEY) throw new Error("Configuração da Evolution API em falta");

      // 1. Create REAL Instance in Evolution API
      console.log(`[ADMIN] Creating dedicated instance: ${privateInstanceName}`);
      const createRes = await fetch(`${EVO_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY
        },
        body: JSON.stringify({
          instanceName: privateInstanceName,
          token: Math.random().toString(36).substring(2, 15),
          qrcode: true
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        // If instance already exists, we might want to continue, but usually it's a real error
        if (createRes.status !== 403) { // Evolution often returns 403 if exists
           throw new Error(errData.message || "Erro ao criar instância na Evolution API");
        }
      }

      // 2. Update Client and Subscription (with compensation logic)
      try {
        const { error: clientError } = await supabase
          .from("clients")
          .update({ 
            status: 'active', 
            trial_end: null 
          })
          .eq("id", id);

        if (clientError) throw clientError;

        // 3. Update Subscription
        await supabase
          .from("subscriptions")
          .update({ 
            plan: 'Pro', 
            status: 'active',
            ends_at: null
          })
          .eq("client_id", id);

        // 4. Update Instance Record (or create if somehow missing)
        const { error: instError } = await supabase
          .from("client_instances")
          .upsert({
            client_id: id,
            instance_name: privateInstanceName,
            is_hub: false,
            status: 'offline',
            updated_at: new Date().toISOString()
          }, { onConflict: 'client_id' });

        if (instError) throw instError;
      } catch (dbErr) {
        // Compensating logic: Delete the just-created instance in Evolution if DB update fails
        console.error("[ACTIVATE PRODUCTION ERROR] DB update failed, deleting orphan instance:", dbErr);
        if (EVO_URL && EVO_KEY) {
          await fetch(`${EVO_URL}/instance/delete/${encodeURIComponent(privateInstanceName)}`, {
            method: 'DELETE',
            headers: { 'apikey': EVO_KEY }
          }).catch(e => console.error("[CLEANUP ERROR] Failed to delete orphan instance:", e));
        }
        
        throw dbErr;
      }

      res.json({ 
        ok: true, 
        message: "Produção ativada e instância dedicada criada!", 
        instance_name: privateInstanceName 
      });
    } catch (err: any) {
      console.error("[ACTIVATE PRODUCTION ERROR]", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // 13. Evolution API: Create Instance
  app.post("/api/admin/instances/create", requireAdminSession, async (req: any, res) => {
    const { client_id } = req.body;
    if (!client_id) return res.status(400).json({ ok: false, error: "client_id é obrigatório." });

    const instance_name = `client-${client_id}`;

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

  // --- HELPERS ---

  function normalizePhone(phone: string): string {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("351") && cleaned.length === 9) return "+" + cleaned;
    if (cleaned.length === 9) return "+351" + cleaned;
    if (!cleaned.startsWith("+") && cleaned.length > 0) return "+" + cleaned;
    return phone;
  }

  async function sendWhatsAppNotification(clientId: string, phone: string, text: string) {
    try {
      // Get client instance
      const { data: instance } = await supabase
        .from("client_instances")
        .select("instance_name")
        .eq("client_id", clientId)
        .eq("status", "online")
        .single();

      const instanceName = instance?.instance_name || "TrataTudo bot";

      console.log("[OTP DEBUG] Notification Attempt", {
        phone_e164: phone,
        instanceName,
        clientId,
        EVO_URL: EVO_URL ? "Present" : "MISSING"
      });

      if (!EVO_URL || !EVO_KEY) {
        throw new Error("Evolution API configuration missing (EVO_URL or EVO_KEY)");
      }

      const encodedInstance = encodeURIComponent(instanceName);
      const url = `${EVO_URL}/message/sendText/${encodedInstance}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVO_KEY
        },
        body: JSON.stringify({
          number: phone.replace("+", ""),
          text: text,
          delay: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EVO API ERROR]", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url
        });
        throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
      }

        // Save to wa_messages
        await supabase.from("wa_messages").insert({
          client_id: clientId === "hub" ? null : clientId,
          phone_e164: phone,
          instance: instanceName,
          direction: "outbound",
          text: text
        });
    } catch (err) {
      console.error("[NOTIFICATION ERROR]", err);
      throw err; // Re-throw to be caught by the caller
    }
  }

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

  // 12. Public Checkout (for Bot)
  app.get("/api/public/stripe/checkout", async (req, res) => {
    const { clientId, planId } = req.query;
    if (!clientId) return res.status(400).json({ error: "Missing clientId" });

    try {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError || !client) throw new Error("Client not found");

      const priceId = planId === 'pro' ? process.env.STRIPE_PRICE_ID_PRO : process.env.STRIPE_PRICE_ID_STARTER;
      if (!priceId) throw new Error("Price ID not configured");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/app/dashboard?success=true`,
        cancel_url: `${process.env.APP_URL}/pricing?canceled=true`,
        customer_email: client.email || undefined,
        metadata: {
          clientId: client.id,
          planId: planId as string
        }
      });

      if (session.url) {
        res.redirect(session.url);
      } else {
        throw new Error("Failed to create session");
      }
    } catch (err: any) {
      console.error("[PUBLIC CHECKOUT ERROR]", err);
      res.status(500).send(`Erro ao processar checkout: ${err.message}`);
    }
  });

  async function processAIResponse(clientId: string, phone: string, userText: string, instructions: string, instance: string) {
    try {
      // Check for payment intent keywords
      const paymentKeywords = ['pagar', 'pagamento', 'assinar', 'comprar', 'preço', 'valor', 'mensalidade', 'checkout'];
      const wantsToPay = paymentKeywords.some(k => userText.toLowerCase().includes(k));

      if (wantsToPay) {
        const checkoutUrl = `${process.env.APP_URL}/api/public/stripe/checkout?clientId=${clientId}&planId=pro`;
        await sendWhatsAppNotification(clientId, phone, `Para assinar o nosso plano Profissional e desbloquear todas as funcionalidades, clique no link seguro de pagamento abaixo:\n\n${checkoutUrl}\n\nApós o pagamento, a sua conta será ativada automaticamente.`);
        return;
      }

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

              // Send notification to user (Idempotent check - though here it's a new ticket)
              try {
                // Use tracking_code instead of unsafe split ID
                await sendWhatsAppNotification(clientId, phone, `O seu pedido foi registado com sucesso! Ticket #${ticket.tracking_code}.\nEm breve um assistente irá analisar.`);
                
                // Mark as notified
                await supabase
                  .from("tickets")
                  .update({ notified_opened_at: new Date().toISOString() })
                  .eq("id", ticket.id);
              } catch (notifyErr) {
                console.error("[NOTIFICATION ERROR]", notifyErr);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing __REPORT__ JSON", e);
        }
      }

      // Send response back via Evolution API
      if (EVO_URL && EVO_KEY) {
        await fetch(`${EVO_URL}/message/sendText/${encodeURIComponent(instance)}`, {
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
        const owner = inst.instance.owner; // WhatsApp number

        // Mapping: open -> online, connecting -> reconnecting, close -> offline
        let status = "offline";
        if (connectionStatus === "open") status = "online";
        else if (connectionStatus === "connecting") status = "reconnecting";

        // Update Supabase
        const { data: updatedInstance, error: updateError } = await supabase
          .from("client_instances")
          .update({ 
            status, 
            whatsapp_number: owner || null,
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

  startServer().catch(err => {
    console.error("CRITICAL: Failed to start server:", err);
    process.exit(1);
  });
}

startServer();
