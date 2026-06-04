/**
 * Vendedor (seller) Zod schemas.
 *
 * Spec reference: spec #2668 line 227 — T-2.3 declares
 * `crearVendedorSchema` and `actualizarVendedorSchema` for the HU-009
 * admin form (`CrearVendedorDialog.tsx`, T-5.4).
 *
 * Rules:
 *   - `nombre` (1-100 chars)
 *   - `email` (RFC-5322 valid email)
 *   - `telefono` (E.164-ish, + and 7-15 digits)
 *   - `dni` (8 digits, Peru national ID)
 *   - `proyectoId` (UUID v4, foreign key to public.proyectos.id)
 *   - `rol` (enum admin | vendedor | comprador, defaults to "vendedor")
 *   - All schemas use `.strict()` so callers cannot sneak in extra
 *     fields — Supabase RLS is the source of truth for authorization,
 *     so a strict schema is the right defense-in-depth.
 */

import { z } from "zod";

// Reusable building blocks ------------------------------------------------

const uuidV4 = z.string().uuid("proyectoId debe ser un UUID v4 válido");

const dniSchema = z
  .string()
  .regex(/^\d{8}$/, "DNI debe tener exactamente 8 dígitos");

const telefonoSchema = z
  .string()
  .regex(/^\+\d{7,15}$/, "teléfono debe tener formato internacional E.164 (+51987654321)");

const nombreSchema = z
  .string()
  .min(2, "nombre debe tener al menos 2 caracteres")
  .max(100, "nombre debe tener como máximo 100 caracteres");

const emailSchema = z.string().email("email debe tener formato válido (usuario@dominio)");

const rolSchema = z.enum(["admin", "vendedor", "comprador"]);

// -------------------------------------------------------------------------

export const crearVendedorSchema = z
  .object({
    nombre: nombreSchema,
    email: emailSchema,
    telefono: telefonoSchema,
    dni: dniSchema,
    proyectoId: uuidV4,
    rol: rolSchema.default("vendedor"),
  })
  .strict();

export type CrearVendedor = z.infer<typeof crearVendedorSchema>;

export const actualizarVendedorSchema = z
  .object({
    nombre: nombreSchema.optional(),
    email: emailSchema.optional(),
    telefono: telefonoSchema.optional(),
    dni: dniSchema.optional(),
    proyectoId: uuidV4.optional(),
    rol: rolSchema.optional(),
    activo: z.boolean().optional(),
  })
  .strict();

export type ActualizarVendedor = z.infer<typeof actualizarVendedorSchema>;
