"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as Papa from "papaparse";
import type { AuditLogEntry, AuditLogFilters } from "./AuditLogPanel";

interface ExportarAuditLogCSVProps {
  filtros: AuditLogFilters;
  rows: AuditLogEntry[];
}

function formatFechaCorta(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatFechaNombreArchivo() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  return `audit-log-${yyyy}-${mm}-${dd}.csv`;
}

export function ExportarAuditLogCSV({ filtros, rows }: ExportarAuditLogCSVProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = React.useCallback(() => {
    if (rows.length === 0) return;

    setIsExporting(true);

    const csvRows = rows.map((row) => ({
      ID: row.id,
      Tabla: row.tabla,
      Acción: row.accion,
      Actor: row.actor,
      "Rol Actor": row.actorRol,
      "Registro ID": row.registroId,
      "Valores Anteriores": row.valoresAntiguos ? JSON.stringify(row.valoresAntiguos) : "",
      "Valores Nuevos": row.valoresNuevos ? JSON.stringify(row.valoresNuevos) : "",
      "Fecha Creación": formatFechaCorta(row.createdAt),
    }));

    const csv = Papa.unparse(csvRows, {
      header: true,
      delimiter: ";",
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = formatFechaNombreArchivo();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="gap-2 h-9">
      <Download size={16} />
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
