/**
 * Zod schemas barrel export.
 *
 * Re-exports every public schema and its inferred TypeScript type so
 * callers can `import { cciSchema, type Cci } from "@/lib/schemas";`
 * instead of reaching into individual files.
 */

export { cciSchema, cciMensajeError, type Cci } from "@/lib/schemas/cci";
export { metodoPagoSchema, type MetodoPago } from "@/lib/schemas/metodo-pago";
export {
  crearVendedorSchema,
  actualizarVendedorSchema,
  type CrearVendedor,
  type ActualizarVendedor,
} from "@/lib/schemas/vendedor";
export { registrarTransaccionSchema, type RegistrarTransaccion } from "@/lib/schemas/transaccion";
