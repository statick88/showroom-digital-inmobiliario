"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalyticsAggregates } from "@/presentation/hooks/useAnalyticsAggregates";
import type { DateRange } from "@/presentation/hooks/useAnalyticsAggregates";

const PIE_COLORS = ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function TourAnalyticsDashboard() {
  const [tourId, setTourId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));

  const dateRange: DateRange | undefined = tourId
    ? { start: new Date(startDate), end: new Date(endDate) }
    : undefined;

  const { summary, topParcels, eventTypeBreakdown, isLoading, isError, error } =
    useAnalyticsAggregates(tourId, dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics del Tour</h2>
        <p className="text-sm text-muted-foreground">
          Métricas de interacción y engagement de visitantes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">Tour ID</label>
          <input
            className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="UUID del tour"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">Desde</label>
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-input bg-card text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">Hasta</label>
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-input bg-card text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="text-center py-8 text-sm text-muted-foreground">Cargando datos...</div>
      )}
      {isError && (
        <div className="text-center py-8 text-sm text-destructive">
          Error: {error?.message ?? "No se pudieron cargar los datos"}
        </div>
      )}

      {/* Summary cards */}
      {!isLoading && !isError && tourId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SummaryCard label="Total Visitantes" value={summary.total_visitors} />
            <SummaryCard label="Total Eventos" value={summary.total_events} />
            <SummaryCard label="Lotes Interactuados" value={summary.parcel_aggregates.length} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bar Chart — top parcels by clicks */}
            <div className="bg-card border border-border rounded-xl shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Lotes Más Clickeados
              </h3>
              {topParcels.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topParcels}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="parcel_code" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="total_clicks" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin datos de interacción
                </p>
              )}
            </div>

            {/* Pie Chart — events by type */}
            <div className="bg-card border border-border rounded-xl shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Eventos por Tipo
              </h3>
              {eventTypeBreakdown.some((e) => e.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeBreakdown.filter((e) => e.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="type"
                    >
                      {eventTypeBreakdown
                        .filter((e) => e.count > 0)
                        .map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin eventos registrados
                </p>
              )}
            </div>
          </div>

          {/* Data Table — sortable parcel rows */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Detalle por Lote
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">WhatsApp</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topParcels.length > 0 ? (
                  topParcels.map((p) => (
                    <TableRow key={p.parcel_id}>
                      <TableCell className="font-medium text-primary">
                        {p.parcel_code}
                      </TableCell>
                      <TableCell className="text-right">{p.total_clicks}</TableCell>
                      <TableCell className="text-right">{p.whatsapp_clicks}</TableCell>
                      <TableCell className="text-right">{p.share_clicks}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Sin datos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Empty state when no tour selected */}
      {!tourId && (
        <div className="text-center py-12 text-muted-foreground">
          Seleccioná un tour para ver las métricas de analytics
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-[0px_4px_20px_rgba(160,152,144,0.08)]">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-primary">{value.toLocaleString("es-PE")}</p>
    </div>
  );
}
