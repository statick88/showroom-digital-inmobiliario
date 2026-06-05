import type { Transaccion, CrearTransaccionData, DashboardMetricas } from "../entities/lote";

export interface ITransaccionesRepository {
  listar(loteId?: string): Promise<Transaccion[]>;
  /**
   * T-4.5: list every transaction for a given seller, newest first.
   * The repository does NOT filter by `proyectoId` — the caller is
   * expected to pass a `vendedorId` that has already been scope-checked
   * by RLS + the auth store.
   */
  listarPorVendedor(vendedorId: string): Promise<Transaccion[]>;
  crear(data: CrearTransaccionData): Promise<Transaccion>;
  obtenerMetricas(proyectoId: string): Promise<DashboardMetricas>;
  exportarCSV(proyectoId: string): Promise<string>;
}
