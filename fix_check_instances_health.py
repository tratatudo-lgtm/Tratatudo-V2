from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if "async function checkInstancesHealth()" in text:
    print("CHECK_INSTANCES_HEALTH_ALREADY_EXISTS")
    raise SystemExit(0)

anchor = "  async function sendWhatsAppNotification(clientId: string, phone: string, text: string) {"
if anchor not in text:
    raise SystemExit("ANCHOR_NOT_FOUND")

block = """  async function checkInstancesHealth() {
    try {
      const { data: instances, error } = await supabase
        .from("client_instances")
        .select("id, client_id, instance_name, status, updated_at");

      if (error) {
        return { ok: false, instances: [], error: error.message };
      }

      const normalized = (instances || []).map((inst: any) => ({
        id: inst.id,
        client_id: inst.client_id,
        instance_name: inst.instance_name,
        status: inst.status || "unknown",
        updated_at: inst.updated_at || null
      }));

      return {
        ok: true,
        total: normalized.length,
        online: normalized.filter((i: any) => String(i.status).toLowerCase() === "online").length,
        offline: normalized.filter((i: any) => String(i.status).toLowerCase() !== "online").length,
        instances: normalized
      };
    } catch (err: any) {
      return { ok: false, instances: [], error: err.message || "Erro ao verificar instâncias." };
    }
  }

"""

text = text.replace(anchor, block + anchor, 1)
path.write_text(text, encoding="utf-8")
print("CHECK_INSTANCES_HEALTH_ADDED_OK")
