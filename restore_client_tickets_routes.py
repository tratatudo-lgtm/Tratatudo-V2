from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if '/api/client/tickets"' in text:
    print("As rotas /api/client/tickets já existem. Nada a fazer.")
    raise SystemExit(0)

routes_block = r'''
// 🎫 CLIENT TICKETS
app.get("/api/client/tickets", requireClientSession, async (req: any, res: any) => {
  const clientId = String(req.clientId || "");

  try {
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({
      ok: true,
      tickets: tickets || []
    });
  } catch (err: any) {
    console.error("[CLIENT TICKETS ERROR]", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao carregar tickets"
    });
  }
});

app.get("/api/client/tickets/:id/messages", requireClientSession, async (req: any, res: any) => {
  const clientId = String(req.clientId || "");
  const { id } = req.params;

  try {
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, client_id")
      .eq("id", id)
      .eq("client_id", clientId)
      .single();

    if (ticketError || !ticket) {
      return res.status(403).json({
        ok: false,
        error: "Acesso negado."
      });
    }

    const { data: messages, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.json({
      ok: true,
      messages: messages || []
    });
  } catch (err: any) {
    console.error("[CLIENT TICKET MESSAGES ERROR]", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao carregar mensagens do ticket"
    });
  }
});
'''.strip() + "\n\n"

marker = '\n// 📊 TICKETS\napp.get("/api/admin/tickets"'
if marker in text:
    text = text.replace(marker, "\n" + routes_block + marker, 1)
else:
    fallback = 'app.get("/api/admin/tickets"'
    idx = text.find(fallback)
    if idx == -1:
        print("Não encontrei o ponto de inserção antes das rotas admin de tickets.")
        raise SystemExit(1)
    text = text[:idx] + routes_block + text[idx:]

path.write_text(text, encoding="utf-8")
print("Rotas client de tickets inseridas com sucesso em server.ts")
