import type { Pago, CrearPagoData } from "@/domain/entities/pago";

export interface PagosRepository {
  findAll(): Promise<Pago[]>;
  findByTransaccionId(transaccionId: string): Promise<Pago[]>;
  create(data: CrearPagoData): Promise<Pago>;
  getTotalPagado(transaccionId: string): Promise<number>;
}