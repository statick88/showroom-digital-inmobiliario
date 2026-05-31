import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { EstadoPropiedad } from "@/domain/entities/propiedad";

const statusConfig: Record<
  EstadoPropiedad,
  { variant: "success" | "warning" | "destructive"; label: string }
> = {
  disponible: { variant: "success", label: "Disponible" },
  separado: { variant: "warning", label: "Separado" },
  vendido: { variant: "destructive", label: "Vendido" },
};

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        success: "bg-status-success/10 text-status-success dark:bg-status-success/15",
        warning: "bg-status-warning/10 text-status-warning dark:bg-status-warning/15",
        destructive:
          "bg-status-destructive/10 text-status-destructive dark:bg-status-destructive/15",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type StatusChipProps = VariantProps<typeof chipVariants> & {
  status: EstadoPropiedad;
  className?: string;
  showDot?: boolean;
};

function getStatusConfig(status: EstadoPropiedad) {
  switch (status) {
    case "disponible":
      return statusConfig.disponible;
    case "separado":
      return statusConfig.separado;
    case "vendido":
      return statusConfig.vendido;
  }
}

function StatusChip({ status, size, className, showDot = true }: StatusChipProps) {
  const config = getStatusConfig(status);
  return (
    <span className={cn(chipVariants({ variant: config.variant, size, className }))}>
      {showDot && (
        <span
          className={cn("shrink-0 rounded-full bg-current", size === "sm" ? "size-1.5" : "size-2")}
        />
      )}
      {config.label}
    </span>
  );
}

export { StatusChip, statusConfig, chipVariants };
