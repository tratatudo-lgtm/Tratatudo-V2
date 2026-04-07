from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/src/pages/admin/Clients.tsx")
text = path.read_text(encoding="utf-8")

old_fn = """  const handleProlongTrial = async () => {
    // TODO: Backend endpoint /api/admin/clients/:id/prolong does not exist yet.
    toast.info('Funcionalidade de prolongar trial aguarda implementação no backend.');
    setIsProlongModalOpen(false);
    setProlongingClient(null);
  };
"""

new_fn = """  const handleProlongTrial = async () => {
    if (!prolongingClient || processing) return;

    try {
      setProcessing(true);

      const response = await fetch(`${baseUrl}/api/admin/clients/${prolongingClient.id}/prolong-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days: 3 })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao prolongar trial');
      }

      toast.success(data.message || 'Trial prolongado com sucesso!');
      await fetchClients();
      setIsProlongModalOpen(false);
      setProlongingClient(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao prolongar trial');
    } finally {
      setProcessing(false);
    }
  };
"""

old_text = """                  <p className="text-xs text-blue-700 font-medium">Esta funcionalidade aguarda suporte no backend.</p>"""
new_text = """                  <p className="text-xs text-blue-700 font-medium">Ao confirmar, serão adicionados 3 dias ao período de trial do cliente.</p>"""

old_button = """>\\n                  Fechar\\n                </button>"""
new_button = """>\\n                  Prolongar 3 Dias\\n                </button>"""

if old_fn not in text:
    raise SystemExit("HANDLE_PROLONG_TRIAL_BLOCK_NOT_FOUND")

text = text.replace(old_fn, new_fn, 1)

if old_text in text:
    text = text.replace(old_text, new_text, 1)
else:
    raise SystemExit("MODAL_INFO_TEXT_NOT_FOUND")

if old_button in text:
    text = text.replace(old_button, new_button, 1)
else:
    raise SystemExit("MODAL_BUTTON_TEXT_NOT_FOUND")

path.write_text(text, encoding="utf-8")
print("CLIENTS_TSX_PROLONG_TRIAL_PATCHED_OK")
