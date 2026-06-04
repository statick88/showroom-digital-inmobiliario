/**
 * CCI (Código de Cuenta Interbancario) Zod schema.
 *
 * Spec reference: spec #2668 line 550 + design #2669 line 164.
 * Migration enforcement: supabase/migrations/00007_cci_validation.sql.
 *
 * Format: `002-` + exactly 18 digits (total 23 characters).
 * The `002-` prefix is the standard CCI bank-code prefix in Peru; the
 * 18 digits encode the bank, branch, account, and check digits per
 * the ASBANC specification.
 *
 * This schema is intentionally optional-friendly: an empty string is
 * NOT valid here (callers who need "optional CCI" should wrap with
 * `.optional()` or `.or(z.literal(""))` themselves). The transaccion
 * schema (src/lib/schemas/transaccion.ts) demonstrates the optional
 * pattern.
 */

import { z } from "zod";

export const cciMensajeError =
  "CCI debe tener formato 002-XXXXXXXXXXXXXXXX-XX (002- + 18 dígitos)";

export const cciSchema = z
  .string()
  .regex(/^002-\d{18}$/, cciMensajeError);

export type Cci = z.infer<typeof cciSchema>;
