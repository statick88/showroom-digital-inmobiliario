import { useState, useEffect, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { usePropiedades } from "@/presentation/hooks/usePropiedades.legacy";
import { propiedadesRepository } from "@/data/repositories";
import { useMetricas } from "@/presentation/hooks/useMetricas";
import { useStatusMutation } from "@/presentation/hooks/useStatusMutation";
import { useRealtimePropiedades } from "@/presentation/hooks/useRealtimePropiedades";
import { useRealtimeLotes } from "@/presentation/hooks/useRealtimeLotes";
import { DonutChart } from "@/presentation/components/admin/DonutChart";
import { ProgressBar } from "@/presentation/components/admin/ProgressBar";
import { TopClickedTable } from "@/presentation/components/admin/TopClickedTable";
import { LeadsTable } from "@/presentation/components/admin/LeadsTable";
import { UsuariosPanel } from "@/presentation/components/admin/UsuariosPanel";
import { AuditLogPanel } from "@/presentation/components/admin/AuditLogPanel";
import { VirtualToursPanel } from "@/presentation/components/admin/VirtualToursPanel";
import { TourAnalyticsDashboard } from "@/presentation/components/admin/TourAnalyticsDashboard";
import { TourManagementTab } from "@/presentation/components/admin/TourManagementTab";
import { PagosTab } from "@/presentation/components/admin/PagosTab";
import { ReportesTab } from "@/presentation/components/admin/ReportesTab";
import { ProjectProvider, useProjectContext } from "@/presentation/context/ProjectContext";
import { ProjectSelector } from "@/presentation/components/admin/ProjectSelector";
import { DarkModeToggle } from "@/presentation/components/shared/DarkModeToggle";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Building2,
  MessageCircle,
  Users,
  LogOut,
  Search,
  Filter,
  FileText,
  Orbit,
  BarChart3,
  MapPin,
  CircleDollarSign,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import type { EstadoPropiedad } from "@/domain/entities/propiedad";

type Tab = "dashboard" | "propiedades" | "pagos" | "reportes" | "leads" | "usuarios" | "audit-log" | "virtual-tours" | "analytics" | "tour-management";

// ── Confirm dialog state ───────────────────────────────────────────
interface ConfirmState {
  open: boolean;
  propiedadId: string;
  codigo: string;
  nuevoEstado: EstadoPropiedad;
}

const PAGE_SIZE = 10;

// ── Main component ─────────────────────────────────────────────────
export function AdminDashboard() {
  return (
    <ProjectProvider>
      <AdminDashboardInner />
    </ProjectProvider>
  );
}

function AdminDashboardInner() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const { selectedProjectId } = useProjectContext();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Realtime subscriptions — auto-invalidate query caches on data changes
  useRealtimePropiedades();
  useRealtimeLotes();

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      {!isMobile && (
        <aside className="hidden md:flex w-64 h-full bg-card border-r border-border flex-col gap-6 p-6">
          <div>
            <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Gestión Inmobiliaria</p>
          </div>

          {/* Project Selector */}
          <div className="pt-2 border-t border-border">
            <ProjectSelector />
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <span className="text-xs text-muted-foreground">Tema</span>
          </div>

          <nav className="flex flex-col gap-2 flex-grow">
            <NavButton tab="dashboard" current={tab} icon="dashboard" onClick={setTab}>
              Dashboard
            </NavButton>
            <NavButton tab="propiedades" current={tab} icon="domain" onClick={setTab}>
              Propiedades
            </NavButton>
            <NavButton tab="pagos" current={tab} icon="payments" onClick={setTab}>
              Pagos
            </NavButton>
            <NavButton tab="reportes" current={tab} icon="summarize" onClick={setTab}>
              Reportes
            </NavButton>
            <NavButton tab="leads" current={tab} icon="chat_bubble" onClick={setTab}>
              Leads
            </NavButton>
            <NavButton tab="usuarios" current={tab} icon="group" onClick={setTab}>
              Usuarios
            </NavButton>
            <NavButton tab="audit-log" current={tab} icon="description" onClick={setTab}>
              Registro Auditoría
            </NavButton>
            <NavButton tab="virtual-tours" current={tab} icon="view_in_ar" onClick={setTab}>
              Tours 360°
            </NavButton>
            <NavButton tab="analytics" current={tab} icon="bar_chart" onClick={setTab}>
              Analytics
            </NavButton>
            <NavButton tab="tour-management" current={tab} icon="tour" onClick={setTab}>
              Tour
            </NavButton>
          </nav>

          {/* User Profile (3.9) */}
          <div className="mt-auto flex items-center gap-3 p-2 border-t border-border pt-4">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
              A
            </div>
            <div className="overflow-hidden flex-grow">
              <p className="text-sm text-foreground truncate font-medium">Admin User</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                admin@inmobiliaria.pe
              </p>
            </div>
            <button
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-grow bg-background min-h-screen pb-20 md:pb-0">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "propiedades" && <PropiedadesTab />}
        {tab === "pagos" && <PagosTab />}
        {tab === "reportes" && <ReportesTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "usuarios" && <UsuariosTab />}
        {tab === "audit-log" && <AuditLogTab />}
        {tab === "virtual-tours" && <VirtualToursTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "tour-management" && <TourManagementTabScreen />}
      </main>

      {/* ── Mobile bottom tab bar (3.10) ──────────────────────── */}
      {isMobile && (
        <div
          data-testid="mobile-tab-bar"
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-nowrap overflow-x-auto bg-card border-t border-border md:hidden scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <MobileTabButton
            active={tab === "dashboard"}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            onClick={() => setTab("dashboard")}
          />
          <MobileTabButton
            active={tab === "propiedades"}
            icon={<Building2 size={20} />}
            label="Propiedades"
            onClick={() => setTab("propiedades")}
          />
          <MobileTabButton
            active={tab === "pagos"}
            icon={<CircleDollarSign size={20} />}
            label="Pagos"
            onClick={() => setTab("pagos")}
          />
          <MobileTabButton
            active={tab === "reportes"}
            icon={<FileText size={20} />}
            label="Reportes"
            onClick={() => setTab("reportes")}
          />
          <MobileTabButton
            active={tab === "leads"}
            icon={<MessageCircle size={20} />}
            label="Leads"
            onClick={() => setTab("leads")}
          />
          <MobileTabButton
            active={tab === "usuarios"}
            icon={<Users size={20} />}
            label="Usuarios"
            onClick={() => setTab("usuarios")}
          />
          <MobileTabButton
            active={tab === "audit-log"}
            icon={<FileText size={20} />}
            label="Auditoría"
            onClick={() => setTab("audit-log")}
          />
          <MobileTabButton
            active={tab === "virtual-tours"}
            icon={<Orbit size={20} />}
            label="Tours 360°"
            onClick={() => setTab("virtual-tours")}
          />
          <MobileTabButton
            active={tab === "analytics"}
            icon={<BarChart3 size={20} />}
            label="Analytics"
            onClick={() => setTab("analytics")}
          />
          <MobileTabButton
            active={tab === "tour-management"}
            icon={<MapPin size={20} />}
            label="Tour"
            onClick={() => setTab("tour-management")}
          />
        </div>
      )}
    </div>
  );
}

// ── Mobile tab button ──────────────────────────────────────────────
function MobileTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex flex-col items-center gap-1 py-3 px-3 min-w-[64px] text-xs transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

// ── Nav button ─────────────────────────────────────────────────────
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
      <span className="text-sm">{children}</span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ════════════════════════════════════════════════════════════════════
function DashboardTab() {
  const { selectedProjectId } = useProjectContext();
  const { data } = useMetricas(selectedProjectId ?? undefined);

  const disponibles = data?.disponibles ?? 0;
  const separadas = data?.reservados ?? 0;
  const vendidas = data?.vendidos ?? 0;
  const total = disponibles + separadas + vendidas;
  const totalVentas = data?.totalVentasPen ?? 0;
  const avance = data?.avancePorcentaje ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Resumen operativo de hoy</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm flex items-center gap-2 border border-border">
            <Icon name="calendar_today" size={18} />
            Últimos 30 días
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Total Lotes" value={data?.totalLotes ?? 0} trend="+4 este mes" />
        <MetricCard label="Disponibles" value={disponibles} barPercent={66} />
        <MetricCard label="Reservados" value={separadas} subtitle="Pendiente firma" />
        <MetricCard label="Vendidos" value={vendidas} subtitle="Acumulado anual" />
        <MetricCard
          label="Transacciones"
          value={data?.totalTransacciones ?? 0}
          trend="12% conversión"
        />
        <MetricCard label="% Avance" value={avance} suffix="%" subtitle="Meta: S/ 4.5M" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DonutChart (3.1) — new recharts version */}
        <div className="bg-card border border-border rounded-xl shadow-card p-6">
          <DonutChart
            disponibles={disponibles}
            separadas={separadas}
            vendidas={vendidas}
            total={total}
          />
        </div>

        {/* TopClickedTable (3.3) */}
        <div className="bg-card border border-border rounded-xl shadow-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Top más clickeadas</h3>
          </div>
          <TopClickedTable />
        </div>
      </div>

      {/* ProgressBar (3.2) */}
      <div className="bg-card border border-border rounded-xl shadow-card p-6">
        <ProgressBar actual={totalVentas} meta={4500000} />
      </div>
    </div>
  );
}

