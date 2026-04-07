from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.patch("/api/admin/clients/:id", requireAdminSession' in text:
    print("ADMIN_UPDATE_CLIENT_ROUTE_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = '  app.patch("/api/admin/clients/:id/status", requireAdminSession, async (req: any, res) => {'
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND")

block = '''  app.patch("/api/admin/clients/:id", requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;

      let checkQuery = supabase
        .from("clients")
        .select("id")
        .eq("id", id);

      if (req.adminScope === "client" && req.adminClientId) {
        checkQuery = checkQuery.eq("id", req.adminClientId);
      }

      const { data: existing, error: existingError } = await checkQuery.single();
      if (existingError || !existing) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      }

      const allowedFields = [
        "company_name",
        "email",
        "phone_e164",
        "status",
        "plan",
        "bot_instructions",
        "instance_name",
        "production_instance_name",
        "trial_end"
      ];

      const payload: any = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) payload[key] = req.body[key];
      }

      if (payload.phone_e164) {
        let cleaned = String(payload.phone_e164).replace(/\\D/g, "");
        if (cleaned.length === 9) cleaned = "351" + cleaned;
        payload.phone_e164 = "+" + cleaned;
      }

      payload.updated_at = new Date().toISOString();

      const { data: client, error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return res.json({ ok: true, client });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message || "Erro ao atualizar cliente." });
    }
  });

'''

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("ADMIN_UPDATE_CLIENT_ROUTE_ADDED_OK")
