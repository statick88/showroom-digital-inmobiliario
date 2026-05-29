"use client";

import { useMetricas } from "@/presentation/hooks/useMetricas";
import {
  Building2Icon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MousePointerClickIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react";

interface CardDef {
  key: keyof MetricasData;
  label: string;
  icon: LucideIcon;
  color: string;
  suffix?: string;
}

type MetricasData = {
  totalPropiedades: number;
  disponibles: number;
  separadas: number;
  vendidas: number;
  totalClicks: number;
  totalLeads: number;
  avancePorcentaje: number;
};

const cards: CardDef[] = [
  { key: "totalPropiedades", label: "Total", icon: Building2Icon, color: "text-zinc-600" },
  { key: "disponibles", label: "Disponibles", icon: CheckCircleIcon, color: "text-emerald-600" },
  { key: "separadas", label: "Separadas", icon: ClockIcon, color: "text-amber-600" },
  { key: "vendidas", label: "Vendidas", icon: XCircleIcon, color: "text-red-600" },
  { key: "totalClicks", label: "Clics", icon: MousePointerClickIcon, color: "text-blue-600" },
  { key: "totalLeads", label: "Leads", icon: MessageCircleIcon, color: "text-violet-600" },
  { key: "avancePorcentaje", label: "Avance", icon: TrendingUpIcon, color: "text-emerald-600", suffix: "%" },
];

export function MetricasPanel() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.key} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ key, label, icon: Icon, color, suffix }) => {
        const display = key === "avancePorcentaje"
          ? `${data[key]}${suffix ?? ""}`
          : `${data[key]}`;

        return (
          <div
            key={key}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <Icon className={`size-8 shrink-0 ${color}`} />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{label}</p>
              <p className="text-lg font-bold tabular-nums">{display}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
