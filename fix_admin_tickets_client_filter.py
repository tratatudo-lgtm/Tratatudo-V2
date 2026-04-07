from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

old = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({
        ok: true,
        tickets: (tickets || []).map((t: any) => ({
          ...t,
          id: String(t.id ?? ""),
          client_id: String(t.client_id ?? ""),
          subject: t.subject || t.title || `Ticket ${t.id}`,
          title: t.title || t.subject || `Ticket ${t.id}`,
          description: t.description || t.text || "",
          status: t.status || "open",
          priority: t.priority || "medium",
          internal_notes: t.internal_notes || ""
        }))
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
'''

new = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    try {
      const clientFilter = String(req.query.client || "").trim();

      let query = supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientFilter) {
        query = query.eq("client_id", clientFilter);
      }

      const { data: tickets, error } = await query;
      if (error) throw error;

      res.json({
        ok: true,
        tickets: (tickets || []).map((t: any) => ({
          ...t,
          id: String(t.id ?? ""),
          client_id: String(t.client_id ?? ""),
          subject: t.subject || t.title || `Ticket ${t.id}`,
          title: t.title || t.subject || `Ticket ${t.id}`,
          description: t.description || t.text || "",
          status: t.status || "open",
          priority: t.priority || "medium",
          internal_notes: t.internal_notes || ""
        }))
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
'''

if old not in text:
    print("Bloco da rota /api/admin/tickets não encontrado.")
    raise SystemExit(1)

text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("Filtro client na rota /api/admin/tickets aplicado.")
