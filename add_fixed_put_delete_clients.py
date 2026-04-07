from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.put("/api/admin/clients/:id"' in text:
    print("PUT_ROUTE_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = '  app.patch("/api/admin/clients/:id/status", requireAdminSession, async (req: any, res) => {'
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND")

block = '''  app.put("/api/admin/clients/:id", requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { company_name, phone_e164, email, status, bot_instructions, plan, trial_end, instance_name, production_instance_name } = req.body || {};

      if (!id) {
        return res.status(400).json({ ok: false, error: "ID do cliente é obrigatório." });
      }

      let checkQuery = supabase.from("clients").select("id").eq("id", id);
      if (req.adminScope === "client" && req.adminClientId) {
        checkQuery = checkQuery.eq("id", req.adminClientId);
      }

      const { data: existing, error: existingError } = await checkQuery.single();
      if (existingError || !existing) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      }

      const payload: any = {};
      if (company_name !== undefined) payload.company_name = company_name;
      if (email !== undefined) payload.email = email;
      if (status !== undefined) payload.status = status;
      if (bot_instructions !== undefined) payload.bot_instructions = bot_instructions;
      if (plan !== undefined) payload.plan = plan;
      if (trial_end !== undefined) payload.trial_end = trial_end;
      if (instance_name !== undefined) payload.instance_name = instance_name;
      if (production_instance_name !== undefined) payload.production_instance_name = production_instance_name;

      if (phone_e164 !== undefined) {
        let cleaned = String(phone_e164).replace(/\\D/g, "");
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
      return res.status(500).json({ ok: false, error: err?.message || "Erro ao atualizar cliente." });
    }
  });

  app.delete("/api/admin/clients/:id", requireAdminSession, async (req: any, res) => {
    try {
      const { id } = req.params;

      let checkQuery = supabase.from("clients").select("id").eq("id", id);
      if (req.adminScope === "client" && req.adminClientId) {
        checkQuery = checkQuery.eq("id", req.adminClientId);
      }

      const { data: existing, error: existingError } = await checkQuery.single();
      if (existingError || !existing) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado." });
      }

      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || "Erro ao eliminar cliente." });
    }
  });

'''

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("FIXED_PUT_DELETE_CLIENT_ROUTES_ADDED_OK")
