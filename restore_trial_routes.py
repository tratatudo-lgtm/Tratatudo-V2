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

def extract_route_block(text: str, marker: str) -> str:
    start = text.find(marker)
    if start == -1:
        raise RuntimeError(f"Marker não encontrado: {marker}")

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
                break
            return text[start:end + 2].strip()

        i += 1

    raise RuntimeError(f"Não foi possível extrair a rota: {marker}")

missing_blocks = []
for marker in markers:
    if marker not in active:
        missing_blocks.append(extract_route_block(backup, marker))

if not missing_blocks:
    print("As rotas já existem no server.ts")
    raise SystemExit(0)

anchor_candidates = [
    "\napp.listen(",
    "\nconst PORT =",
    "\nconst port =",
    "\nexport default app",
]

insert_pos = -1
for anchor in anchor_candidates:
    pos = active.find(anchor)
    if pos != -1:
        insert_pos = pos
        break

if insert_pos == -1:
    raise RuntimeError("Não encontrei ponto seguro para inserir as rotas.")

new_text = active[:insert_pos].rstrip() + "\n\n" + "\n\n".join(missing_blocks) + "\n\n" + active[insert_pos:]
active_path.write_text(new_text, encoding="utf-8")

print("OK: rotas repostas no server.ts")
