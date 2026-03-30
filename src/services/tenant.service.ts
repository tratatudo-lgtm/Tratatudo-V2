import { safeString } from "../utils/helpers";

type SupabaseLike = {
  from: (table: string) => {
    select: (fields: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: any; error: { message: string } | null }>;
      };
    };
  };
};

export function getImportsClientId() {
  const raw = process.env.IMPORTS_CLIENT_ID;
  if (!raw) {
    throw new Error("IMPORTS_CLIENT_ID não configurado");
  }

  const clientId = Number(raw);
  if (!Number.isFinite(clientId) || clientId <= 0) {
    throw new Error("IMPORTS_CLIENT_ID inválido");
  }

  return clientId;
}

export async function resolvePublicClientId(supabase: SupabaseLike, siteKey?: string, clientSlug?: string) {
  const normalized = safeString(siteKey || clientSlug).toLowerCase();

  if (!normalized) {
    throw new Error("site_key ou client_slug é obrigatório");
  }

  const importsSiteKey = safeString(process.env.IMPORTS_SITE_KEY || "imports-turismo-br").toLowerCase();
  if (normalized === importsSiteKey) {
    return getImportsClientId();
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("slug", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("Cliente público não encontrado para este site_key/client_slug");
  }

  return Number(data.id);
}
