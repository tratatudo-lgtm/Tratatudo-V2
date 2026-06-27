import { NextFunction, Response } from "express";
import { logAdminAction } from "../services/adminAudit.service";

/**
 * Middleware to intercept res.json and automatically log audits for any action
 * taken by an authenticated administrator.
 */
export const adminAuditMiddleware = (req: any, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  // Intercept res.json
  res.json = function (body: any) {
    try {
      if (req.isAdmin === true) {
        const fullPath = req.originalUrl || req.url || "";
        const cleanPath = fullPath.split("?")[0];
        const method = req.method;

        let action = req.auditAction || `${method} ${cleanPath}`;
        let entityType = req.auditEntityType || "System";
        let entityId = req.auditEntityId || null;
        let clientId = req.clientId || req.query.client_id || (req.body && req.body.client_id) || null;

        // Auto-deduce clean and friendly action/entity labels if not explicitly supplied
        if (!req.auditAction || !req.auditEntityType) {
          const parts = cleanPath.split("/").filter(Boolean); // e.g. ["api", "admin", "clients", "3", "status"]
          
          if (parts.includes("admin")) {
            const adminIndex = parts.indexOf("admin");
            const resource = parts[adminIndex + 1]; // e.g. "clients", "tickets", "instances", "messages", "logs"

            if (resource) {
              // Convert resource name to singular entity label (e.g. "clients" -> "Client")
              entityType = resource.charAt(0).toUpperCase() + resource.slice(1).replace(/s$/, "");
              
              const idOrSubAction = parts[adminIndex + 2];
              if (idOrSubAction) {
                // Check if the next part is an ID (usually numeric or uuid or alphanumeric code)
                const isId = !isNaN(Number(idOrSubAction)) || idOrSubAction.length > 8;
                
                if (isId) {
                  entityId = idOrSubAction;
                  const maybeSubAction = parts[adminIndex + 3];
                  
                  if (maybeSubAction) {
                    action = `${method === "PATCH" || method === "PUT" ? "Update" : "Action"} ${entityType} ${maybeSubAction.toUpperCase()}`;
                  } else {
                    action = `${method === "DELETE" ? "Delete" : method === "PUT" ? "Update" : "Read"} ${entityType}`;
                  }
                } else {
                  // E.g. /api/admin/clients/trial -> action: "Create Trial Client"
                  action = `Create Trial ${entityType}`;
                }
              } else {
                if (method === "POST") {
                  action = `Create ${entityType}`;
                } else {
                  action = `List ${entityType}s`;
                }
              }
            }
          }
        }

        // Build sanitised audit metadata
        const metadata: any = {
          request: {
            method,
            url: fullPath,
            headers: {
              "user-agent": req.headers["user-agent"],
              "referer": req.headers["referer"],
              "x-client-id": req.headers["x-client-id"]
            },
            query: req.query
          },
          response: {
            statusCode: res.statusCode,
            ok: body && body.ok !== false
          }
        };

        // Redact any sensitive information from request body
        if (req.body && typeof req.body === "object") {
          const safeBody = { ...req.body };
          const sensitiveFields = ["password", "token", "secret", "key", "passwordConfirm", "access_token"];
          
          for (const key of sensitiveFields) {
            if (key in safeBody) {
              safeBody[key] = "[REDACTED]";
            }
          }
          metadata.request.body = safeBody;
        }

        // Include high-level response result metadata
        if (body && typeof body === "object") {
          metadata.response.data = {
            ok: body.ok,
            error: body.error || null,
            message: body.message || null
          };
        }

        const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const cleanIp = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(",")[0].trim();

        // Safe fire-and-forget async invocation
        logAdminAction({
          admin_email: req.user?.email || "unknown-admin@tratatudo.com",
          action,
          entity_type: entityType,
          entity_id: entityId ? String(entityId) : null,
          client_id: clientId ? Number(clientId) : null,
          metadata,
          ip: cleanIp
        }).catch((err) => {
          console.error("[ADMIN AUDIT INTERCEPTOR EXCEPTION] Failed to run logAdminAction async:", err.message || err);
        });
      }
    } catch (err: any) {
      console.error("[ADMIN AUDIT INTERCEPTOR CRITICAL ERROR] Res.json override execution fault:", err.message || err);
    }

    return originalJson.call(this, body);
  };

  next();
};
