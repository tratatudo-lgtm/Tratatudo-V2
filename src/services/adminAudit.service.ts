import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://lghsbjgjrogkadczikou.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaHNiamdqcm9na2FkY3ppa291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODY2NDIsImV4cCI6MjA4Nzg2MjY0Mn0.FfxryvS33JUfIf5HOqJyhBRANKzdH0Snuu3p-RDOs_k";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Create independent service-role-based client to prevent dependency cycles
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export interface AdminAuditLog {
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  client_id?: number | null;
  metadata?: any;
  ip?: string;
}

/**
 * Service to record administrative audits in the database.
 * Falls back safely to structured console logging if the table is not available
 * or if there are connection issues, ensuring zero message loss.
 */
export async function logAdminAction(params: AdminAuditLog): Promise<boolean> {
  const logData = {
    admin_email: params.admin_email,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id || null,
    client_id: params.client_id ? Number(params.client_id) : null,
    metadata: params.metadata || {},
    ip: params.ip || "unknown",
    created_at: new Date().toISOString()
  };

  // 1. Structured Console Audit (crucial for container observability)
  console.log(`[ADMIN AUDIT LOG][${logData.created_at}] Admin: ${logData.admin_email} | Action: ${logData.action} | Entity: ${logData.entity_type} (${logData.entity_id || "None"}) | Client: ${logData.client_id || "Global"} | IP: ${logData.ip}`);
  if (Object.keys(logData.metadata).length > 0) {
    console.log(`[ADMIN AUDIT METADATA]`, JSON.stringify(logData.metadata));
  }

  // 2. Supabase Insert
  try {
    const { error } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert([logData]);

    if (error) {
      console.warn(`[ADMIN AUDIT ERROR] Failed to save log inside Supabase. Table 'admin_audit_logs' might not exist or lacks permission:`, error.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`[ADMIN AUDIT EXCEPTION] Fail during audit insertion:`, error.message || error);
    return false;
  }
}
