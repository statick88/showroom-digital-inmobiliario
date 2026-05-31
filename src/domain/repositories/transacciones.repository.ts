import type { Transaccion, CrearTransaccionData, DashboardMetricas } from "../entities/lote";

export interface ITransaccionesRepository {
  listar(loteId?: string): Promise<Transaccion[]>;
  crear(data: CrearTransaccionData): Promise<Transaccion>;
  obtenerMetricas(proyectoId: string): Promise<DashboardMetricas>;
  exportarCSV(proyectoId: string): Promise<string>;
}
