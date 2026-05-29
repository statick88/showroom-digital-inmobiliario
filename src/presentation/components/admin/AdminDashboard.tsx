"use client";

import { useState } from "react";
import { LayoutDashboard, Building2, MessageCircle, Plus, Search } from "lucide-react";
import { usePropiedades } from "@/presentation/hooks/usePropiedades";
import { useLeads } from "@/presentation/hooks/useLeads";
import { useMetricas } from "@/presentation/hooks/useMetricas";
import type { Propiedad } from "@/domain/entities/propiedad";

type Tab = "dashboard" | "propiedades" | "leads";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      {/* SideNavBar */}
      <aside className="w-64 h-full bg-surface-container-low border-r border-outline-variant flex flex-col gap-6 p-6">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">Admin Panel</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Gestión Inmobiliaria</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavButton tab="dashboard" current={tab} icon={LayoutDashboard}>
            Dashboard
          </NavButton>
          <NavButton tab="propiedades" current={tab} icon={Building2}>
            Propiedades
          </NavButton>
          <NavButton tab="leads" current={tab} icon={MessageCircle}>
            Leads
          </NavButton>
        </nav>

        <div className="mt-auto flex items-center gap-3 p-2 border-t border-outline-variant pt-4">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
            A
          </div>
          <div className="overflow-hidden">
            <p className="font-label-md text-on-surface truncate">Admin User</p>
            <p className="text-[10px] text-on-surface-variant uppercase">Super Admin</p>
          </div>
        </div>
      </aside>

      <main className="flex-grow p-16 bg-background min-h-screen">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "propiedades" && <PropiedadesTab />}
        {tab === "leads" && <LeadsTab />}
      </main>
    </div>
  );
}

function NavButton({
  tab,
  current,
  icon: Icon,
  children,
}: {
  tab: Tab;
  current: Tab;
  icon: typeof LayoutDashboard;
  children: React.ReactNode;
}) {
  const active = tab === current;
  return (
    <button
      onClick={() => {}}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active
          ? "bg-surface-container-highest text-primary font-bold translate-x-1"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <Icon className="size-5" />
      <span className="font-label-md">{children}</span>
    </button>
  );
}

function DashboardTab() {
  const { data, isLoading } = useMetricas();

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Resumen operativo</p>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard label="Total Propiedades" value={data?.totalPropiedades ?? 0} trend="+4 este mes" />
        <MetricCard label="Disponibles" value={data?.disponibles ?? 0} barPercent={66} />
        <MetricCard label="Separados" value={data?.separadas ?? 0} subtitle="Pendiente firma" />
        <MetricCard label="Vendidos" value={data?.vendidas ?? 0} subtitle="Acumulado anual" />
        <MetricCard label="Total Leads" value={data?.totalLeads ?? 0} trend="12% conversión" />
        <MetricCard label="% Avance" value={data?.avancePorcentaje ?? 0} suffix="%" subtitle="Meta: S/ 4.5M" />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 flex items-center gap-6">
          <DonutChart disponibles={60} separadas={15} vendidas={25} total={124} />
          <Legend />
        </div>

        {/* Top Clicks Ranking */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-on-surface">Top más clickeadas</h3>
            <button className="text-primary font-label-md hover:underline">Ver todo</button>
          </div>
          <TopClicksTable />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
  barPercent,
  suffix,
  subtitle,
}: {
  label: string;
  value: number;
  trend?: string;
  barPercent?: number;
  suffix?: string;
  subtitle?: string;
}) {
  const display = suffix ? `${value}${suffix}` : value.toString();

  return (
    <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-card">
      <p className="font-label-md text-on-surface-variant mb-1">{label}</p>
      <p className="text-headline-md font-bold text-primary">{display}</p>
      {trend && (
        <p className="text-label-md text-tertiary flex items-center gap-1 mt-1">
          <TrendingUp className="size-4" />
          {trend}
        </p>
      )}
      {subtitle && <p className="text-label-md text-on-surface-variant mt-1">{subtitle}</p>}
      {barPercent && (
        <div className="w-full bg-surface-container-high h-1 rounded-full mt-3">
          <div className="bg-tertiary h-1 rounded-full" style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </div>
  );
}

function DonutChart({ disponibles, separadas, vendidas, total }: { disponibles: number; separadas: number; vendidas: number; total: number }) {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: disponibles, color: "stroke-primary" },
    { value: separadas, color: "stroke-secondary" },
    { value: vendidas, color: "stroke-tertiary" },
  ];

  let offset = 0;
  return (
    <svg className="w-30 h-30 transform -rotate-90" viewBox="0 0 120 120">
      {segments.map((seg, i) => {
        const dasharray = `${(seg.value / 100) * circumference} ${circumference}`;
        const dashoffset = -offset;
        offset += (seg.value / 100) * circumference;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            className={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
          />
        );
      })}
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" className="text-headline-md font-bold fill-on-surface">
        {total}
      </text>
    </svg>
  );
}

