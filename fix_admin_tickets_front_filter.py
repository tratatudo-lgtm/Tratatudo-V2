from pathlib import Path
import re

p = Path("/home/ubuntu/Tratatudo-V2/src/pages/admin/Tickets.tsx")
t = p.read_text(encoding="utf-8")

if "useLocation" not in t:
    t = t.replace(
        "import { toast } from 'sonner';",
        "import { toast } from 'sonner';\nimport { useLocation } from 'react-router-dom';"
    )

t = t.replace(
    "  const { logout } = useAdminAuth();",
    "  const { logout } = useAdminAuth();\n  const location = useLocation();",
    1
)

t = t.replace(
    "      const data = await apiGet('/api/admin/tickets');",
    "      const params = new URLSearchParams(location.search);\n      const client = params.get('client');\n      const url = client ? `/api/admin/tickets?client=${encodeURIComponent(client)}` : '/api/admin/tickets';\n      const data = await apiGet(url);",
    1
)

t = t.replace(
    "  }, []);",
    "  }, [location.search]);",
    1
)

p.write_text(t, encoding="utf-8")
print("Frontend AdminTickets corrigido.")
