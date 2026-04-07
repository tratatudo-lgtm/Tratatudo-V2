from pathlib import Path
import re

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

if old_fn not in text:
    raise SystemExit("HANDLE_PROLONG_TRIAL_BLOCK_NOT_FOUND")

text = text.replace(old_fn, new_fn, 1)

text = text.replace(
    'Esta funcionalidade aguarda suporte no backend.',
    'Ao confirmar, serão adicionados 3 dias ao período de trial do cliente.',
    1
)

pattern = r'(<button\s+[^>]*onClick=\{handleProlongTrial\}[^>]*>\s*)(Fechar)(\s*</button>)'
new_text, count = re.subn(pattern, r'\1Prolongar 3 Dias\3', text, count=1, flags=re.S)

if count != 1:
    raise SystemExit("HANDLE_PROLONG_TRIAL_BUTTON_NOT_FOUND")

path.write_text(new_text, encoding="utf-8")
print("CLIENTS_TSX_PROLONG_TRIAL_PATCHED_OK")
