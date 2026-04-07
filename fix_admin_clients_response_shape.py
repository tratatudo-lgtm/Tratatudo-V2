from pathlib import Path
import re

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

pattern = r'''  app\.get\("/api/admin/clients", requireAdminSession, async \(req: any, res\) => \{\n(?:.*\n)*?  \}\);\n'''
match = re.search(pattern, text)
if not match:
    raise SystemExit("ADMIN_CLIENTS_ROUTE_NOT_FOUND")

replacement = '''  app.get("/api/admin/clients", requireAdminSession, async (req: any, res) => {
    try {
      const { search } = req.query;

      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (req.adminScope === "client" && req.adminClientId) {
        query = query.eq("id", req.adminClientId);
      }

      if (search) {
        query = query.or(`company_name.ilike.%${search}%,phone_e164.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: clients, error } = await query;
      if (error) throw error;

      const clientIds = (clients || []).map((c: any) => c.id).filter(Boolean);

      let instancesByClientId: Record<string, any> = {};
      if (clientIds.length > 0) {
        const { data: instances, error: instancesError } = await supabase
          .from("client_instances")
          .select("client_id, instance_name, status, updated_at")
          .in("client_id", clientIds)
          .order("updated_at", { ascending: false });

        if (instancesError) throw instancesError;

        for (const inst of (instances || [])) {
          if (!instancesByClientId[inst.client_id]) {
            instancesByClientId[inst.client_id] = inst;
          }
        }
      }

      const normalizedClients = (clients || []).map((client: any) => {
        const inst = instancesByClientId[client.id] || null;
        const resolvedInstanceName =
          inst?.instance_name ||
          client.production_instance_name ||
          client.instance_name ||
          null;

        return {
          ...client,
          client_id: client.id,
          email: client.email || "",
          phone: client.phone_e164 || "",
          instance: resolvedInstanceName ? {
            instance_name: resolvedInstanceName,
            status: inst?.status || (resolvedInstanceName === "TrataTudo bot" ? "hub" : "unknown"),
            is_hub: resolvedInstanceName === "TrataTudo bot"
          } : null
        };
      });

      res.json({ ok: true, clients: normalizedClients });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || "Erro ao carregar clientes." });
    }
  });
'''

text = text[:match.start()] + replacement + text[match.end():]
path.write_text(text, encoding="utf-8")
print("ADMIN_CLIENTS_RESPONSE_SHAPE_FIXED_OK")