// ── Metric card ────────────────────────────────────────────────────
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
  const display = suffix ? `${value}${suffix}` : value.toLocaleString("es-PE");

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-card">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-primary">{display}</p>
      {trend && (
        <p className="flex items-center gap-1 mt-1 text-xs text-status-success">
          <Icon name="trending_up" size={14} />
          {trend}
        </p>
      )}
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {barPercent && (
        <div className="w-full bg-muted h-1 rounded-full mt-3">
          <div className="bg-status-success h-1 rounded-full" style={{ width: `${barPercent}%` }} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  PROPIEDADES TAB  (3.4, 3.5, 3.7)
// ════════════════════════════════════════════════════════════════════
function PropiedadesTab() {
  const { data: propiedades, isLoading } = usePropiedades({});
  const statusMutation = useStatusMutation();
  const queryClient = useQueryClient();
  const { selectedProjectId } = useProjectContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    propiedadId: "",
    codigo: "",
    nuevoEstado: "disponible",
  });
  const [cci, setCci] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // ── Create property dialog state ────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    titulo: "",
    tipo: "lote" as TipoPropiedad,
    precio: "",
    areaM2: "",
    cuartos: "",
    banios: "",
    distrito: "",
    descripcion: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      propiedadesRepository.crear({
        codigo: data.codigo,
        titulo: data.titulo,
        tipo: data.tipo,
        precio: Number(data.precio),
        areaM2: data.areaM2 ? Number(data.areaM2) : undefined,
        cuartos: data.cuartos ? Number(data.cuartos) : undefined,
        banios: data.banios ? Number(data.banios) : undefined,
        distrito: data.distrito || undefined,
        descripcion: data.descripcion || undefined,
        agenciaId: selectedProjectId ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propiedades"] });
      setCreateOpen(false);
      setForm({ codigo: "", titulo: "", tipo: "lote", precio: "", areaM2: "", cuartos: "", banios: "", distrito: "", descripcion: "" });
    },
  });

  const handleCreate = useCallback(() => {
    if (!form.codigo.trim() || !form.titulo.trim() || !form.precio) return;
    createMutation.mutate(form);
  }, [form, createMutation]);

  // Filtering logic
  const filtered = (propiedades ?? []).filter((p) => {
    const matchesSearch =
      !search ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (p.distrito && p.distrito.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || p.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val === "all" ? "" : val);
    setPage(1);
  };

  // Status change handlers (3.5)
  const openConfirm = (id: string, codigo: string, nuevoEstado: EstadoPropiedad) => {
    setConfirm({ open: true, propiedadId: id, codigo, nuevoEstado });
    setCci("");
    setMetodoPago("");
  };

  const handleConfirm = () => {
    const payload: {
      propiedadId: string;
      estado: string;
      cci?: string;
      metodoPago?: string;
    } = {
      propiedadId: confirm.propiedadId,
      estado: confirm.nuevoEstado,
    };
    if (cci.trim()) payload.cci = cci.trim();
    if (metodoPago) payload.metodoPago = metodoPago;

    statusMutation.mutate(payload);
    setConfirm({ open: false, propiedadId: "", codigo: "", nuevoEstado: "disponible" });
  };

  const estadoOptions: { value: EstadoPropiedad; label: string }[] = [
    { value: "disponible", label: "Disponible" },
    { value: "separado", label: "Separado" },
    { value: "vendido", label: "Vendido" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Propiedades</h2>
          <p className="text-sm text-muted-foreground">Administra el inventario y estados</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:brightness-110 transition-all text-sm"
        >
          <Icon name="add" size={20} />
          Nueva Propiedad
        </button>
      </header>

      {/* Search + Filters (3.7) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-modal">
        <div className="p-4 bg-muted/50 border-b border-border flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              placeholder="Buscar por código o título..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Buscar por código o título"
            />
          </div>
          <div className="flex gap-3 items-center">
            <Filter size={18} className="text-muted-foreground" />
            <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Filtrar por estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="separado">Separado</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-xs text-muted-foreground font-medium">Código</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Título</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Tipo</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Precio</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Estado</th>
                <th className="p-4 text-xs text-muted-foreground font-medium text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-muted transition-colors group">
                    <td className="p-4 text-sm text-primary font-medium">{p.codigo}</td>
                    <td className="p-4 text-sm text-foreground">{p.titulo}</td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">{p.tipo}</td>
                    <td className="p-4 text-sm font-medium">
                      S/ {p.precio.toLocaleString("es-PE")}
                    </td>
                    <td className="p-4">
                      {/* Inline status dropdown (3.4) */}
                      <Select
                        value={p.estado}
                        onValueChange={(val) =>
                          openConfirm(p.id, p.codigo, val as EstadoPropiedad)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "text-sm rounded-lg px-2 py-1 border border-input bg-card cursor-pointer w-[130px]",
                            p.estado === "disponible" && "text-status-success",
                            p.estado === "separado" && "text-status-warning",
                            p.estado === "vendido" && "text-status-destructive",
                          )}
                          aria-label={`Estado de ${p.codigo}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {estadoOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
                            aria-label={`Acciones para ${p.codigo}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: navigate to property detail
                              window.open(`/?lote=${p.id}`, "_blank");
                            }}
                          >
                            <Eye size={14} className="mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // TODO: open edit dialog
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              // TODO: confirm delete
                            }}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState
                      title={search || statusFilter ? "No se encontraron propiedades con esos filtros" : "No hay propiedades"}
                      description={search || statusFilter ? "Intenta ajustar los filtros de búsqueda." : "Registra una propiedad para comenzar."}
                    />
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
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Status Change Confirm Dialog (3.5) */}
      <Dialog
        open={confirm.open}
        onOpenChange={(open) => {
          if (!open) setConfirm((prev) => ({ ...prev, open: false }));
        }}
      >
        {confirm.open && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Separar lote {confirm.codigo}?</DialogTitle>
              <DialogDescription>
                Confirma el cambio de estado a &quot;
                {confirm.nuevoEstado === "disponible"
                  ? "Disponible"
                  : confirm.nuevoEstado === "separado"
                    ? "Separado"
                    : "Vendido"}
                &quot;
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* CCI input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-cci" className="text-xs text-muted-foreground font-medium">CCI (opcional)</label>
                <Input
                  id="confirm-cci"
                  className="w-full"
                  placeholder="002-XXXXXXXXXXXX-XX"
                  value={cci}
                  onChange={(e) => setCci(e.target.value)}
                />
              </div>

              {/* Payment method */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-metodo-pago" className="text-xs text-muted-foreground font-medium">
                  Método de pago (opcional)
                </label>
                <Select value={metodoPago || "none"} onValueChange={(val) => setMetodoPago(val === "none" ? "" : val)}>
                  <SelectTrigger id="confirm-metodo-pago" className="w-full" aria-label="Método de pago">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seleccionar...</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="financiamiento">Financiamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirm({ ...confirm, open: false })}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={statusMutation.isPending}>
                {statusMutation.isPending ? "Actualizando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create Property Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        {createOpen && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva Propiedad</DialogTitle>
              <DialogDescription>Registra una nueva propiedad en el inventario</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-codigo" className="text-xs text-muted-foreground font-medium">Código *</label>
                  <Input
                    id="prop-codigo"
                    className="w-full"
                    placeholder="LOTE-001"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    aria-label="Código de propiedad"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-tipo" className="text-xs text-muted-foreground font-medium">Tipo *</label>
                  <Select value={form.tipo} onValueChange={(val) => setForm({ ...form, tipo: val as TipoPropiedad })}>
                    <SelectTrigger id="prop-tipo" className="w-full" aria-label="Tipo de propiedad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lote">Lote</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="prop-titulo" className="text-xs text-muted-foreground font-medium">Título *</label>
                <Input
                  id="prop-titulo"
                  className="w-full"
                  placeholder="Lote 120m² en Urbanización Los Olivos"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  aria-label="Título de la propiedad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-precio" className="text-xs text-muted-foreground font-medium">Precio (S/) *</label>
                  <Input
                    id="prop-precio"
                    type="number"
                    className="w-full"
                    placeholder="85000"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    aria-label="Precio en soles"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-area" className="text-xs text-muted-foreground font-medium">Área (m²)</label>
                  <Input
                    id="prop-area"
                    type="number"
                    className="w-full"
                    placeholder="120"
                    value={form.areaM2}
                    onChange={(e) => setForm({ ...form, areaM2: e.target.value })}
                    aria-label="Área en metros cuadrados"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-cuartos" className="text-xs text-muted-foreground font-medium">Cuartos</label>
                  <Input
                    id="prop-cuartos"
                    type="number"
                    className="w-full"
                    value={form.cuartos}
                    onChange={(e) => setForm({ ...form, cuartos: e.target.value })}
                    aria-label="Número de cuartos"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-banios" className="text-xs text-muted-foreground font-medium">Baños</label>
                  <Input
                    id="prop-banios"
                    type="number"
                    className="w-full"
                    value={form.banios}
                    onChange={(e) => setForm({ ...form, banios: e.target.value })}
                    aria-label="Número de baños"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prop-distrito" className="text-xs text-muted-foreground font-medium">Distrito</label>
                  <Input
                    id="prop-distrito"
                    className="w-full"
                    placeholder="Ate"
                    value={form.distrito}
                    onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                    aria-label="Distrito"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="prop-descripcion" className="text-xs text-muted-foreground font-medium">Descripción</label>
                <textarea
                  id="prop-descripcion"
                  className="w-full px-3 py-2 rounded-lg border border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none bg-card text-sm resize-none"
                  rows={3}
                  placeholder="Descripción de la propiedad..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  aria-label="Descripción de la propiedad"
                />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-destructive">Error al crear propiedad. Verifica los datos.</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !form.codigo.trim() || !form.titulo.trim() || !form.precio}
              >
                {createMutation.isPending ? "Creando..." : "Crear Propiedad"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  LEADS TAB  (3.8)
// ════════════════════════════════════════════════════════════════════
function LeadsTab() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground">Leads</h2>
        <p className="text-sm text-muted-foreground">Gestiona contactos e intereses</p>
      </header>
      <LeadsTable />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  USUARIOS TAB  (T-5.1, HU-009)
// ════════════════════════════════════════════════════════════════════
function UsuariosTab() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <UsuariosPanel />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  AUDIT LOG TAB  (T-5.5, PR-5)
// ════════════════════════════════════════════════════════════════════
function AuditLogTab() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <AuditLogPanel />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  VIRTUAL TOURS TAB
// ════════════════════════════════════════════════════════════════════
function VirtualToursTab() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <VirtualToursPanel />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  ANALYTICS TAB  (read-only dashboard)
// ════════════════════════════════════════════════════════════════════
function AnalyticsTab() {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <TourAnalyticsDashboard />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  TOUR MANAGEMENT TAB  (CRUD)
// ════════════════════════════════════════════════════════════════════
function TourManagementTabScreen() {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <TourManagementTab />
    </div>
  );
}
