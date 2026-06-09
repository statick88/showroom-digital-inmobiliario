"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useAuditLog, useRealtimeAuditLog } from "@/presentation/hooks/useAuditLog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { FileText, Filter, Loader2 } from "lucide-react";
import { ExportarAuditLogCSV } from "./ExportarAuditLogCSV";

const PAGE_SIZE = 100;

type Accion = "INSERT" | "UPDATE" | "DELETE";

export interface AuditLogFilters {
  tabla?: string;
  accion?: Accion;
  actor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogEntry {
  id: string;
  tabla: string;
  accion: Accion;
  actor: string;
  actorRol: "admin" | "vendedor" | "comprador";
  registroId: string;
  valoresAntiguos: Record<string, unknown> | null;
  valoresNuevos: Record<string, unknown> | null;
  createdAt: string;
}

function AccionBadge({ accion }: { accion: Accion }) {
  const config = {
    INSERT: { variant: "default" as const, icon: "add", label: "INSERT" },
    UPDATE: { variant: "secondary" as const, icon: "edit", label: "UPDATE" },
    DELETE: { variant: "destructive" as const, icon: "delete", label: "DELETE" },
  }[accion];

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon name={config.icon} size={12} />
      {config.label}
    </Badge>
  );
}

function formatFechaEsPE(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function JsonDiff({
  oldVal,
  newVal,
}: {
  oldVal: Record<string, unknown> | null;
  newVal: Record<string, unknown> | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Valores anteriores</p>
        <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto max-h-64">
          {oldVal ? JSON.stringify(oldVal, null, 2) : "—"}
        </pre>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Valores nuevos</p>
        <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto max-h-64">
          {newVal ? JSON.stringify(newVal, null, 2) : "—"}
        </pre>
      </div>
    </div>
  );
}

function FilterBar({
  filtros,
  onFiltrosChange,
  tablas,
  onFiltrar,
  isLoading,
}: {
  filtros: AuditLogFilters;
  onFiltrosChange: (f: AuditLogFilters) => void;
  tablas: string[];
  onFiltrar: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs text-muted-foreground font-medium">Tabla</label>
          <Select
            value={filtros.tabla ?? ""}
            onValueChange={(v) => onFiltrosChange({ ...filtros, tabla: v || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todas</SelectItem>
                {tablas.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs text-muted-foreground font-medium">Acción</label>
          <Select
            value={filtros.accion ?? ""}
            onValueChange={(v) => onFiltrosChange({ ...filtros, accion: v as Accion | undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[180px] flex-grow">
          <label className="text-xs text-muted-foreground font-medium">Actor</label>
          <Input
            placeholder="Email o nombre..."
            value={filtros.actor ?? ""}
            onChange={(e) => onFiltrosChange({ ...filtros, actor: e.target.value || undefined })}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs text-muted-foreground font-medium">Fecha desde</label>
          <Input
            type="date"
            value={filtros.fechaDesde ?? ""}
            onChange={(e) =>
              onFiltrosChange({ ...filtros, fechaDesde: e.target.value || undefined })
            }
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-xs text-muted-foreground font-medium">Fecha hasta</label>
          <Input
            type="date"
            value={filtros.fechaHasta ?? ""}
            onChange={(e) =>
              onFiltrosChange({ ...filtros, fechaHasta: e.target.value || undefined })
            }
            className="w-full"
          />
        </div>

        <Button onClick={onFiltrar} disabled={isLoading} className="h-9 gap-2">
          <Filter size={16} />
          Filtrar
          {isLoading && <Loader2 size={16} className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
}

function AuditLogTable({
  rows,
  expandedRowId,
  onToggleExpand,
}: {
  rows: AuditLogEntry[];
  expandedRowId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-xs text-muted-foreground font-medium w-8"></th>
            <th className="p-3 text-xs text-muted-foreground font-medium">ID</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Tabla</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Acción</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Actor</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Registro ID</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                Sin registros de auditoría
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    expandedRowId === row.id && "bg-muted",
                  )}
                  onClick={() => row.accion === "UPDATE" && onToggleExpand(row.id)}
                >
                  <td className="p-3 text-center">
                    {row.accion === "UPDATE" && (
                      <Icon
                        name={expandedRowId === row.id ? "expand_less" : "expand_more"}
                        size={20}
                        className="text-muted-foreground hover:text-foreground transition-transform duration-200"
                      />
                    )}
                  </td>
                  <td className="p-3 text-sm font-mono text-primary">{String(row.id ?? "").slice(0, 8)}…</td>
                  <td className="p-3 text-sm text-foreground">{row.tabla}</td>
                  <td className="p-3 text-center">
                    <AccionBadge accion={row.accion} />
                  </td>
                  <td className="p-3 text-sm text-foreground">{row.actor}</td>
                  <td className="p-3 text-sm font-mono text-muted-foreground">
                    {String(row.registroId ?? "").slice(0, 12)}…
                  </td>
                  <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatFechaEsPE(row.createdAt)}
                  </td>
                </tr>
                {expandedRowId === row.id && row.accion === "UPDATE" && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <JsonDiff oldVal={row.valoresAntiguos} newVal={row.valoresNuevos} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-xs text-muted-foreground font-medium w-8"></th>
            <th className="p-3 text-xs text-muted-foreground font-medium">ID</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Tabla</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Acción</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Actor</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Registro ID</th>
            <th className="p-3 text-xs text-muted-foreground font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="p-3"></td>
              <td className="p-3">
                <div className="h-4 w-20 bg-muted rounded" />
              </td>
              <td className="p-3">
                <div className="h-4 w-24 bg-muted rounded" />
              </td>
              <td className="p-3 text-center">
                <div className="h-5 w-20 bg-muted rounded mx-auto" />
              </td>
              <td className="p-3">
                <div className="h-4 w-32 bg-muted rounded" />
              </td>
              <td className="p-3">
                <div className="h-4 w-24 bg-muted rounded" />
              </td>
              <td className="p-3">
                <div className="h-4 w-36 bg-muted rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AuditLogPanel() {
  const [filtros, setFiltros] = useState<AuditLogFilters>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAuditLog(filtros);
  useRealtimeAuditLog();

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = (filtros.page ?? 0) + 1;

  const tablas = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r: AuditLogEntry) => set.add(r.tabla));
    return Array.from(set).sort();
  }, [rows]);

  const handleFiltrosChange = (newFiltros: AuditLogFilters) => {
    setFiltros({ ...newFiltros, page: 0 });
  };

  const handleFiltrar = () => {
    setFiltros((prev) => ({ ...prev, page: 0 }));
    refetch();
  };

  const handlePageChange = (page: number) => {
    setFiltros((prev) => ({ ...prev, page: page - 1 }));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <Icon name="error" size={48} className="mx-auto mb-4" />
        <p className="font-medium">Error al cargar la auditoría</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText size={28} className="text-primary" />
            Registro de Auditoría
          </h2>
          <p className="text-sm text-muted-foreground">Historial de cambios DML del sistema</p>
        </div>
        <ExportarAuditLogCSV filtros={filtros} rows={rows} />
      </header>

      <FilterBar
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        tablas={tablas}
        onFiltrar={handleFiltrar}
        isLoading={isLoading}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <AuditLogTable
            rows={rows}
            expandedRowId={expandedRowId}
            onToggleExpand={handleToggleExpand}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
