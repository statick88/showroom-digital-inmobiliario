/**
 * `IAuditLogRepository` — contract for the audit log domain.
 *
 * T-5.5 (PR-5). Consumed by `useAuditLog` (presentation) and implemented
 * by `supabase-audit-log.repository.impl.ts` (data).
 *
 * The audit_log table records all DML changes across the system with
 * full old/new value diffs for UPDATE operations.
 */

export interface AuditLogEntry {
  id: string;
  tabla: string;
  accion: "INSERT" | "UPDATE" | "DELETE";
  actor: string;
  actorRol: "admin" | "vendedor" | "comprador";
  registroId: string;
  valoresAntiguos: Record<string, unknown> | null;
  valoresNuevos: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilters {
  tabla?: string;
  accion?: "INSERT" | "UPDATE" | "DELETE";
  actor?: string;
  fechaDesde?: string; // ISO 8601
  fechaHasta?: string; // ISO 8601
  page?: number;
  pageSize?: number;
}

export interface IAuditLogRepository {
  /**
   * List audit log entries with filtering and pagination.
   * Returns { rows, total } for pagination UI.
   */
  listar(filtros?: AuditLogFilters): Promise<{ rows: AuditLogEntry[]; total: number }>;
}
