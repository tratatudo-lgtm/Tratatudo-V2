from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

blocks = []

if 'app.get("/api/admin/instances"' not in text:
    blocks.append(r'''
  app.get("/api/admin/instances", requireAdminSession, async (req: any, res) => {
    try {
      const { data: instances, error } = await supabase
        .from("client_instances")
        .select("id, client_id, instance_name, status, is_hub, updated_at, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const clientIds = [...new Set((instances || []).map((i: any) => i.client_id).filter(Boolean))];
      let clientsById = new Map();

      if (clientIds.length > 0) {
        const { data: clients } = await supabase
          .from("clients")
          .select("id, company_name, phone_e164")
          .in("id", clientIds);

        for (const c of (clients || [])) clientsById.set(c.id, c);
      }

      const normalized = (instances || []).map((i: any) => {
        const client = clientsById.get(i.client_id);
        return {
          id: String(i.id),
          client_id: String(i.client_id),
          company_name: client?.company_name || "Sem cliente",
          instance_name: i.instance_name || "",
          status: i.status === "open" ? "online" : (i.status || "offline"),
          whatsapp_number: client?.phone_e164 || "",
          last_connected: i.updated_at || i.created_at,
          is_hub: !!i.is_hub,
          updated_at: i.updated_at || i.created_at
        };
      });

      res.json({ ok: true, instances: normalized });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
''')

if 'app.get("/api/admin/messages"' not in text:
    blocks.append(r'''
  app.get("/api/admin/messages", requireAdminSession, async (req: any, res) => {
    try {
      const { data: messages, error } = await supabase
        .from("wa_messages")
        .select("id, client_id, phone_e164, text, direction, instance, created_at")
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;

      const normalized = (messages || []).map((m: any) => ({
        id: String(m.id),
        client_id: String(m.client_id || ""),
        phone_e164: m.phone_e164 || "",
        text: m.text || "",
        direction: m.direction || "inbound",
        instance: m.instance || "",
        created_at: m.created_at
      }));

      res.json({ ok: true, messages: normalized });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
''')

if 'app.get("/api/admin/subscriptions"' not in text:
    blocks.append(r'''
  app.get("/api/admin/subscriptions", requireAdminSession, async (req: any, res) => {
    try {
      const { data: subs, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const clientIds = [...new Set((subs || []).map((s: any) => s.client_id).filter(Boolean))];
      let clientsById = new Map();

      if (clientIds.length > 0) {
        const { data: clients } = await supabase
          .from("clients")
          .select("id, company_name")
          .in("id", clientIds);

        for (const c of (clients || [])) clientsById.set(c.id, c);
      }

      const normalized = (subs || []).map((s: any) => ({
        id: String(s.id),
        client_id: String(s.client_id || ""),
        company_name: clientsById.get(s.client_id)?.company_name || "Sem cliente",
        plan: s.plan_name || s.plan || "starter",
        status: s.status || "inactive",
        amount: Number(s.price_monthly || 0),
        next_billing: s.current_period_end || s.updated_at || s.created_at,
        created_at: s.created_at
      }));

      res.json({ ok: true, subscriptions: normalized });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
''')

if 'app.get("/api/admin/logs"' not in text:
    blocks.append(r'''
  app.get("/api/admin/logs", requireAdminSession, async (req: any, res) => {
    try {
      const logs: any[] = [];

      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("id, created_at, status, title, subject")
        .order("created_at", { ascending: false })
        .limit(20);

      for (const t of (recentTickets || [])) {
        logs.push({
          id: `ticket-${t.id}`,
          level: "info",
          source: "api",
          message: `Ticket ${t.id} - ${(t.subject || t.title || t.status || "evento")}`,
          details: "",
          created_at: t.created_at
        });
      }

      const { data: recentInstances } = await supabase
        .from("client_instances")
        .select("id, instance_name, status, updated_at, created_at")
        .order("updated_at", { ascending: false })
        .limit(20);

      for (const i of (recentInstances || [])) {
        logs.push({
          id: `instance-${i.id}`,
          level: i.status === "open" ? "info" : "warning",
          source: "whatsapp",
          message: `Instância ${i.instance_name} com estado ${i.status}`,
          details: "",
          created_at: i.updated_at || i.created_at
        });
      }

      logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json({ ok: true, logs: logs.slice(0, 100) });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });
''')

if not blocks:
    print("Todas as rotas principais já existem.")
    raise SystemExit(0)

anchor = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, clients(company_name)").order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, company_name: (t.clients as any)?.company_name })) });
  });
'''

if anchor not in text:
    print("Não encontrei o bloco âncora dos tickets admin.")
    raise SystemExit(1)

insert = "\n".join(blocks) + "\n" + anchor
text = text.replace(anchor, insert, 1)
path.write_text(text, encoding="utf-8")
print("Rotas admin restantes adicionadas com sucesso.")
