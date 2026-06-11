import { Icon } from "@/components/ui/icon";
import { useMetricas } from "@/presentation/hooks/useMetricas";

export function MetricasPanel() {
  const { data, isLoading } = useMetricas();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      key: "totalLotes",
      label: "Total Lotes",
      value: data.totalLotes,
      icon: "layers",
      color: "text-primary",
    },
    {
      key: "disponibles",
      label: "Disponibles",
      value: data.disponibles,
      icon: "check_circle",
      color: "text-status-success",
    },
    {
      key: "reservados",
      label: "Reservados",
      value: data.reservados,
      icon: "pending",
      color: "text-status-warning",
    },
    {
      key: "vendidos",
      label: "Vendidos",
      value: data.vendidos,
      icon: "block",
      color: "text-status-destructive",
    },
    {
      key: "transacciones",
      label: "Transacciones",
      value: data.totalTransacciones,
      icon: "receipt_long",
      color: "text-primary",
    },
    {
      key: "avance",
      label: "Avance",
      value: `${data.avancePorcentaje}%`,
      icon: "trending_up",
      color: "text-tertiary",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(({ key, label, value, icon, color }) => (
        <div
          key={key}
          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
        >
          <Icon name={icon} size={32} className={`shrink-0 ${color}`} />
          <div className="min-w-0">
            <p className="typo-label-md text-muted-foreground truncate">{label}</p>
            <p className="typo-headline-md font-bold text-foreground">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
