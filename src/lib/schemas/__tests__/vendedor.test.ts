import { describe, it, expect } from "vitest";
import {
  crearVendedorSchema,
  actualizarVendedorSchema,
  type CrearVendedor,
  type ActualizarVendedor,
} from "@/lib/schemas/vendedor";

describe("vendedor schemas — HU-009 form validation (spec #2668)", () => {
  describe("crearVendedorSchema", () => {
    it("(1) accepts a valid create payload (happy path)", () => {
      const payload: CrearVendedor = {
        nombre: "María Quispe",
        email: "maria.quispe@showroom.pe",
        telefono: "+51987654321",
        dni: "12345678",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        rol: "vendedor",
      };
      const result = crearVendedorSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nombre).toBe("María Quispe");
        expect(result.data.rol).toBe("vendedor");
      }
    });

    it("(2) accepts a payload with default rol when omitted (boundary)", () => {
      const payload = {
        nombre: "Juan Pérez",
        email: "juan@example.com",
        telefono: "+51912345678",
        dni: "87654321",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = crearVendedorSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rol).toBe("vendedor");
      }
    });

    it("(3) rejects a missing required field (boundary)", () => {
      const result = crearVendedorSchema.safeParse({
        email: "test@example.com",
        telefono: "+51912345678",
        dni: "12345678",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        // nombre missing
      });
      expect(result.success).toBe(false);
    });

    it("(4) rejects an invalid email (boundary)", () => {
      const result = crearVendedorSchema.safeParse({
        nombre: "Test",
        email: "not-an-email",
        telefono: "+51912345678",
        dni: "12345678",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("(5) rejects a DNI with wrong length (boundary — must be 8 digits)", () => {
      const result = crearVendedorSchema.safeParse({
        nombre: "Test",
        email: "test@example.com",
        telefono: "+51912345678",
        dni: "1234567", // 7 digits
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("(6) rejects an invalid UUID for proyectoId (boundary)", () => {
      const result = crearVendedorSchema.safeParse({
        nombre: "Test",
        email: "test@example.com",
        telefono: "+51912345678",
        dni: "12345678",
        proyectoId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("(7) rejects extra fields (strict mode)", () => {
      const result = crearVendedorSchema.safeParse({
        nombre: "Test",
        email: "test@example.com",
        telefono: "+51912345678",
        dni: "12345678",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        extraField: "should be rejected",
      });
      expect(result.success).toBe(false);
    });

    it("(8) rejects a number where a string is expected (type error)", () => {
      const result = crearVendedorSchema.safeParse({
        nombre: 42 as unknown as string,
        email: "test@example.com",
        telefono: "+51912345678",
        dni: "12345678",
        proyectoId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("actualizarVendedorSchema", () => {
    it("(1) accepts a partial update with only some fields (happy path)", () => {
      const payload: ActualizarVendedor = {
        telefono: "+51987654321",
      };
      const result = actualizarVendedorSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("(2) accepts an empty update (all fields optional) (boundary)", () => {
      const result = actualizarVendedorSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("(3) rejects extra fields (strict mode)", () => {
      const result = actualizarVendedorSchema.safeParse({
        telefono: "+51912345678",
        unauthorizedField: "x",
      });
      expect(result.success).toBe(false);
    });
  });
});
