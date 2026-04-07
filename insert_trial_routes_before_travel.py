from pathlib import Path

active_path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
backup_path = Path("/home/ubuntu/Tratatudo-V2/server.ts.bak_20260403_tickets_restore")

active = active_path.read_text(encoding="utf-8")
backup = backup_path.read_text(encoding="utf-8")

markers = [
    'app.post("/api/admin/clients/trial"',
    'app.post("/api/admin/clients/:id/prolong-trial"',
    'app.post("/api/admin/clients/:id/reactivate-trial"',
]

anchor = '  app.get("/api/admin/clients/:id/travel-orders", requireAdminSession, async (req: any, res) => {'

if all(m in active for m in markers):
    print("As 3 rotas já existem no server.ts")
    raise SystemExit(0)

anchor_pos = active.find(anchor)
if anchor_pos == -1:
    raise RuntimeError("Não encontrei a âncora travel-orders no server.ts ativo.")

def extract_block(text: str, marker: str) -> str:
    start = text.find(marker)
    if start == -1:
        raise RuntimeError(f"Não encontrei no backup: {marker}")

    i = start
    depth = 0
    started = False

    while i < len(text):
        ch = text[i]
        if ch == "{":
            depth += 1
            started = True
        elif ch == "}":
            depth -= 1

        if started and depth == 0:
            end = text.find(");", i)
            if end == -1:
                raise RuntimeError(f"Não encontrei o fim da rota: {marker}")
            return text[start:end + 2].strip()

        i += 1

    raise RuntimeError(f"Não consegui extrair a rota: {marker}")

missing = []
for marker in markers:
    if marker not in active:
        missing.append(extract_block(backup, marker))

blob = "\n\n".join(missing).strip() + "\n\n"
new_text = active[:anchor_pos] + blob + active[anchor_pos:]
active_path.write_text(new_text, encoding="utf-8")

print("OK: rotas inseridas antes de travel-orders")
