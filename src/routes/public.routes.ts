import express from "express";
import { createClient } from "@supabase/supabase-js";
import { resolvePublicClientId } from "../services/tenant.service";
import {
  createPublicComplaintTicket,
  createPublicQuoteTicket,
  createPublicReservationTicket,
} from "../services/ticket.service";
import { getPublicTrackingByCode } from "../services/tracking.service";
import { normalizePhoneLoose, safeNumber, safeString } from "../utils/helpers";

const router = express.Router();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.post("/request", async (req, res) => {
  try {
    const body = req.body || {};
    const clientId = await resolvePublicClientId(supabase as any, body.site_key, body.client_slug);
    const type = safeString(body.type || body.request_type).toLowerCase();

    const nome = safeString(body.nome || body.customer?.name);
    const telefone = normalizePhoneLoose(body.telefone || body.customer?.phone_e164 || body.customer?.phone);
    const email = safeString(body.email || body.customer?.email);
    const destino = safeString(body.destino || body.data?.destination);
    const periodo = safeString(body.periodo || body.data?.travel_period);

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "nome, telefone, email, destino e periodo são obrigatórios" });
    }

    const payload = {
      nome,
      telefone,
      email,
      destino,
      periodo,
      passageiros: safeNumber(body.passageiros || body.data?.passengers, 1),
      criancas: safeNumber(body.criancas || body.data?.children, 0),
      cidadePartida: safeString(body.cidadePartida || body.data?.departure_city),
      observacoes: safeString(body.observacoes || body.data?.notes),
    };

    const trackingCode = type === "reserva"
      ? await createPublicReservationTicket(supabase as any, clientId, payload)
      : await createPublicQuoteTicket(supabase as any, clientId, payload);

    return res.json({ ok: true, trackingCode });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar pedido público" });
  }
});

router.post("/complaint", async (req, res) => {
  try {
    const body = req.body || {};
    const clientId = await resolvePublicClientId(supabase as any, body.site_key, body.client_slug);

    const nome = safeString(body.nome || body.customer?.name);
    const telefone = normalizePhoneLoose(body.telefone || body.customer?.phone_e164 || body.customer?.phone);
    const email = safeString(body.email || body.customer?.email);
    const descricao = safeString(body.descricao || body.description);

    if (!nome || !telefone || !email || !descricao) {
      return res.status(400).json({ ok: false, error: "nome, telefone, email e descricao são obrigatórios" });
    }

    const trackingCode = await createPublicComplaintTicket(supabase as any, clientId, {
      nome,
      telefone,
      email,
      referencia: safeString(body.referencia || body.reference),
      descricao,
      dataOcorrencia: safeString(body.dataOcorrencia || body.occurrence_date),
      expectativaResolucao: safeString(body.expectativaResolucao || body.expected_resolution),
    });

    return res.json({ ok: true, trackingCode });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar reclamação pública" });
  }
});

router.get("/track/:trackingCode", async (req, res) => {
  try {
    const siteKey = safeString(req.query?.site_key || req.query?.client_slug);
    const clientId = await resolvePublicClientId(supabase as any, siteKey, siteKey);
    const tracking = await getPublicTrackingByCode(supabase as any, clientId, safeString(req.params?.trackingCode));

    if (!tracking) {
      return res.status(404).json({ ok: false, error: "Pedido não encontrado" });
    }

    return res.json(tracking);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao consultar tracking público" });
  }
});

router.post("/chat/start", async (req, res) => {
  try {
    const body = req.body || {};
    await resolvePublicClientId(supabase as any, body.site_key, body.client_slug);
    const sessionId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return res.json({
      ok: true,
      sessionId,
      message: "Olá. O atendimento automático web está disponível para orientar o seu pedido. Pode escrever a sua mensagem ou usar as opções rápidas abaixo."
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao iniciar chat público" });
  }
});

router.post("/chat/message", async (req, res) => {
  try {
    const body = req.body || {};
    await resolvePublicClientId(supabase as any, body.site_key, body.client_slug);

    return res.json({
      ok: true,
      reply: "Posso orientar o seu pedido de orçamento, reserva, reclamação ou acompanhamento. Se preferir, use também as opções rápidas disponíveis na página.",
      quick_actions: [
        { type: "link", label: "Pedir orçamento", href: "/orcamento" },
        { type: "link", label: "Reservar", href: "/reserva" },
        { type: "link", label: "Apoio", href: "/apoio" },
        { type: "link", label: "Acompanhar pedido", href: "/acompanhar" }
      ]
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao processar mensagem do chat público" });
  }
});

export default router;
