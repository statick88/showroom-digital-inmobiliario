import { useState } from "react";
import { MetricasPanel } from "@/presentation/components/map/MetricasPanel";
import { usePropiedades } from "@/presentation/hooks/usePropiedades";
import { useLeads } from "@/presentation/hooks/useLeads";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboardIcon, Building2Icon, MessageCircleIcon } from "lucide-react";

type Tab = "dashboard" | "propiedades" | "leads";

const TABS: { key: Tab; label: string; icon: typeof LayoutDashboardIcon }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { key: "propiedades", label: "Propiedades", icon: Building2Icon },
  { key: "leads", label: "Leads", icon: MessageCircleIcon },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex min-h-[80vh] gap-6">
      <nav className="w-48 shrink-0 space-y-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === key
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "propiedades" && <PropiedadesTab />}
        {tab === "leads" && <LeadsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <MetricasPanel />
    </div>
  );
}

function PropiedadesTab() {
  const { data, isLoading } = usePropiedades({});

  if (isLoading) return <p className="text-sm text-zinc-500">Cargando...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Propiedades</h1>
      {!data || data.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay propiedades.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left">
                <th className="pb-2 font-medium">Código</th>
                <th className="pb-2 font-medium">Título</th>
                <th className="pb-2 font-medium">Tipo</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Precio</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-zinc-500">{p.codigo}</td>
                  <td className="py-2 font-medium">{p.titulo}</td>
                  <td className="py-2 capitalize">{p.tipo}</td>
                  <td className="py-2">
                    <Badge
                      className={
                        p.estado === "disponible"
                          ? "bg-emerald-500"
                          : p.estado === "separado"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }
                    >
                      {p.estado}
                    </Badge>
                  </td>
                  <td className="py-2 tabular-nums">S/ {p.precio.toLocaleString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const { data, isLoading } = useLeads();

  if (isLoading) return <p className="text-sm text-zinc-500">Cargando...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leads</h1>
      {!data || data.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay leads aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Teléfono</th>
                <th className="pb-2 font-medium">Propiedad</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 font-medium">{l.nombre}</td>
                  <td className="py-2 text-zinc-500">{l.email}</td>
                  <td className="py-2 text-zinc-500">{l.telefono ?? "—"}</td>
                  <td className="py-2 text-zinc-500">
                    {l.propiedadTitulo
                      ? `${l.propiedadCodigo ?? ""} — ${l.propiedadTitulo}`
                      : l.propiedadId}
                  </td>
                  <td className="py-2 text-zinc-500">
                    {new Date(l.createdAt).toLocaleDateString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
