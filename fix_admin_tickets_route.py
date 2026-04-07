from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

old = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, clients(company_name)").order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, company_name: (t.clients as any)?.company_name })) });
  });
'''

new = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
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

if old not in text:
    print("Bloco antigo dos tickets admin não encontrado.")
    raise SystemExit(1)

text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("Rota /api/admin/tickets corrigida.")
