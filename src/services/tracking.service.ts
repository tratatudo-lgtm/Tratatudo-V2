import { mapPublicStatus, safeString } from "../utils/helpers";

type SupabaseLike = {
  from: (table: string) => {
    select: (fields: string) => {
      eq: (column: string, value: string | number) => {
        eq: (column: string, value: string | number) => {
          maybeSingle: () => Promise<{ data: any; error: { message: string } | null }>;
        };
        maybeSingle?: () => Promise<{ data: any; error: { message: string } | null }>;
      };
    };
  };
};

export async function getPublicTrackingByCode(supabase: SupabaseLike, clientId: number, trackingCode: string) {
  const normalizedCode = safeString(trackingCode).toUpperCase();

  const query = supabase
    .from("tickets")
    .select("tracking_code, status, customer_name, created_at, metadata")
    .eq("client_id", clientId)
    .eq("tracking_code", normalizedCode);

  const { data, error } = await (query as any).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const meta = data.metadata && typeof data.metadata === "object" ? data.metadata : {};

  return {
    trackingCode: data.tracking_code,
    status: mapPublicStatus(data.status || "new"),
    nome: safeString(data.customer_name),
    destino: safeString(meta.destination),
    periodo: safeString(meta.travel_period),
    createdAt: data.created_at || null,
  };
}
