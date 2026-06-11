import { useState, useMemo } from "react";
import { useLotes } from "@/presentation/hooks/useLotes";
import { useTransacciones } from "@/presentation/hooks/useTransacciones";
import { useAllPagos } from "@/presentation/hooks/useAllPagos";
import { useAllComisiones } from "@/presentation/hooks/useAllComisiones";
import { useExport, type ExportColumn } from "@/presentation/hooks/useExport";
import { useProjectContext } from "@/presentation/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

type ReportType = "inventario" | "ventas" | "comisiones" | "pagos";

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "inventario", label: "Inventario de Lotes" },
  { value: "ventas", label: "Resumen de Ventas" },
  { value: "comisiones", label: "Comisiones" },
  { value: "pagos", label: "Historial de Pagos" },
];

const FORMAT_OPTIONS: { value: "csv" | "excel"; label: string; icon: React.ReactNode }[] = [
  { value: "csv", label: "CSV", icon: <FileText size={14} /> },
  { value: "excel", label: "Excel", icon: <FileSpreadsheet size={14} /> },
];

// ── Inventario columns ─────────────────────────────────────────
const INVENTARIO_COLS: ExportColumn<Record<string, unknown>>[] = [
  { key: "codigo", header: "Código" },
  { key: "areaTotal", header: "Área (m²)" },
  { key: "frente", header: "Frente (m)" },
  { key: "fondo", header: "Fondo (m)" },
  { key: "precio", header: "Precio" },
  { key: "moneda", header: "Moneda" },
  { key: "estado", header: "Estado" },
];

// ── Ventas columns ─────────────────────────────────────────────
const VENTAS_COLS: ExportColumn<Record<string, unknown>>[] = [
  {
    key: "createdAt",
    header: "Fecha",
    format: (v) => new Date(v as string).toLocaleDateString("es-PE"),
  },
  { key: "tipo", header: "Tipo" },
  { key: "compradorNombre", header: "Comprador" },
  { key: "compradorDocumento", header: "Documento" },
  { key: "monto", header: "Monto" },
  { key: "moneda", header: "Moneda" },
];

// ── Comisiones columns ────────────────────────────────────────
const COMISIONES_COLS: ExportColumn<Record<string, unknown>>[] = [
  {
    key: "createdAt",
    header: "Fecha",
    format: (v) => new Date(v as string).toLocaleDateString("es-PE"),
  },
  { key: "vendedorId", header: "Vendedor ID" },
  { key: "propertyId", header: "Lote ID" },
  { key: "salePrice", header: "Precio Venta" },
  { key: "commissionAmount", header: "Comisión" },
  { key: "ruleApplied", header: "Regla Aplicada" },
  { key: "status", header: "Estado" },
];

// ── Pagos columns ─────────────────────────────────────────────
const PAGOS_COLS: ExportColumn<Record<string, unknown>>[] = [
  {
    key: "fechaPago",
    header: "Fecha Pago",
    format: (v) => new Date(v as string).toLocaleDateString("es-PE"),
  },
  { key: "transaccionId", header: "Transacción ID" },
  { key: "monto", header: "Monto" },
  { key: "metodoPago", header: "Método" },
  { key: "cci", header: "CCI" },
  { key: "referenciaExterna", header: "Referencia" },
  { key: "notas", header: "Notas" },
];

export function ReportesTab() {
  const [reportType, setReportType] = useState<ReportType>("inventario");
  const { selectedProjectId } = useProjectContext();
  const { exportData, isExporting } = useExport();
  const { data: lotes } = useLotes(selectedProjectId ?? undefined);
  const { data: transacciones } = useTransacciones();
  const { data: allPagos } = useAllPagos();
  const { data: allComisiones } = useAllComisiones();

  const reportData = useMemo(() => {
    switch (reportType) {
      case "inventario":
        return (lotes ?? []).map((l) => ({
          codigo: l.codigo,
          areaTotal: l.areaTotal,
          frente: l.frente ?? "",
          fondo: l.fondo ?? "",
          precio: l.precio,
          moneda: l.moneda,
          estado: l.estado,
        }));
      case "ventas":
        return (transacciones ?? []).map((t) => ({
          createdAt: t.createdAt,
          tipo: t.tipo,
          compradorNombre: t.compradorNombre,
          compradorDocumento: t.compradorDocumento ?? "",
          monto: t.monto,
          moneda: t.moneda,
        }));
      case "comisiones":
        return (allComisiones ?? []).map((c) => ({
          createdAt: c.createdAt,
          vendedorId: c.vendedorId,
          propertyId: c.propertyId,
          salePrice: c.salePrice,
          commissionAmount: c.commissionAmount,
          ruleApplied: c.ruleApplied ?? "",
          status: c.status,
        }));
      case "pagos":
        return (allPagos ?? []).map((p) => ({
          fechaPago: p.fechaPago,
          transaccionId: p.transaccionId,
          monto: p.monto,
          metodoPago: p.metodoPago,
          cci: p.cci ?? "",
          referenciaExterna: p.referenciaExterna ?? "",
          notas: p.notas ?? "",
        }));
      default:
        return [];
    }
  }, [reportType, lotes, transacciones, allPagos, allComisiones]);

  const columns = useMemo(() => {
    switch (reportType) {
      case "inventario":
        return INVENTARIO_COLS;
      case "ventas":
        return VENTAS_COLS;
      case "comisiones":
        return COMISIONES_COLS;
      case "pagos":
        return PAGOS_COLS;
      default:
        return [];
    }
  }, [reportType]);

  const handleExport = (format: "csv" | "excel") => {
    const filenames: Record<ReportType, string> = {
      inventario: "inventario_lotes",
      ventas: "resumen_ventas",
      comisiones: "comisiones",
      pagos: "historial_pagos",
    };
    exportData(reportData, columns, filenames[reportType], format);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground">Reportes</h2>
        <p className="text-sm text-muted-foreground">Genera y exporta reportes del sistema</p>
      </header>

      {/* Report Selector + Export Buttons */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm"
            >
              {REPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-5">
            {FORMAT_OPTIONS.map((fmt) => (
              <Button
                key={fmt.value}
                variant="outline"
                size="sm"
                onClick={() => handleExport(fmt.value)}
                disabled={isExporting || reportData.length === 0}
              >
                {fmt.icon}
                <span className="ml-1">{fmt.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-semibold">
            {REPORT_OPTIONS.find((o) => o.value === reportType)?.label}
          </h3>
          <span className="text-xs text-muted-foreground">{reportData.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          {columns.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={String(col.key)} className="p-4 text-xs text-muted-foreground font-medium">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportData.length > 0 ? (
                  reportData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-muted transition-colors">
                      {columns.map((col) => (
                        <td key={String(col.key)} className="p-4 text-sm">
                          {col.format
                            ? col.format(row[col.key as keyof typeof row], row)
                            : String(row[col.key as keyof typeof row] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="p-8 text-center text-sm text-muted-foreground">
                      No hay datos para este reporte
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Reporte no disponible aún
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
