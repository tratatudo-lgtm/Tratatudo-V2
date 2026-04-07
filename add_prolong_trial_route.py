from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.post("/api/admin/clients/:id/prolong-trial"' in text:
    print("PROLONG_TRIAL_ROUTE_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = '  app.post("/api/admin/clients/:id/activate-production", requireAdminSession, async (req: any, res) => {'
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND")

block = '''  app.post("/api/admin/clients/:id/prolong-trial", requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const days = Number(req.body?.days || 3);

      if (!id) {
        return res.status(400).json({ ok: false, error: "ID do cliente é obrigatório." });
      }

      if (!Number.isFinite(days) || days <= 0 || days > 365) {
        return res.status(400).json({ ok: false, error: "Número de dias inválido." });
      }

      let checkQuery = supabase
        .from("clients")
        .select("id, status, trial_end")
        .eq("id", id);

      if (req.adminScope === "client" && req.adminClientId) {
        checkQuery = checkQuery.eq("id", req.adminClientId);
      }

      const { data: client, error: checkError } = await checkQuery.single();
      if (checkError || !client) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      }

      const now = new Date();
      const baseDate =
        client.trial_end && new Date(client.trial_end) > now
          ? new Date(client.trial_end)
          : now;

      baseDate.setDate(baseDate.getDate() + days);

      const { data: updated, error } = await supabase
        .from("clients")
        .update({
          trial_end: baseDate.toISOString(),
          updated_at: new Date().toISOString(),
          status: client.status === "suspended" ? "trial" : client.status
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return res.json({
        ok: true,
        client: updated,
        message: `Trial prolongado por ${days} dias.`
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || "Erro ao prolongar trial." });
    }
  });

'''

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("PROLONG_TRIAL_ROUTE_ADDED_OK")
