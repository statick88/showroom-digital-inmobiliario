"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  actual: number;
  meta: number;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProgressBar({ actual, meta, className }: ProgressBarProps) {
  const pct = meta > 0 ? Math.min((actual / meta) * 100, 100) : 0;
  const gradientId = "progress-gradient";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Cumplimiento de Ventas</span>
        <span className="text-sm font-bold text-primary">
          {formatCurrency(actual)} / {formatCurrency(meta)}
        </span>
      </div>
      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-teal-500, #14b8a6)" />
              <stop offset="60%" stopColor="var(--color-emerald-500, #10b981)" />
              <stop offset="100%" stopColor="var(--status-warning, #eab308)" />
            </linearGradient>
          </defs>
          <rect
            data-testid="progress-fill"
            x="0"
            y="0"
            width={`${pct}%`}
            height="100"
            fill={`url(#${gradientId})`}
            rx="6"
          />
        </svg>
      </div>
    </div>
  );
}
