import type { EstadoLote } from "@/domain/entities/lote";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type FiltroEstado = "todos" | EstadoLote;

interface FiltrosLotesProps {
  selected: FiltroEstado;
  onChange: (filtro: FiltroEstado) => void;
  counts?: {
    total: number;
    disponibles: number;
    reservados: number;
    vendidos: number;
  };
}

const FILTROS: { id: FiltroEstado; label: string; icon: string }[] = [
  { id: "todos", label: "Todos", icon: "select_all" },
  { id: "disponible", label: "Disponibles", icon: "check_circle" },
  { id: "reservado", label: "Reservados", icon: "pending" },
  { id: "vendido", label: "Vendidos", icon: "block" },
];

export function FiltrosLotes({ selected, onChange, counts }: FiltrosLotesProps) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist">
      {FILTROS.map((filtro) => {
        const active = selected === filtro.id;
        const count =
          filtro.id === "todos"
            ? counts?.total
            : filtro.id === "disponible"
              ? counts?.disponibles
              : filtro.id === "reservado"
                ? counts?.reservados
                : counts?.vendidos;

        return (
          <button
            key={filtro.id}
            onClick={() => onChange(filtro.id)}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl transition-all typo-label-md font-bold",
              "min-h-[48px] min-w-[48px]",
              active
                ? "bg-accent text-primary shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon name={filtro.icon} size={20} filled={active} />
            <span>{filtro.label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  "ml-1 px-2 py-0.5 rounded-full text-xs",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