function Legend() {
  return (
    <div className="flex-grow space-y-3">
      <h3 className="font-headline-md text-on-surface">Estado de Inventario</h3>
      {[
        { color: "bg-primary", label: "Disponible", value: "60%" },
        { color: "bg-secondary", label: "Separado", value: "15%" },
        { color: "bg-tertiary", label: "Vendido", value: "25%" },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="font-label-md text-on-surface-variant">{item.label}</span>
          </div>
          <span className="font-bold text-on-surface">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function TopClicksTable() {
  // Mock data - replace with real data from hook
  const topClicks = [
    { rank: 1, codigo: "MIR-204", titulo: "Penthouse Miraflores", clicks: 1245 },
    { rank: 2, codigo: "BAR-105", titulo: "Loft Barranco", clicks: 892 },
    { rank: 3, codigo: "SUR-402", titulo: "Casa Surco", clicks: 754 },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-outline-variant text-left">
          <th className="pb-2 font-label-md text-on-surface-variant">Rank</th>
          <th className="pb-2 font-label-md text-on-surface-variant">Código</th>
          <th className="pb-2 font-label-md text-on-surface-variant">Propiedad</th>
          <th className="pb-2 font-label-md text-on-surface-variant text-right">Clics</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        {topClicks.map((item) => (
          <tr key={item.codigo} className="hover:bg-surface-container-low transition-colors">
            <td className="py-3">
              <span className="w-6 h-6 rounded-full bg-primary-fixed-dim text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs">
                {item.rank}
              </span>
            </td>
            <td className="py-3 font-label-md text-primary">{item.codigo}</td>
            <td className="py-3 font-body-md text-on-surface">{item.titulo}</td>
            <td className="py-3 text-right font-bold text-primary">{item.clicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PropiedadesTab() {
  const { data, isLoading } = usePropiedades({});

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestión de Propiedades</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Administra el inventario</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus className="size-4" />
          Nueva Propiedad
        </button>
      </header>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border-outline-variant focus:border-primary outline-none bg-surface font-body-md"
              placeholder="Buscar..."
            />
          </div>
          <select className="bg-surface border-outline-variant rounded-lg px-4 py-2 font-label-md">
            <option>Todos los estados</option>
            <option>Disponible</option>
            <option>Separado</option>
            <option>Vendido</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="p-4 font-label-md text-on-surface-variant">Código</th>
                <th className="p-4 font-label-md text-on-surface-variant">Título</th>
                <th className="p-4 font-label-md text-on-surface-variant">Tipo</th>
                <th className="p-4 font-label-md text-on-surface-variant">Precio</th>
                <th className="p-4 font-label-md text-on-surface-variant">Estado</th>
                <th className="p-4 font-label-md text-on-surface-variant">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-label-md text-primary">{p.codigo}</td>
                    <td className="p-4 font-body-md text-on-surface">{p.titulo}</td>
                    <td className="p-4 font-label-md text-on-surface-variant capitalize">{p.tipo}</td>
                    <td className="p-4 font-currency-md text-currency-md">S/ {p.precio.toLocaleString("es-PE")}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        p.estado === "disponible" ? "bg-tertiary/10 text-tertiary" :
                        p.estado === "separado" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    No hay propiedades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadsTab() {
  const { data, isLoading } = useLeads();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Leads</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Gestiona contactos</p>
      </header>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="p-4 font-label-md text-on-surface-variant">Nombre</th>
                <th className="p-4 font-label-md text-on-surface-variant">Email</th>
                <th className="p-4 font-label-md text-on-surface-variant">Teléfono</th>
                <th className="p-4 font-label-md text-on-surface-variant">Propiedad</th>
                <th className="p-4 font-label-md text-on-surface-variant">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-body-md text-on-surface">{l.nombre}</td>
                    <td className="p-4 font-label-md text-on-surface-variant">{l.email}</td>
                    <td className="p-4 font-label-md text-on-surface-variant">{l.telefono ?? "—"}</td>
                    <td className="p-4 font-label-md text-on-surface-variant truncate max-w-xs">
                      {[l.propiedadCodigo, l.propiedadTitulo].filter(Boolean).join(": ")}
                    </td>
                    <td className="p-4 font-label-md text-on-surface-variant">
                      {new Date(l.createdAt).toLocaleDateString("es-PE")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    No hay leads
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}