"use client";

import { useState } from "react";
import { usePropiedades } from "@/presentation/hooks/usePropiedades.legacy";
import { useLeads } from "@/presentation/hooks/useLeads.legacy";
import { useMetricas } from "@/presentation/hooks/useMetricas";
import { useTopClicks } from "@/presentation/hooks/useTopClicks";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icon";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "propiedades" | "leads";

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 h-full bg-card border-r border-border flex flex-col gap-6 p-6">
        <div>
          <h1 className="typo-headline-md text-primary">Admin Panel</h1>
          <p className="typo-label-md text-muted-foreground">Gestión Inmobiliaria</p>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavButton tab="dashboard" current={tab} icon="dashboard" onClick={setTab}>
            Dashboard
          </NavButton>
          <NavButton tab="propiedades" current={tab} icon="domain" onClick={setTab}>
            Propiedades
          </NavButton>
          <NavButton tab="leads" current={tab} icon="chat_bubble" onClick={setTab}>
            Leads
          </NavButton>
        </nav>

        <div className="mt-auto flex items-center gap-3 p-2 border-t border-border pt-4">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
            A
          </div>
          <div className="overflow-hidden">
            <p className="typo-label-md text-foreground truncate">Admin User</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Super Admin
            </p>
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
  icon,
  onClick,
  children,
}: {
  tab: Tab;
  current: Tab;
  icon: string;
  onClick: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const active = tab === current;
  return (
    <button
      onClick={() => onClick(tab)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
        active
          ? "bg-accent text-primary font-bold translate-x-1"
          : "text-muted-foreground hover:bg-muted rounded-lg",
      )}
    >
      <Icon name={icon} size={20} filled={active} />
      <span className="typo-label-md">{children}</span>
    </button>
  );
}

function DashboardTab() {
  const { data } = useMetricas();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="typo-headline-lg text-foreground">Dashboard</h2>
          <p className="typo-body-md text-muted-foreground">Resumen operativo de hoy</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-muted text-foreground rounded-lg typo-label-md flex items-center gap-2 border border-border">
            <Icon name="calendar_today" size={18} />
            Últimos 30 días
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Total Lotes"
          value={data?.totalLotes ?? 0}
          trend="+4 este mes"
        />
        <MetricCard label="Disponibles" value={data?.disponibles ?? 0} barPercent={66} />
        <MetricCard label="Reservados" value={data?.reservados ?? 0} subtitle="Pendiente firma" />
        <MetricCard label="Vendidos" value={data?.vendidos ?? 0} subtitle="Acumulado anual" />
        <MetricCard label="Transacciones" value={data?.totalTransacciones ?? 0} trend="12% conversión" />
        <MetricCard
          label="% Avance"
          value={data?.avancePorcentaje ?? 0}
          suffix="%"
          subtitle="Meta: S/ 4.5M"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl shadow-card flex flex-col md:flex-row gap-6 p-6 items-center">
          <DonutChart disponibles={60} separadas={15} vendidas={25} total={124} />
          <Legend />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="typo-headline-md text-foreground">Top más clickeadas</h3>
            <button className="text-primary typo-label-md hover:underline">Ver todo</button>
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
    <div className="bg-card border border-border p-4 rounded-xl shadow-[0px_4px_20px_rgba(160,152,144,0.08)]">
      <p className="typo-label-md text-muted-foreground mb-1">{label}</p>
      <p className="typo-headline-md font-bold text-primary">{display}</p>
      {trend && (
        <p className="flex items-center gap-1 mt-1 typo-label-md text-status-success">
          <Icon name="trending_up" size={14} />
          {trend}
        </p>
      )}
      {subtitle && <p className="typo-label-md text-muted-foreground mt-1">{subtitle}</p>}
      {barPercent && (
        <div className="w-full bg-muted h-1 rounded-full mt-3">
          <div className="bg-status-success h-1 rounded-full" style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </div>
  );
}

function DonutChart({
  disponibles,
  separadas,
  vendidas,
  total,
}: {
  disponibles: number;
  separadas: number;
  vendidas: number;
  total: number;
}) {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: disponibles, color: "stroke-status-success" },
    { value: separadas, color: "stroke-status-warning" },
    { value: vendidas, color: "stroke-status-destructive" },
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
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        className="typo-headline-md font-bold fill-foreground"
      >
        {total}
      </text>
    </svg>
  );
}

function Legend() {
  return (
    <div className="flex-grow space-y-3">
      <h3 className="typo-headline-md text-foreground">Estado de Inventario</h3>
      {[
        { color: "bg-status-success", label: "Disponible", value: "60%" },
        { color: "bg-status-warning", label: "Separado", value: "15%" },
        { color: "bg-status-destructive", label: "Vendido", value: "25%" },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="typo-label-md text-muted-foreground">{item.label}</span>
          </div>
          <span className="font-bold text-foreground">{item.value}</span>
        </div>
      ))}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between mb-2">
          <span className="typo-label-md text-muted-foreground">Cumplimiento de Ventas</span>
          <span className="font-bold text-primary">S/ 3.2M / S/ 4.5M</span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-1000"
            style={{ width: "71%" }}
          />
        </div>
      </div>
    </div>
  );
}

