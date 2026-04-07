from pathlib import Path
import re

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

pattern = r'''  app\.get\("/api/admin/dashboard/stats", requireAdminSession, async \(req: any, res\) => \{\n(?:.*\n)*?  \}\);\n'''
match = re.search(pattern, text)
if not match:
    raise SystemExit("DASHBOARD_ROUTE_NOT_FOUND")

replacement = '''  app.get("/api/admin/dashboard/stats", requireAdminSession, async (req: any, res) => {
    try {
      const [
        { data: clients },
        { data: messages },
        { data: instances },
        { data: tickets }
      ] = await Promise.all([
        supabase.from("clients").select("id, status, created_at"),
        supabase.from("wa_messages").select("id, created_at, direction"),
        supabase.from("client_instances").select("id, status, created_at"),
        supabase.from("tickets").select("id, status, created_at")
      ]);

      const allClients = clients || [];
      const allMessages = messages || [];
      const allInstances = instances || [];
      const allTickets = tickets || [];

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total_clients = allClients.length;
      const active_clients = allClients.filter((c: any) => String(c.status || "").toLowerCase() === "active").length;
      const trial_clients = allClients.filter((c: any) => String(c.status || "").toLowerCase() === "trial").length;
      const total_messages_24h = allMessages.filter((m: any) => new Date(m.created_at) >= last24h).length;
      const active_instances = allInstances.filter((i: any) => {
        const s = String(i.status || "").toLowerCase();
        return ["online", "open", "connected"].includes(s);
      }).length;

      const total_system_items = totalInstances = allInstances.length || 1;
      const healthy_system_items = active_instances;
      const system_health = Math.max(0, Math.min(100, Math.round((healthy_system_items / total_system_items) * 100)));

      const messages_chart = Array.from({ length: 7 }).map((_, idx) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (6 - idx));
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);

        return {
          date: `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`,
          count: allMessages.filter((m: any) => {
            const d = new Date(m.created_at);
            return d >= start && d <= end;
          }).length
        };
      });

      const clients_chart = Array.from({ length: 7 }).map((_, idx) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (6 - idx));
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);

        return {
          date: `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`,
          count: allClients.filter((c: any) => {
            const d = new Date(c.created_at);
            return d >= start && d <= end;
          }).length
        };
      });

      res.json({
        total_clients,
        active_clients,
        trial_clients,
        total_messages_24h,
        active_instances,
        system_health,
        messages_chart,
        clients_chart
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Erro ao carregar estatísticas do dashboard." });
    }
  });
'''

text = text[:match.start()] + replacement + text[match.end():]
path.write_text(text, encoding="utf-8")
print("DASHBOARD_STATS_SHAPE_FIXED_OK")
