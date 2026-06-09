import type {
  VirtualTour,
  CrearVirtualTourData,
  ActualizarVirtualTourData,
} from "../entities/virtual-tour";

export interface IVirtualTourRepository {
  findByProyectoId(proyectoId: string): Promise<VirtualTour[]>;
  findById(id: string): Promise<VirtualTour | null>;
  create(data: CrearVirtualTourData): Promise<VirtualTour>;
  update(id: string, data: ActualizarVirtualTourData): Promise<VirtualTour>;
  delete(id: string): Promise<void>;
}
