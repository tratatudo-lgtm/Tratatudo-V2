from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/src/lib/auth/AdminAuthContext.tsx")
text = path.read_text(encoding="utf-8")

old = """const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.tratatudo.pt';
"""

new = """const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const normalizeApiBaseUrl = (raw?: string) => {
  const value = (raw || '').trim();
  if (!value) return 'https://api.tratatudo.pt';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.replace(/\\/$/, '');
  }
  return `https://${value.replace(/^\\/+/, '').replace(/\\/$/, '')}`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
"""

if old not in text:
    raise SystemExit("TARGET_BLOCK_NOT_FOUND")

text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("HARDEN_ADMIN_API_BASE_OK")
