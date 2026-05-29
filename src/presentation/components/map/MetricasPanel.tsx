"use client";

import { TrendingUp, MousePointerClick, MessageCircle } from "lucide-react";
import { useMetricas } from "@/presentation/hooks/useMetricas";

export function MetricasPanel() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    { key: "totalPropiedades", label: "Total", value: data.totalPropiedades, icon: TrendingUp, color: "text-primary" },
    { key: "disponibles", label: "Disponibles", value: data.disponibles, icon: TrendingUp, color: "text-tertiary" },
    { key: "separadas", label: "Separadas", value: data.separadas, icon: TrendingUp, color: "text-secondary" },
    { key: "vendidas", label: "Vendidas", value: data.vendidas, icon: TrendingUp, color: "text-on-surface-variant" },
    { key: "totalClicks", label: "Clics", value: data.totalClicks, icon: MousePointerClick, color: "text-blue-600" },
    { key: "totalLeads", label: "Leads", value: data.totalLeads, icon: MessageCircle, color: "text-violet-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(({ key, label, value, icon: Icon, color }) => (
        <div
          key={key}
          className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        >
          <Icon className={`size-8 shrink-0 ${color}`} />
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{label}</p>
            <p className="text-lg font-bold tabular-nums">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}