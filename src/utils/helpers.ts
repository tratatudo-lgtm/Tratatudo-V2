export function normalizePhoneLoose(raw: string) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("351")) return `+${digits}`;
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length === 9) return `+351${digits}`;
  return `+${digits}`;
}

export function safeString(value: unknown) {
  return String(value || "").trim();
}

export function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapPublicStatus(status: string) {
  const s = String(status || "").toLowerCase();
  if (["new", "novo", "aberto", "open"].includes(s)) return "pendente";
  if (["em análise", "em analise", "analysis", "in_review", "in_progress", "em tratamento"].includes(s)) return "em_analise";
  if (["resolved", "done", "closed", "concluído", "concluido", "resolvido", "confirmado"].includes(s)) return "concluido";
  return "pendente";
}
