from pathlib import Path

path = Path("/home/ubuntu/Tratatudo-V2/server.ts")
text = path.read_text(encoding="utf-8")

start_send = 'app.post("/api/auth/send-otp", async (req: any, res: any) => {'
start_verify = 'app.post("/api/auth/verify-otp", async (req: any, res: any) => {'
start_session = 'app.get("/api/auth/session", async (req: any, res: any) => {'
start_logout = 'app.post("/api/auth/logout", async (req: any, res: any) => {'

i1 = text.find(start_send)
i2 = text.find(start_verify)
i3 = text.find(start_session)
i4 = text.find(start_logout)

if min(i1, i2, i3, i4) == -1:
    raise SystemExit("ERRO: não encontrei um ou mais blocos no server.ts")

new_send = '''app.post("/api/auth/send-otp", async (req: any, res: any) => {
  try {
    const phoneRaw = req.body?.phone_e164 || req.body?.phone || "";
    const phone_e164 = normalizePhoneE164(phoneRaw);

    if (!phone_e164) {
      return res.status(400).json({ ok: false, error: "Número inválido" });
    }

    const normalizedGlobalAdmin =
      GLOBAL_ADMIN_PHONE ? normalizePhoneE164(GLOBAL_ADMIN_PHONE) : "";

    const isGlobalAdminPhone =
      !!normalizedGlobalAdmin && phone_e164 === normalizedGlobalAdmin;

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, company_name, phone_e164, instance_name, production_instance_name, status, trial_end, trial_ends_at, created_at")
      .eq("phone_e164", phone_e164)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (clientError) {
      return res.status(500).json({ ok: false, error: clientError.message });
    }

    const { data: clientUser, error: clientUserError } = await supabase
      .from("client_users")
      .select("id, client_id, phone_e164, role, status")
      .eq("phone_e164", phone_e164)
      .limit(1)
      .maybeSingle();

    if (clientUserError) {
      return res.status(500).json({ ok: false, error: clientUserError.message });
    }

    const { data: adminByPhone, error: adminError } = await supabase
      .from("admins")
      .select("id, user_id, client_id, scope, phone_e164")
      .eq("phone_e164", phone_e164)
      .limit(1)
      .maybeSingle();

    if (adminError) {
      return res.status(500).json({ ok: false, error: adminError.message });
    }

    const isAdminByPhone = !!adminByPhone?.id;
    const allowGlobalAccess = isGlobalAdminPhone || isAdminByPhone;

    let resolvedClientId = client?.id ? String(client.id) : "";

    if (!resolvedClientId && clientUser?.client_id) {
      resolvedClientId = String(clientUser.client_id);
    }

    if (!resolvedClientId && adminByPhone?.client_id) {
      resolvedClientId = String(adminByPhone.client_id);
    }

    if (!resolvedClientId && !allowGlobalAccess) {
      return res.status(404).json({
        ok: false,
        error: "Este número não está associado a nenhum cliente."
      });
    }

    if (client?.id) {
      const status = String(client.status || "").toLowerCase();
      const trialEndRaw = client.trial_end || client.trial_ends_at || null;
      const trialActive =
        status === "trial" &&
        (!trialEndRaw || new Date(trialEndRaw).getTime() >= Date.now());
      const activeAllowed = status === "active" || trialActive;

      if (!activeAllowed && !allowGlobalAccess) {
        return res.status(403).json({
          ok: false,
          error: "Este acesso não está ativo."
        });
      }
    }

    const code = generateOtpCode();

    otpStore.set(phone_e164, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      clientId: resolvedClientId || "global",
      phone_e164
    });

    const instanceName =
      client?.production_instance_name ||
      client?.instance_name ||
      "TrataTudo bot";

    const textMessage = `O teu código de acesso TrataTudo é: ${code}\\n\\nEste código expira em 10 minutos.`;

    const sent = await sendWhatsAppOtp(instanceName, phone_e164, textMessage);

    if (!sent.ok) {
      return res.status(500).json({
        ok: false,
        error: "Não foi possível enviar o código por WhatsApp."
      });
    }

    return res.json({
      ok: true,
      message: "Código enviado com sucesso para o WhatsApp."
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao enviar OTP"
    });
  }
});
'''

