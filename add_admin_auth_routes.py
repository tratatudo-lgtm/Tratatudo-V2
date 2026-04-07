from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

if 'app.get("/api/admin/auth/session"' in text and 'app.post("/api/admin/auth/logout"' in text:
    print("Rotas já existem.")
    raise SystemExit(0)

anchor = '''  app.post("/api/admin/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) return res.status(401).json({ ok: false, error: "Credenciais inválidas." });
    const { data: admin } = await supabase.from("admins").select("*").eq("user_id", authData.user.id).single();
    if (!admin) return res.status(403).json({ ok: false, error: "Acesso negado." });
    const token = jwt.sign({ userId: authData.user.id, email: authData.user.email, isAdmin: true }, JWT_SECRET, { expiresIn: "12h" });
    res.cookie("tratatudo_admin_session", token, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 12 * 60 * 60 * 1000 });
    res.json({ ok: true, email: authData.user.email });
  });
'''

insert = anchor + '''

  app.get("/api/admin/auth/session", async (req, res) => {
    const token = req.cookies.tratatudo_admin_session;
    if (!token) return res.json({ ok: true, authenticated: false });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded.isAdmin) throw new Error("Not admin");

      const { data: admin } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", decoded.userId)
        .single();

      if (!admin) {
        res.clearCookie("tratatudo_admin_session", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        });
        return res.json({ ok: true, authenticated: false });
      }

      return res.json({
        ok: true,
        authenticated: true,
        email: decoded.email,
        role: admin.role || "admin",
      });
    } catch (err) {
      res.clearCookie("tratatudo_admin_session", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      return res.json({ ok: true, authenticated: false });
    }
  });

  app.post("/api/admin/auth/logout", (req, res) => {
    res.clearCookie("tratatudo_admin_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ ok: true });
  });
'''

if anchor not in text:
    print("Não encontrei o bloco âncora do login admin.")
    raise SystemExit(1)

text = text.replace(anchor, insert, 1)
path.write_text(text, encoding="utf-8")
print("Rotas admin session/logout adicionadas com sucesso.")
