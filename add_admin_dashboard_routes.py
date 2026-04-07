from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.get("/api/admin/dashboard/stats"' in text and 'app.get("/api/admin/alerts"' in text:
    print("Rotas já existem.")
    raise SystemExit(0)

anchor = '''  app.get("/api/admin/tickets", requireAdminSession, async (req: any, res) => {
    const { data: tickets } = await supabase.from("tickets").select("*, clients(company_name)").order("created_at", { ascending: false });
    res.json({ ok: true, tickets: tickets?.map(t => ({ ...t, company_name: (t.clients as any)?.company_name })) });
  });
'''

insert = '''  app.get("/api/admin/dashboard/stats", requireAdminSession, async (req: any, res) => {
    try {
      const [
        { count: totalClients },
        { count: activeClients },
        { count: trialClients },
        { count: totalMessages24h },
        { count: activeInstances }
      ] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "trial"),
        supabase.from("wa_messages").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24*60*60*1000).toISOString()),
        supabase.from("client_instances").select("id", { count: "exact", head: true }).eq("status", "open")
      ]);

      const messages_chart = [];
      for (let i = 6; i >= 0; i--) {
        const d1 = new Date();
        d1.setDate(d1.getDate() - i);
        d1.setHours(0, 0, 0, 0);

        const d2 = new Date(d1);
        d2.setHours(23, 59, 59, 999);

        const { count } = await supabase
          .from("wa_messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", d1.toISOString())
          .lte("created_at", d2.toISOString());

        messages_chart.push({
          date: d1.toISOString().slice(5, 10),
          count: count || 0
        });
      }

      const clients_chart = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);

        const { count } = await supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .lte("created_at", ds + "T23:59:59.999Z");

        clients_chart.push({
          date: ds.slice(5, 10),
          count: count || 0
        });
      }

      res.json({
        total_clients: totalClients || 0,
        active_clients: activeClients || 0,
        trial_clients: trialClients || 0,
        total_messages_24h: totalMessages24h || 0,
        active_instances: activeInstances || 0,
        system_health: 100,
        messages_chart,
        clients_chart
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  app.get("/api/admin/alerts", requireAdminSession, async (req: any, res) => {
    res.json({
      alerts: []
    });
  });

''' + anchor

if anchor not in text:
    print("Não encontrei o bloco âncora dos tickets admin.")
    raise SystemExit(1)

text = text.replace(anchor, insert, 1)
path.write_text(text, encoding="utf-8")
print("Rotas admin dashboard/alerts adicionadas com sucesso.")
