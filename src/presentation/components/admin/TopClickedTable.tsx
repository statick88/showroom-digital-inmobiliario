import { useTopClicks } from "@/presentation/hooks/useTopClicks";
import { cn } from "@/lib/utils";
import { getPublicAssetPath } from "@/presentation/components/map/map-utils";

export function TopClickedTable() {
  const { data: topClicks, isLoading } = useTopClicks(5);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>;
  }

  if (!topClicks || topClicks.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">No hay datos de clics</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 text-xs text-muted-foreground font-medium">#</th>
            <th className="pb-2 text-xs text-muted-foreground font-medium">Imagen</th>
            <th className="pb-2 text-xs text-muted-foreground font-medium">Código</th>
            <th className="pb-2 text-xs text-muted-foreground font-medium">Propiedad</th>
            <th className="pb-2 text-xs text-muted-foreground font-medium text-right">Clics</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {topClicks.map((item, index) => (
            <tr key={item.propiedad.id} className="hover:bg-muted transition-colors">
              <td className="py-3 pr-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    index === 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
              </td>
              <td className="py-3 pr-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                  <img
                    src={getPublicAssetPath("placeholder.svg")}
                    alt={item.propiedad.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </td>
              <td className="py-3 pr-2 text-xs text-primary font-medium">
                {item.propiedad.codigo}
              </td>
              <td className="py-3 pr-2 text-sm text-foreground">{item.propiedad.titulo}</td>
              <td className="py-3 text-right font-bold text-primary">{item.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
