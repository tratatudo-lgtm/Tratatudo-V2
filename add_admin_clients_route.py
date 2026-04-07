from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.get("/api/admin/clients"' in text:
    print("Rota /api/admin/clients já existe.")
    raise SystemExit(0)

anchor = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, clients(company_name)").order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, company_name: (t.clients as any)?.company_name })) });
  });
'''

insert = '''  app.get("/api/admin/clients", requireAdminSession, async (req: any, res) => {
    try {
      const { data: clients, error } = await supabase
        .from("clients")
        .select("id, company_name, email, phone_e164, status, trial_start, trial_end, created_at, production_activated_at, bot_instructions")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const clientIds = (clients || []).map(c => c.id);

      let instancesByClient = new Map();
      if (clientIds.length > 0) {
        const { data: instances } = await supabase
          .from("client_instances")
          .select("client_id, instance_name, status, is_hub, created_at")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false });

        for (const inst of (instances || [])) {
          if (!instancesByClient.has(inst.client_id)) {
            instancesByClient.set(inst.client_id, inst);
          }
        }
      }

      const normalized = (clients || []).map((c: any) => ({
        id: String(c.id),
        client_id: String(c.id),
        company_name: c.company_name || "",
        contact_name: c.company_name || "",
        email: c.email || "",
        phone: c.phone_e164 || "",
        status: c.status || "pending",
        plan: "starter",
        trial_start: c.trial_start,
        trial_end: c.trial_end,
        production_activated_at: c.production_activated_at,
        bot_instructions: c.bot_instructions || "",
        created_at: c.created_at,
        instance: instancesByClient.get(c.id)
          ? {
              instance_name: instancesByClient.get(c.id).instance_name,
              status: instancesByClient.get(c.id).status,
              is_hub: !!instancesByClient.get(c.id).is_hub
            }
          : null
      }));

      res.json({ ok: true, clients: normalized });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

''' + anchor

if anchor not in text:
    print("Não encontrei o bloco âncora.")
    raise SystemExit(1)

text = text.replace(anchor, insert, 1)
path.write_text(text, encoding="utf-8")
print("Rota /api/admin/clients adicionada com sucesso.")
