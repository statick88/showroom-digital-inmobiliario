"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { auditLogRepository } from "@/data/repositories/supabase-audit-log.repository.impl";
import type { AuditLogFilters } from "@/domain/repositories/audit-log.repository";

/**
 * TanStack Query hook for fetching audit log entries with filtering and pagination.
 *
 * T-5.5 (PR-5). Thin wrapper around `supabaseAuditLogRepository.listar()`.
 * - `queryKey` includes filters so different filter combinations are cached separately
 * - Returns { rows, total } for pagination UI
 */
export function useAuditLog(filtros?: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-log", filtros],
    queryFn: () => auditLogRepository.listar(filtros),
  });
}

/**
 * Realtime hook that invalidates the audit-log query cache when new
 * INSERT events arrive on the `audit_log` table.
 *
 * T-5.5 (PR-5). Subscribes to Supabase `postgres_changes` on INSERT.
 * On each new row, invalidates all queries with prefix `["audit-log"]`
 * so list views refetch automatically.
 */
export function useRealtimeAuditLog() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("audit_log")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_log",
        },
        () => {
          qc.invalidateQueries({ queryKey: ["audit-log"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
