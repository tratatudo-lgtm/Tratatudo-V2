import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const IMPORTS_SITE_KEY = process.env.IMPORTS_SITE_KEY || "imports-turismo-br";
const IMPORTS_CLIENT_ID = process.env.IMPORTS_CLIENT_ID;

// Helpers
const safeString = (val: any) => (typeof val === 'string' ? val.trim() : '');
const safeNumber = (val: any) => {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

const normalizePhoneLoose = (phone: string) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("351")) return "+" + cleaned;
  if (cleaned.startsWith("55")) return "+" + cleaned;
  if (cleaned.length === 9) return "+351" + cleaned;
  return "+" + cleaned;
};

const mapPublicStatus = (status: string) => {
  const map: Record<string, string> = {
    "new": "Recebido",
    "open": "Em processamento",
    "pending": "Aguardando informação",
    "solved": "Concluído",
    "closed": "Encerrado",
    "novo": "Recebido",
    "em análise": "Em processamento"
  };
  return map[status] || status;
};

const randomTrackingCode = () => {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `TT-${digits}`;
};

const generateUniqueTrackingCode = async (supabase: any, clientId: string) => {
  let code = "";
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    code = randomTrackingCode();
    const { data } = await supabase
      .from("tickets")
      .select("id")
      .eq("client_id", clientId)
      .eq("tracking_code", code)
      .maybeSingle();
    if (!data) exists = false;
    attempts++;
  }
  return code;
};

const resolvePublicClientId = (siteKey?: string, clientSlug?: string) => {
  if (siteKey === IMPORTS_SITE_KEY || clientSlug === "imports-turismo-br") {
    return IMPORTS_CLIENT_ID;
  }
  return null;
};

// Routes
router.post("/request", async (req, res) => {
  try {
    const { site_key, client_slug, type } = req.body;
    const clientId = resolvePublicClientId(site_key, client_slug);

    if (!clientId) {
      return res.status(404).json({ ok: false, error: "Cliente não encontrado" });
    }

    // Extract data supporting both formats
    const nome = req.body.nome || req.body.customer?.nome;
    const telefone = req.body.telefone || req.body.customer?.telefone;
    const email = req.body.email || req.body.customer?.email;
    const destino = req.body.destino || req.body.destination;
    const periodo = req.body.periodo || req.body.period;
    
    // Optional fields
    const passageiros = req.body.passageiros || req.body.passengers;
    const criancas = req.body.criancas || req.body.children;
    const cidadePartida = req.body.cidadePartida || req.body.departure_city;
    const observacoes = req.body.observacoes || req.body.notes;

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios em falta" });
    }

    const trackingCode = await generateUniqueTrackingCode(supabase, clientId);
    const kind = type === "reserva" ? "pedido" : "venda";
    
    const { error } = await supabase.from("tickets").insert({
      client_id: clientId,
      tracking_code: trackingCode,
      kind: kind,
      category: "comercial",
      status: "novo",
      priority: "média",
      subject: `Pedido de ${kind} - ${destino}`,
      description: `Pedido de ${kind} para ${destino} durante o período ${periodo}.`,
      customer_name: safeString(nome),
      customer_contact: normalizePhoneLoose(telefone),
      metadata: {
        source: "public_api_v2",
        form_type: kind,
        destination: safeString(destino),
        travel_period: safeString(periodo),
        passengers: safeNumber(passageiros),
        children: safeNumber(criancas),
        departure_city: safeString(cidadePartida),
        email: safeString(email),
        notes: safeString(observacoes)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    res.json({ ok: true, trackingCode });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/complaint", async (req, res) => {
  try {
    const { site_key, client_slug } = req.body;
    const clientId = resolvePublicClientId(site_key, client_slug);

    if (!clientId) {
      return res.status(404).json({ ok: false, error: "Cliente não encontrado" });
    }

    const nome = req.body.nome || req.body.customer?.nome;
    const telefone = req.body.telefone || req.body.customer?.telefone;
    const email = req.body.email || req.body.customer?.email;
    const descricao = req.body.descricao || req.body.description || req.body.mensagem || req.body.message;
    const referencia = req.body.referencia || req.body.reference;
    const dataOcorrencia = req.body.dataOcorrencia || req.body.occurrence_date;
    const expectativaResolucao = req.body.expectativaResolucao || req.body.expected_resolution;

    if (!nome || !telefone || !email || !descricao) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios em falta" });
    }

    const trackingCode = await generateUniqueTrackingCode(supabase, clientId);
    
    const { error } = await supabase.from("tickets").insert({
      client_id: clientId,
      tracking_code: trackingCode,
      kind: "reclamação",
      category: "pos_venda",
      status: "nova",
      priority: "alta",
      subject: `Reclamação Pública - ${safeString(referencia) || 'Sem referência'}`,
      description: safeString(descricao),
      customer_name: safeString(nome),
      customer_contact: normalizePhoneLoose(telefone),
      metadata: {
        source: "public_api_v2",
        form_type: "reclamacao",
        email: safeString(email),
        reference: safeString(referencia),
        occurrence_date: safeString(dataOcorrencia),
        expected_resolution: safeString(expectativaResolucao)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    res.json({ ok: true, trackingCode });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/track/:trackingCode", async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const { site_key, client_slug } = req.query;
    const clientId = resolvePublicClientId(site_key as string, client_slug as string);

    if (!clientId) {
      return res.status(404).json({ ok: false, error: "Cliente não encontrado" });
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("tracking_code, status, customer_name, created_at, metadata")
      .eq("client_id", clientId)
      .eq("tracking_code", trackingCode)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ ok: false, error: "Tracking não encontrado" });
    }

    res.json({
      trackingCode: data.tracking_code,
      status: mapPublicStatus(data.status),
      nome: data.customer_name,
      destino: data.metadata?.destination || data.metadata?.assunto || "N/A",
      periodo: data.metadata?.travel_period || "N/A",
      createdAt: data.created_at
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/chat/start", (req, res) => {
  res.json({ 
    ok: true, 
    sessionId: `sess-${Math.random().toString(36).substring(2, 10)}`, 
    message: "Olá. O atendimento automático web está disponível para orientar o seu pedido. Pode escrever a sua mensagem ou usar as opções rápidas abaixo." 
  });
});

router.post("/chat/message", (req, res) => {
  res.json({ 
    ok: true, 
    reply: "Posso orientar o seu pedido de orçamento, reserva, reclamação ou acompanhamento. Se preferir, use também as opções rápidas disponíveis na página.", 
    quick_actions: [ 
      { type: "link", label: "Pedir orçamento", href: "/orcamento" }, 
      { type: "link", label: "Reservar", href: "/reserva" }, 
      { type: "link", label: "Apoio", href: "/apoio" }, 
      { type: "link", label: "Acompanhar pedido", href: "/acompanhar" } 
    ] 
  });
});

export default router;
