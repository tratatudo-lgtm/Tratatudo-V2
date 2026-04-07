from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.get("/api/admin/instances/health"' in text:
    print("INSTANCES_HEALTH_ROUTE_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = "  // Helpers\n  function normalizePhone(phone: string): string {"
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND_V2")

block = '''  app.get("/api/admin/instances/health", requireAdminSession, async (_req: any, res) => {
    try {
      const health = await checkInstancesHealth();
      res.json({ ok: true, ...health });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Erro ao verificar saúde das instâncias." });
    }
  });

'''

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("INSTANCES_HEALTH_ROUTE_ADDED_OK")
