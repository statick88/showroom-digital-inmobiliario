import type { Propiedad } from "@/domain/entities/propiedad";
import { Ruler, Bed, Bath } from "lucide-react";

interface SpecsGridProps {
  propiedad: Propiedad | null;
}

export function SpecsGrid({ propiedad }: SpecsGridProps) {
  if (!propiedad) return null;

  const specs = [
    {
      icon: Ruler,
      value: propiedad.areaM2 ?? "-",
      label: "m²",
    },
    {
      icon: Bed,
      value: propiedad.cuartos ?? "-",
      label: "dormitorios",
    },
    {
      icon: Bath,
      value: propiedad.banios ?? "-",
      label: "baños",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {specs.map((spec) => {
        const Icon = spec.icon;
        return (
          <div
            key={spec.label}
            className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3"
          >
            <Icon className="size-5 text-muted-foreground" />
            <span className="text-lg font-bold text-foreground">{spec.value}</span>
            <span className="text-xs text-muted-foreground">{spec.label}</span>
          </div>
        );
      })}
    </div>
  );
}
