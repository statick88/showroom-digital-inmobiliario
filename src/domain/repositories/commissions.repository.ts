import type {
  Commission,
  CommissionRule,
  CommissionStatus,
} from "@/domain/entities/commission";

export interface CommissionsRepository {
  listarPorVendedor(vendedorId: string): Promise<Commission[]>;
  crear(data: {
    vendedorId: string;
    propertyId: string;
    salePrice: number;
  }): Promise<Commission>;
  cambiarEstado(id: string, status: CommissionStatus): Promise<Commission>;
  listarReglas(): Promise<CommissionRule[]>;
}
