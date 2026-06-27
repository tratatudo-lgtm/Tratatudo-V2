import { Request, Response, NextFunction } from "express";

/**
 * Middleware to protect high-impact administrative actions (Danger Zone).
 * Blocks critical requests unless a special header "x-confirm-danger" is included,
 * verifying that the administrator explicitly confirmed the security warning.
 */
export const adminDangerZone = (req: any, res: Response, next: NextFunction) => {
  // 1. Only admins are eligible to perform danger zone operations
  if (!req.isAdmin) {
    return res.status(403).json({
      ok: false,
      error: "Acesso administrativo negado. Ação apenas permitida a administradores autenticados."
    });
  }

  // 2. Look for the explicit safety confirmation header (usually set to 'confirmed' or present)
  const confirmHeader = req.headers["x-confirm-danger"];

  if (!confirmHeader || confirmHeader !== "confirmed") {
    // Audit log as a blocked danger action attempt
    console.warn(`[DANGER ZONE BLOCKED] Admin: ${req.user?.email || "unknown"} tried to execute ${req.method} ${req.originalUrl || req.url} without confirmation header.`);
    
    return res.status(400).json({
      ok: false,
      danger_protected: true,
      error: "Esta é uma ação de alto impacto (Danger Zone) e requer confirmação de segurança. Por favor, confirme a ação na janela e tente novamente."
    });
  }

  // Action confirmed, proceed safely
  next();
};
