export type EstadoPropiedad = "disponible" | "separado" | "vendido";
export type TipoPropiedad = "lote" | "departamento" | "casa" | "local" | "oficina" | "terreno";
export type TipoEvento = "click" | "favorito" | "contacto" | "vista_detalle";
export type RolUsuario = "admin" | "agente" | "comprador";
export type PlanAgencia = "gratis" | "premium";
export type EstadoLead = "nuevo" | "contactado" | "calificado" | "perdido" | "ganado";

export interface Propiedad {
  id: string;
  codigo: string;
  tipo: TipoPropiedad;
  estado: EstadoPropiedad;
  precio: number;
  moneda: string;
  titulo: string;
  descripcion?: string;
  areaM2?: number;
  cuartos?: number;
  banios?: number;
  ubicacion?: { x: number; y: number };
  direccion?: string;
  distrito?: string;
  ciudad: string;
  imagenes: string[];
  svgId?: string;
  agenciaId?: string;
  publicada: boolean;
  destacada: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agencia {
  id: string;
  nombre: string;
  logoUrl?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  plan: PlanAgencia;
  activa: boolean;
  createdAt: string;
}

export interface Perfil {
  id: string;
  authUserId?: string;
  email: string;
  nombre: string;
  telefono?: string;
  avatarUrl?: string;
  rol: RolUsuario;
  agenciaId?: string;
  activo: boolean;
}

export interface MetricaClick {
  id: number;
  propiedadId: string;
  tipoEvento: TipoEvento;
  sesionId?: string;
  perfilId?: string;
  paginaOrigen?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  propiedadId: string;
  perfilId?: string;
  nombre: string;
  email: string;
  telefono?: string;
  score: number;
  estado: EstadoLead;
  notas?: string;
  createdAt: string;
}

export interface DashboardMetricas {
  totalPropiedades: number;
  disponibles: number;
  separadas: number;
  vendidas: number;
  totalClicks: number;
  totalLeads: number;
  avancePorcentaje: number;
}