new_verify = '''app.post("/api/auth/verify-otp", async (req: any, res: any) => {
  try {
    const phoneRaw = req.body?.phone_e164 || req.body?.phone || "";
    const phone_e164 = normalizePhoneE164(phoneRaw);
    const code = String(req.body?.code || "").trim();
    const requestedClientId = String(req.body?.clientId || "").trim();

    if (!phone_e164 || !/^\\d{6}$/.test(code)) {
      return res.status(400).json({ ok: false, error: "Dados inválidos" });
    }

    const stored = otpStore.get(phone_e164);
    if (!stored) {
      return res.status(401).json({ ok: false, error: "Código inválido ou expirado" });
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(phone_e164);
      return res.status(401).json({ ok: false, error: "Código expirado" });
    }

    if (stored.code !== code) {
      return res.status(401).json({ ok: false, error: "Código inválido" });
    }

    const normalizedGlobalAdmin =
      GLOBAL_ADMIN_PHONE ? normalizePhoneE164(GLOBAL_ADMIN_PHONE) : "";

    const isGlobalAdminPhone =
      !!normalizedGlobalAdmin && phone_e164 === normalizedGlobalAdmin;

    const { data: adminByPhone, error: adminError } = await supabase
      .from("admins")
      .select("id, user_id, client_id, scope, phone_e164")
      .eq("phone_e164", phone_e164)
      .limit(1)
      .maybeSingle();

    if (adminError) {
      return res.status(500).json({ ok: false, error: adminError.message });
    }

    const isGlobalAdmin =
      isGlobalAdminPhone || String(adminByPhone?.scope || "").toLowerCase() === "global";

    let client: any = null;
    let role = "admin";
    let userId = "";

    if (isGlobalAdmin) {
      if (!requestedClientId) {
        return res.status(400).json({
          ok: false,
          error: "clientId é obrigatório para administrador global."
        });
      }

      const { data: forcedClient, error: forcedClientError } = await supabase
        .from("clients")
        .select("id, company_name, phone_e164, status")
        .eq("id", requestedClientId)
        .maybeSingle();

      if (forcedClientError) {
        return res.status(500).json({ ok: false, error: forcedClientError.message });
      }

      if (!forcedClient?.id) {
        return res.status(404).json({
          ok: false,
          error: "Cliente não encontrado."
        });
      }

      client = forcedClient;
      role = "admin";
      userId = String(adminByPhone?.user_id || "global_admin");
    } else {
      const { data: clientUser, error: clientUserError } = await supabase
        .from("client_users")
        .select("id, client_id, role, status")
        .eq("phone_e164", phone_e164)
        .limit(1)
        .maybeSingle();

      if (clientUserError) {
        return res.status(500).json({ ok: false, error: clientUserError.message });
      }

      if (clientUser?.client_id) {
        const { data: clientFromUser, error: clientFromUserError } = await supabase
          .from("clients")
          .select("id, company_name, phone_e164, status")
          .eq("id", clientUser.client_id)
          .maybeSingle();

        if (clientFromUserError) {
          return res.status(500).json({ ok: false, error: clientFromUserError.message });
        }

        client = clientFromUser;
        role = String(clientUser.role || "visualizador");
        userId = String(clientUser.id);
      }

      if (!client?.id) {
        const targetClientId =
          stored.clientId && stored.clientId !== "global" ? stored.clientId : "";

        if (targetClientId) {
          const { data: clientByStoredId, error: clientByStoredIdError } = await supabase
            .from("clients")
            .select("id, company_name, phone_e164, status")
            .eq("id", targetClientId)
            .maybeSingle();

          if (clientByStoredIdError) {
            return res.status(500).json({ ok: false, error: clientByStoredIdError.message });
          }

          if (clientByStoredId?.id) {
            client = clientByStoredId;
            role = "admin";
            userId = String(clientByStoredId.id);
          }
        }
      }

      if (!client?.id) {
        return res.status(404).json({ ok: false, error: "Cliente não encontrado" });
      }
    }

    otpStore.delete(phone_e164);

    const tokenPayload = {
      isClient: true,
      userId: String(userId || client.id),
      client_id: String(client.id),
      phone_e164,
      company_name: client.company_name || "",
      role,
      is_global_admin: isGlobalAdmin,
      can_act_as_admin: isGlobalAdmin,
      can_act_as_client: isGlobalAdmin
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie(HUB_OTP_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      ok: true,
      authenticated: true,
      client: {
        id: String(client.id),
        company_name: client.company_name || "",
        phone_e164: client.phone_e164 || "",
        role,
        userId: String(userId || client.id)
      },
      clientId: String(client.id),
      is_global_admin: isGlobalAdmin,
      can_act_as_admin: isGlobalAdmin,
      can_act_as_client: isGlobalAdmin
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Erro ao validar OTP"
    });
  }
});
'''

new_session = '''app.get("/api/auth/session", async (req: any, res: any) => {
  try {
    const token = req.cookies?.[HUB_OTP_COOKIE];
    if (!token) {
      return res.status(200).json({ authenticated: false });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (!decoded?.client_id) {
      return res.status(200).json({ authenticated: false });
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select("id, company_name, phone_e164")
      .eq("id", decoded.client_id)
      .maybeSingle();

    if (error || !client?.id) {
      return res.status(200).json({ authenticated: false });
    }

    return res.json({
      authenticated: true,
      userId: String(decoded.userId || client.id),
      id: String(client.id),
      clientId: String(client.id),
      phone_e164: decoded.phone_e164 || client.phone_e164 || "",
      company_name: client.company_name || "",
      role: decoded.role || "admin",
      is_global_admin: !!decoded.is_global_admin,
      can_act_as_admin: !!decoded.can_act_as_admin,
      can_act_as_client: !!decoded.can_act_as_client,
      finePermissions: []
    });
  } catch (err: any) {
    return res.status(500).json({
      authenticated: false,
      error: err?.message || "Erro ao validar sessão"
    });
  }
});
'''

text = text[:i1] + new_send + "\n" + new_verify + "\n" + new_session + "\n" + text[i4:]
path.write_text(text, encoding="utf-8")
print("OK: blocos auth atualizados em server.ts")
