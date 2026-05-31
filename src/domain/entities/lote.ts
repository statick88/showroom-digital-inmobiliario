export type EstadoLote = "disponible" | "reservado" | "vendido";
export type TipoTransaccion = "reserva" | "venta";

export interface Lote {
  id: string;
  proyectoId: string;
  codigo: string;
  areaTotal: number;
  frente?: number;
  fondo?: number;
  precio: number;
  moneda: "PEN" | "USD";
  estado: EstadoLote;
  poligonoCoords: number[][][];
  imagenPlano?: string;
  descripcion?: string;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  coordenadasCentro: { lat: number; lng: number };
  imagenHero?: string;
  imagenes360: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaccion {
  id: string;
  loteId: string;
  tipo: TipoTransaccion;
  compradorNombre: string;
  compradorDocumento?: string;
  compradorEmail?: string;
  compradorTelefono?: string;
  monto: number;
  moneda: "PEN" | "USD";
  idVendedor?: string;
  notas?: string;
  createdAt: string;
}

export interface UsuarioRol {
  id: string;
  authUserId: string;
  email: string;
  nombre: string;
  rol: "admin" | "vendedor" | "comprador";
  telefono?: string;
  activo: boolean;
}

export interface DashboardMetricas {
  totalLotes: number;
  disponibles: number;
  reservados: number;
  vendidos: number;
  totalTransacciones: number;
  avancePorcentaje: number;
  totalVentasPen: number;
  totalVentasUsd: number;
}

export interface FiltrosLotes {
  estado?: EstadoLote;
  search?: string;
}

export interface CrearLoteData {
  proyectoId: string;
  codigo: string;
  areaTotal: number;
  frente?: number;
  fondo?: number;
  precio: number;
  moneda: "PEN" | "USD";
  estado?: EstadoLote;
  poligonoCoords: number[][][];
  imagenPlano?: string;
  descripcion?: string;
  orden?: number;
}

export interface CrearProyectoData {
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  coordenadasCentro: { lat: number; lng: number };
  imagenHero?: string;
  imagenes360?: string[];
}

export interface CrearTransaccionData {
  loteId: string;
  tipo: TipoTransaccion;
  compradorNombre: string;
  compradorDocumento?: string;
  compradorEmail?: string;
  compradorTelefono?: string;
  monto: number;
  moneda: "PEN" | "USD";
  idVendedor?: string;
  notas?: string;
}
