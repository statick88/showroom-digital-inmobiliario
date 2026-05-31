import type { Proyecto, CrearProyectoData } from "../entities/lote";

export interface IProyectosRepository {
  listar(): Promise<Proyecto[]>;
  obtenerPorId(id: string): Promise<Proyecto | null>;
  crear(data: CrearProyectoData): Promise<Proyecto>;
  actualizar(id: string, data: Partial<Proyecto>): Promise<Proyecto>;
  eliminar(id: string): Promise<void>;
}
