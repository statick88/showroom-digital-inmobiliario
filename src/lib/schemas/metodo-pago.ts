/**
 * Payment method enum Zod schema.
 *
 * Decision reference: decision #2664 (Hans Erik, 2026-06-03).
 *   HU-017 scope: pagos digitales + bancarios con CCI; no cuotas/pagos
 *   tables; `metodo_pago` enum on `transacciones`.
 *
 * The enum lists every payment method the showroom accepts:
 *   - Digital wallets: yape, plin
 *   - Bank transfers: transferencia (generic), bcp, interbank, bbva, scotiabank
 *   - Cash: efectivo
 *
 * All values are lowercase to match the convention used in the
 * `transacciones.metodo_pago` column and to keep Zod enum validation
 * deterministic (case-sensitive match).
 */

import { z } from "zod";

export const metodoPagoSchema = z.enum([
  "yape",
  "plin",
  "transferencia",
  "bcp",
  "interbank",
  "bbva",
  "scotiabank",
  "efectivo",
]);

export type MetodoPago = z.infer<typeof metodoPagoSchema>;
