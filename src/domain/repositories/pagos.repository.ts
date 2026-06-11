import type { Pago, CrearPagoData } from "@/domain/entities/pago";

export interface PagosRepository {
  findByTransaccionId(transaccionId: string): Promise<Pago[]>;
  create(data: CrearPagoData): Promise<Pago>;
  getTotalPagado(transaccionId: string): Promise<number>;
}