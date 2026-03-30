import express from "express";
import { createClient } from "@supabase/supabase-js";
import { getImportsClientId } from "../services/tenant.service";
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

router.get("/health", async (_req, res) => {
  return res.json({ ok: true, service: "imports-turismo" });
});

router.post("/orcamentos", async (req, res) => {
  try {
    const body = req.body || {};
    const nome = safeString(body.nome);
    const telefone = normalizePhoneLoose(body.telefone);
    const email = safeString(body.email);
    const destino = safeString(body.destino);
    const periodo = safeString(body.periodo);

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "nome, telefone, email, destino e periodo são obrigatórios" });
    }

    const trackingCode = await createPublicQuoteTicket(supabase as any, getImportsClientId(), {
      nome,
      telefone,
      email,
      destino,
      periodo,
      passageiros: safeNumber(body.passageiros, 1),
      criancas: safeNumber(body.criancas, 0),
      cidadePartida: safeString(body.cidadePartida),
      observacoes: safeString(body.observacoes),
    });

    return res.json({ ok: true, trackingCode });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar pedido de orçamento" });
  }
});

router.post("/reservas", async (req, res) => {
  try {
    const body = req.body || {};
    const nome = safeString(body.nome);
    const telefone = normalizePhoneLoose(body.telefone);
    const email = safeString(body.email);
    const destino = safeString(body.destino);
    const periodo = safeString(body.periodo);

    if (!nome || !telefone || !email || !destino || !periodo) {
      return res.status(400).json({ ok: false, error: "nome, telefone, email, destino e periodo são obrigatórios" });
    }

    const trackingCode = await createPublicReservationTicket(supabase as any, getImportsClientId(), {
      nome,
      telefone,
      email,
      destino,
      periodo,
      passageiros: safeNumber(body.passageiros, 1),
      criancas: safeNumber(body.criancas, 0),
      cidadePartida: safeString(body.cidadePartida),
      observacoes: safeString(body.observacoes),
    });

    return res.json({ ok: true, trackingCode });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar pedido de reserva" });
  }
});

router.post("/reclamacoes", async (req, res) => {
  try {
    const body = req.body || {};
    const nome = safeString(body.nome);
    const telefone = normalizePhoneLoose(body.telefone);
    const email = safeString(body.email);
    const descricao = safeString(body.descricao);

    if (!nome || !telefone || !email || !descricao) {
      return res.status(400).json({ ok: false, error: "nome, telefone, email e descricao são obrigatórios" });
    }

    const trackingCode = await createPublicComplaintTicket(supabase as any, getImportsClientId(), {
      nome,
      telefone,
      email,
      referencia: safeString(body.referencia),
      descricao,
      dataOcorrencia: safeString(body.dataOcorrencia),
      expectativaResolucao: safeString(body.expectativaResolucao),
    });

    return res.json({ ok: true, trackingCode });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao criar reclamação" });
  }
});

router.get("/pedidos/:trackingCode", async (req, res) => {
  try {
    const tracking = await getPublicTrackingByCode(supabase as any, getImportsClientId(), safeString(req.params?.trackingCode));

    if (!tracking) {
      return res.status(404).json({ ok: false, error: "Pedido não encontrado" });
    }

    return res.json(tracking);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Erro ao consultar pedido" });
  }
});

export default router;