function TopClicksTable() {
  const { data: topClicks, isLoading } = useTopClicks(10);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="pb-2 typo-label-md text-muted-foreground">Rank</th>
          <th className="pb-2 typo-label-md text-muted-foreground">Código</th>
          <th className="pb-2 typo-label-md text-muted-foreground">Propiedad</th>
          <th className="pb-2 typo-label-md text-muted-foreground text-right">Clics</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? (
          <tr>
            <td colSpan={4} className="p-8 text-center">
              Cargando...
            </td>
          </tr>
        ) : topClicks && topClicks.length > 0 ? (
          topClicks.map((item, index) => (
            <tr key={item.propiedad.id} className="hover:bg-muted transition-colors">
              <td className="py-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                    index === 0
                      ? "bg-primary/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
              </td>
              <td className="py-3 typo-label-md text-primary">{item.propiedad.codigo}</td>
              <td className="py-3 typo-body-md text-foreground">{item.propiedad.titulo}</td>
              <td className="py-3 text-right font-bold text-primary">{item.clicks}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="p-8 text-center">
              No hay datos de clics
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function PropiedadesTab() {
  const { data, isLoading } = usePropiedades({});
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalItems = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = data?.slice((page - 1) * pageSize, page * pageSize) ?? [];
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? paginated.filter(
        (p) =>
          p.codigo.toLowerCase().includes(filter.toLowerCase()) ||
          p.titulo.toLowerCase().includes(filter.toLowerCase()),
      )
    : paginated;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="typo-headline-lg text-foreground">Gestión de Propiedades</h2>
          <p className="typo-body-md text-muted-foreground">Administra el inventario y estados</p>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:brightness-110 transition-all">
          <Icon name="add" size={20} />
          Nueva Propiedad
        </button>
      </header>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(160,152,144,0.15)]">
        <div className="p-4 bg-muted/50 border-b border-border flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card typo-body-md"
              placeholder="Buscar por código o título..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-card border border-input rounded-lg px-4 py-2 typo-label-md">
              <option>Todos los estados</option>
              <option>Disponible</option>
              <option>Separado</option>
              <option>Vendido</option>
            </select>
            <button className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Icon name="filter_list" size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 typo-label-md text-muted-foreground">Código</th>
                <th className="p-4 typo-label-md text-muted-foreground">Título</th>
                <th className="p-4 typo-label-md text-muted-foreground">Tipo</th>
                <th className="p-4 typo-label-md text-muted-foreground">Precio</th>
                <th className="p-4 typo-label-md text-muted-foreground">Estado</th>
                <th className="p-4 typo-label-md text-muted-foreground text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted transition-colors group">
                    <td className="p-4 typo-label-md text-primary">{p.codigo}</td>
                    <td className="p-4 typo-body-md text-foreground">{p.titulo}</td>
                    <td className="p-4 typo-label-md text-muted-foreground capitalize">{p.tipo}</td>
                    <td className="p-4 typo-currency-md">S/ {p.precio.toLocaleString("es-PE")}</td>
                    <td className="p-4">
                      <StatusChip status={p.estado} size="sm" />
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Icon name="edit" size={18} />
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

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

function LeadsTab() {
  const { data, isLoading } = useLeads();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="typo-headline-lg text-foreground">Leads</h2>
        <p className="typo-body-md text-muted-foreground">Gestiona contactos e intereses</p>
      </header>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(160,152,144,0.15)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 typo-label-md text-muted-foreground">Nombre</th>
                <th className="p-4 typo-label-md text-muted-foreground">Email</th>
                <th className="p-4 typo-label-md text-muted-foreground">Teléfono</th>
                <th className="p-4 typo-label-md text-muted-foreground">Propiedad</th>
                <th className="p-4 typo-label-md text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((l) => (
                  <tr key={l.id} className="hover:bg-muted transition-colors">
                    <td className="p-4 typo-body-md text-foreground">{l.nombre}</td>
                    <td className="p-4 typo-label-md text-muted-foreground">{l.email}</td>
                    <td className="p-4 typo-label-md text-muted-foreground">{l.telefono ?? "—"}</td>
                    <td className="p-4 typo-label-md text-muted-foreground truncate max-w-xs">
                      {[l.propiedadCodigo, l.propiedadTitulo].filter(Boolean).join(": ")}
                    </td>
                    <td className="p-4 typo-label-md text-muted-foreground">
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
