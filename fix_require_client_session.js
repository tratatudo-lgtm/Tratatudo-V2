const fs = require('fs');

const path = '/home/ubuntu/Tratatudo-V2/server.ts';
let file = fs.readFileSync(path, 'utf8');

if (file.includes('// CLIENT SESSION MIDDLEWARE FIX')) {
  console.log('Middleware já inserido.');
  process.exit(0);
}

const newMiddleware = `
// CLIENT SESSION MIDDLEWARE FIX
const requireClientSession = async (req: any, res: any, next: any) => {
  const token = req.cookies.tratatudo_client_session;

  if (!token) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const rawClientId =
      decoded?.clientId ??
      decoded?.client_id ??
      decoded?.selectedClientId ??
      decoded?.clientIdSelected;

    if (rawClientId === undefined || rawClientId === null || rawClientId === "") {
      res.clearCookie("tratatudo_client_session");
      return res.status(401).json({ ok: false, error: "invalid session" });
    }

    const clientId = Number(rawClientId);

    if (!Number.isInteger(clientId) || clientId <= 0) {
      res.clearCookie("tratatudo_client_session");
      return res.status(401).json({ ok: false, error: "invalid client id" });
    }

    req.clientId = clientId;
    req.client_id = clientId;
    req.userId = decoded?.userId ?? decoded?.user_id ?? null;
    req.role = decoded?.role ?? null;

    return next();
  } catch (err) {
    res.clearCookie("tratatudo_client_session");
    return res.status(401).json({ ok: false, error: "session expired" });
  }
};
`;

const marker = 'const requireAdminSession = async';
if (!file.includes(marker)) {
  console.error('Não encontrei requireAdminSession para inserir o middleware antes dele.');
  process.exit(1);
}

file = file.replace(marker, `${newMiddleware}\n${marker}`);
fs.writeFileSync(path, file, 'utf8');

console.log('OK: requireClientSession corrigido');
