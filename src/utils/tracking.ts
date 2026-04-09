type SupabaseLike = {
  from: (table: string) => {
    select: (fields: string) => {
      eq: (column: string, value: string) => {
        limit: (count: number) => Promise<{ data: any[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export function randomTrackingCode(prefix = "TT") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

export async function generateUniqueTrackingCode(supabase: SupabaseLike, prefix = "TT") {
  for (let i = 0; i < 10; i++) {
    const tracking = randomTrackingCode(prefix);
    const { data, error } = await supabase
      .from("tickets")
      .select("id")
      .eq("tracking_code", tracking)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return tracking;
  }

  throw new Error("Não foi possível gerar tracking_code único");
}
