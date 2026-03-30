import { generateUniqueTrackingCode } from "../utils/tracking";

type SupabaseLike = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => {
      select: (fields: string) => {
        single: () => Promise<{ data: any; error: { message: string } | null }>;
      };
    };
  };
};

type QuotePayload = {
  nome: string;
  telefone: string;
  email: string;
  destino: string;
  periodo: string;
  passageiros: number;
  criancas: number;
  cidadePartida: string;
  observacoes: string;
};

type ComplaintPayload = {
  nome: string;
  telefone: string;
  email: string;
  referencia: string;
  descricao: string;
  dataOcorrencia: string;
  expectativaResolucao: string;
};

async function insertTicket(supabase: SupabaseLike, payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("tickets")
    .insert(payload)
    .select("id, tracking_code")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createPublicQuoteTicket(supabase: SupabaseLike, clientId: number, body: QuotePayload) {
  const trackingCode = await generateUniqueTrackingCode(supabase, "TT");

  const metadata = {
    source: "public_api",
    form_type: "orcamento",
    destination: body.destino,
    travel_period: body.periodo,
    passengers: body.passageiros,
    children: body.criancas,
    departure_city: body.cidadePartida,
    email: body.email,
    notes: body.observacoes,
  };

  const data = await insertTicket(supabase, {
    client_id: clientId,
    tracking_code: trackingCode,
    kind: "orcamento",
    category: "comercial",
    status: "new",
    priority: "medium",
    subject: `Pedido de orçamento - ${body.destino}`,
    description: `Pedido público de orçamento para ${body.destino}`,
    customer_name: body.nome,
    customer_contact: body.telefone,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return data?.tracking_code || trackingCode;
}

export async function createPublicReservationTicket(supabase: SupabaseLike, clientId: number, body: QuotePayload) {
  const trackingCode = await generateUniqueTrackingCode(supabase, "TT");

  const metadata = {
    source: "public_api",
    form_type: "reserva",
    destination: body.destino,
    travel_period: body.periodo,
    passengers: body.passageiros,
    children: body.criancas,
    departure_city: body.cidadePartida,
    email: body.email,
    notes: body.observacoes,
  };

  const data = await insertTicket(supabase, {
    client_id: clientId,
    tracking_code: trackingCode,
    kind: "reserva",
    category: "comercial",
    status: "new",
    priority: "medium",
    subject: `Pedido de reserva - ${body.destino}`,
    description: `Pedido público de reserva para ${body.destino}`,
    customer_name: body.nome,
    customer_contact: body.telefone,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return data?.tracking_code || trackingCode;
}

export async function createPublicComplaintTicket(supabase: SupabaseLike, clientId: number, body: ComplaintPayload) {
  const trackingCode = await generateUniqueTrackingCode(supabase, "TT");

  const metadata = {
    source: "public_api",
    form_type: "reclamacao",
    email: body.email,
    reference: body.referencia,
    occurrence_date: body.dataOcorrencia,
    expected_resolution: body.expectativaResolucao,
  };

  const data = await insertTicket(supabase, {
    client_id: clientId,
    tracking_code: trackingCode,
    kind: "reclamacao",
    category: "pos_venda",
    status: "new",
    priority: "high",
    subject: body.referencia ? `Reclamação - ref. ${body.referencia}` : "Reclamação de cliente",
    description: body.descricao,
    customer_name: body.nome,
    customer_contact: body.telefone,
    metadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return data?.tracking_code || trackingCode;
}
