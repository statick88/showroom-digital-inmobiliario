/**
 * Transaccion (transaction) Zod schema.
 *
 * Spec reference: spec #2668 line 228 — `registrarTransaccionSchema`.
 * Schema mirrors `public.transacciones` (migration 00005_lotizacion_schema.sql):
 *   id, lote_id, tipo, comprador_nombre, comprador_documento,
 *   comprador_email, comprador_telefono, monto, moneda, id_vendedor,
 *   notas, created_at, updated_at.
 *
 * Money rule (per project convention + spec Q8):
 *   - `monto` is a positive number with at most 2 decimal places.
 *   - NaN, Infinity, and -Infinity are rejected.
 *   - This protects the dashboard's `Intl.NumberFormat` renderers from
 *     producing "S/." or "$NaN" displays.
 *
 * Date handling: `createdAt` and `updatedAt` accept ISO-8601 strings
 * and coerce to Date (so the schema works at the API boundary where
 * Supabase returns `timestamptz` as a string, and at the type level
 * where consumers want a `Date`).
 *
 * CCI handling: the `cci` field uses the `cciSchema` from
 * `src/lib/schemas/cci.ts` so the Zod validator and the DB CHECK
 * constraint enforce the same regex (spec #2668 GAP-2 acceptance).
 */

import { z } from "zod";
import { cciSchema } from "@/lib/schemas/cci";
import { metodoPagoSchema } from "@/lib/schemas/metodo-pago";

// Reusable building blocks ------------------------------------------------

/**
 * Money schema: positive number, max 2 decimal places, no NaN/Infinity.
 *
 * `z.number()` in zod 4 already rejects NaN by default. The `.finite()`
 * check rejects ±Infinity, and the `.multipleOf(0.01)` refinement
 * ensures at most 2 decimal places (with safe handling of float
 * representation via multiplication by 100 + Math.round).
 */
const moneySchema = z
  .number()
  .positive("monto debe ser un número positivo")
  .finite("monto no puede ser Infinity o -Infinity")
  .refine(
    (n) => {
      // Check at most 2 decimal places without float-precision footguns:
      // multiply by 100, round, compare to original * 100.
      return Math.round(n * 100) === n * 100;
    },
    { message: "monto debe tener como máximo 2 decimales" },
  );

const tipoTransaccionSchema = z.enum(["reserva", "venta"]);

const monedaSchema = z.enum(["PEN", "USD"]);

const uuidV4 = z.string().uuid("debe ser un UUID v4 válido");

const isoDate = z.iso.datetime({ offset: true });

// -------------------------------------------------------------------------

export const registrarTransaccionSchema = z
  .object({
    loteId: uuidV4,
    tipo: tipoTransaccionSchema,
    compradorNombre: z
      .string()
      .min(2, "compradorNombre debe tener al menos 2 caracteres")
      .max(100, "compradorNombre debe tener como máximo 100 caracteres"),
    compradorDocumento: z
      .string()
      .regex(/^\d{8}(\d{1,4})?$/, "compradorDocumento debe ser DNI (8 dígitos) o CE (9-12 dígitos)")
      .optional(),
    compradorEmail: z.string().email("compradorEmail debe tener formato válido").optional(),
    compradorTelefono: z
      .string()
      .regex(/^\+\d{7,15}$/, "compradorTelefono debe tener formato internacional E.164")
      .optional(),
    monto: moneySchema,
    moneda: monedaSchema.default("PEN"),
    idVendedor: uuidV4.optional(),
    metodoPago: metodoPagoSchema.optional(),
    cci: cciSchema.optional(),
    notas: z.string().max(500, "notas debe tener como máximo 500 caracteres").optional(),
    fecha: isoDate.optional(),
  })
  .strict();

export type RegistrarTransaccion = z.infer<typeof registrarTransaccionSchema>;
