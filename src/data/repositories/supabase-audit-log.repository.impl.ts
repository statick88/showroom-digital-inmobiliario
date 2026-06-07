/**
 * Supabase implementation of `IAuditLogRepository`.
 *
 * T-5.5 (PR-5). Provides paginated, filterable access to the
 * `audit_log` table which records all DML changes across the system.
 * Full old/new value diffs are stored for UPDATE operations.
 *
 * Security: NO raw SQL. All queries use the parameterized Supabase
 * client (`supabase.from(...).select(...).eq(...)`).
 */

import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type {
  IAuditLogRepository,
  AuditLogEntry,
  AuditLogFilters,
} from "@/domain/repositories/audit-log.repository";

function mapRowToAuditLogEntry(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: row.id as string,
    tabla: row.tabla as string,
    accion: row.accion as AuditLogEntry["accion"],
    actor: row.actor as string,
    actorRol: row.actor_rol as AuditLogEntry["actorRol"],
    registroId: row.registro_id as string,
    valoresAntiguos: row.valores_antiguos as AuditLogEntry["valoresAntiguos"],
    valoresNuevos: row.valores_nuevos as AuditLogEntry["valoresNuevos"],
    createdAt: row.created_at as string,
  };
}

export const auditLogRepository: IAuditLogRepository = {
  /**
   * List audit log entries with filtering and pagination.
   * Returns { rows, total } for pagination UI.
   */
  async listar(filtros?: AuditLogFilters): Promise<{ rows: AuditLogEntry[]; total: number }> {
    let query = supabase.from("audit_log").select("*", { count: "exact" });

    // Apply filters
    if (filtros?.tabla) {
      query = query.eq("tabla", filtros.tabla);
    }
    if (filtros?.accion) {
      query = query.eq("accion", filtros.accion);
    }
    if (filtros?.actor) {
      query = query.ilike("actor", `%${filtros.actor}%`);
    }
    if (filtros?.fechaDesde) {
      query = query.gte("created_at", filtros.fechaDesde);
    }
    if (filtros?.fechaHasta) {
      query = query.lte("created_at", filtros.fechaHasta);
    }

    // Default sort: newest first
    query = query.order("created_at", { ascending: false });

    // Pagination
    const page = filtros?.page ?? 0;
    const pageSize = filtros?.pageSize ?? 100;
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    rethrowIfPresent(error, "Error al listar auditoría");

    return {
      rows: (data ?? []).map(mapRowToAuditLogEntry),
      total: count ?? 0,
    };
  },
};
