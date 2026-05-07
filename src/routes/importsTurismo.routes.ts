import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const importsClientId = process.env.IMPORTS_CLIENT_ID;

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Middleware
const checkImportsClient = (req: any, res: any, next: any) => {
  if (!importsClientId) {
    return res.status(500).json({ ok: false, error: "IMPORTS_CLIENT_ID not configured" });
  }
  next();
};

// Routes
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "imports-turismo" });
});

router.post("/orcamentos", checkImportsClient, async (req, res) => {
  try {
    const { nome, telefone, email, destino, periodo, passageiros, criancas, cidadePartida, observacoes } = req.body;

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios em falta" });
    }

    const trackingCode = await generateUniqueTrackingCode(supabase, importsClientId!);
    
    const { error } = await supabase.from("tickets").insert({
      client_id: importsClientId,
      tracking_code: trackingCode,
      kind: "venda",
      category: "comercial",
      status: "novo",
      priority: "média",
      subject: `Pedido de orçamento - ${destino}`,
      description: `Pedido de orçamento para ${destino} durante o período ${periodo}.`,
      customer_name: safeString(nome),
      customer_contact: normalizePhoneLoose(telefone),
      metadata: {
        source: "imports_turismo_site",
        form_type: "orcamento",
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

router.post("/reservas", checkImportsClient, async (req, res) => {
  try {
    const { nome, telefone, email, destino, periodo, passageiros, criancas, cidadePartida, observacoes } = req.body;

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios em falta" });
    }

    const trackingCode = await generateUniqueTrackingCode(supabase, importsClientId!);
    
    const { error } = await supabase.from("tickets").insert({
      client_id: importsClientId,
      tracking_code: trackingCode,
      kind: "pedido",
      category: "comercial",
      status: "novo",
      priority: "média",
      subject: `Pedido de reserva - ${destino}`,
      description: `Pedido de reserva para ${destino} durante o período ${periodo}.`,
      customer_name: safeString(nome),
      customer_contact: normalizePhoneLoose(telefone),
      metadata: {
        source: "imports_turismo_site",
        form_type: "reserva",
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

router.post("/reclamacoes", checkImportsClient, async (req, res) => {
  try {
    const { nome, telefone, email, referencia, descricao, dataOcorrencia, expectativaResolucao } = req.body;

    if (!nome || !telefone || !email || !descricao) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios em falta" });
    }

    const trackingCode = await generateUniqueTrackingCode(supabase, importsClientId!);
    
    const { error } = await supabase.from("tickets").insert({
      client_id: importsClientId,
      tracking_code: trackingCode,
      kind: "reclamação",
      category: "pos_venda",
      status: "nova",
      priority: "alta",
      subject: `Reclamação - ${safeString(referencia) || 'Sem referência'}`,
      description: safeString(descricao),
      customer_name: safeString(nome),
      customer_contact: normalizePhoneLoose(telefone),
      metadata: {
        source: "imports_turismo_site",
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

router.get("/pedidos/:trackingCode", checkImportsClient, async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const { data, error } = await supabase
      .from("tickets")
      .select("tracking_code, status, customer_name, created_at, metadata")
      .eq("client_id", importsClientId)
      .eq("tracking_code", trackingCode)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ ok: false, error: "Pedido não encontrado" });
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

export default router;
