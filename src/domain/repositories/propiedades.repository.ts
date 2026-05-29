import type { Propiedad, DashboardMetricas, MetricaClick, Lead } from "@/domain/entities/propiedad";

export interface PropiedadesRepository {
  listar(filtros?: FiltrosPropiedades): Promise<Propiedad[]>;
  obtenerPorId(id: string): Promise<Propiedad | null>;
  crear(data: CrearPropiedadData): Promise<Propiedad>;
  actualizar(id: string, data: Partial<Propiedad>): Promise<Propiedad>;
  eliminar(id: string): Promise<void>;
  cambiarEstado(id: string, estado: Propiedad["estado"]): Promise<Propiedad>;
  obtenerDashboard(agenciaId: string): Promise<DashboardMetricas>;
}

export interface MetricasRepository {
  registrarClick(data: CrearMetricaData): Promise<void>;
  obtenerTopClicks(
    agenciaId: string,
    limite?: number,
  ): Promise<{ propiedad: Propiedad; clicks: number }[]>;
}

export interface LeadsRepository {
  listarPorAgencia(agenciaId: string): Promise<Lead[]>;
  crear(data: CrearLeadData): Promise<Lead>;
  actualizarScore(id: string, score: number): Promise<Lead>;
}

export interface FiltrosPropiedades {
  tipo?: string;
  estado?: string;
  distrito?: string;
  moneda?: string;
  precioMin?: number;
  precioMax?: number;
  cuartosMin?: number;
  agenciaId?: string;
  publicada?: boolean;
  search?: string;
}

export interface CrearPropiedadData {
  codigo: string;
  tipo: Propiedad["tipo"];
  precio: number;
  titulo: string;
  descripcion?: string;
  areaM2?: number;
  cuartos?: number;
  banios?: number;
  distrito?: string;
  ciudad?: string;
  imagenes?: string[];
  svgId?: string;
  agenciaId: string;
}

export interface CrearMetricaData {
  propiedadId: string;
  tipoEvento: MetricaClick["tipoEvento"];
  sesionId?: string;
  perfilId?: string;
  paginaOrigen?: string;
}

export interface CrearLeadData {
  propiedadId: string;
  nombre: string;
  email: string;
  telefono?: string;
  perfilId?: string;
}
