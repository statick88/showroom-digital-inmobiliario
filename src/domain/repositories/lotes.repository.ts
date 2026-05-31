import type { Lote, FiltrosLotes, CrearLoteData, EstadoLote } from "../entities/lote";

export interface ILotesRepository {
  listar(proyectoId: string, filtros?: FiltrosLotes): Promise<Lote[]>;
  obtenerPorId(id: string): Promise<Lote | null>;
  crear(data: CrearLoteData): Promise<Lote>;
  actualizar(id: string, data: Partial<Lote>): Promise<Lote>;
  cambiarEstado(id: string, estado: EstadoLote): Promise<Lote>;
  eliminar(id: string): Promise<void>;
}
