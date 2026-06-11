import type { MetodoPago } from "@/lib/schemas/metodo-pago";

export interface Pago {
  id: string;
  transaccionId: string;
  monto: number;
  metodoPago: MetodoPago;
  cci?: string;
  referenciaExterna?: string;
  fechaPago: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export type CrearPagoData = Omit<Pago, "id" | "createdAt" | "updatedAt">;