from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if '/api/admin/dashboard/stats' in text:
    print("DASHBOARD_ROUTE_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = '  // Admin Billing (SaaS Operation)'
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND")

block = '''  app.get("/api/admin/dashboard/stats", requireAdminSession, async (req: any, res) => {
    try {
      const [
        { data: tickets },
        { data: travelOrders },
        { data: travelPayments },
        { count: totalClients }
      ] = await Promise.all([
        supabase.from("tickets").select("status"),
        supabase.from("travel_orders").select("sales_status, payment_status, amount_due"),
        supabase.from("travel_payments").select("status, amount"),
        supabase.from("clients").select("id", { count: "exact", head: true })
      ]);

      const openTickets = (tickets || []).filter((t: any) =>
        ["novo", "nova", "aberto", "em análise", "em investigacao", "em investigação", "em execução", "em execucao", "a aguardar cliente", "a aguardar resposta"]
          .includes(String(t.status || "").toLowerCase())
      ).length;

      const resolvedTickets = (tickets || []).filter((t: any) =>
        ["resolvido", "resolvida", "concluído", "concluido", "encerrado", "encerrada", "done", "closed"]
          .includes(String(t.status || "").toLowerCase())
      ).length;

      const pendingPayments = (travelPayments || []).filter((p: any) =>
        String(p.status || "").toLowerCase() === "pending"
      ).length;

      const totalPaid = (travelPayments || [])
        .filter((p: any) => String(p.status || "").toLowerCase() === "paid")
        .reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

      const totalOutstanding = (travelOrders || [])
        .reduce((acc: number, o: any) => acc + Number(o.amount_due || 0), 0);

      res.json({
        ok: true,
        stats: {
          totalClients: totalClients || 0,
          totalTickets: tickets?.length || 0,
          openTickets,
          resolvedTickets,
          totalTravelOrders: travelOrders?.length || 0,
          pendingPayments,
          totalPaid,
          totalOutstanding
        }
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Erro ao carregar estatísticas do dashboard." });
    }
  });

'''

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("DASHBOARD_ROUTE_ADDED_OK")
