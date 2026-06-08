import { describe, it, expectTypeOf } from "vitest";
import type { CommissionsRepository } from "@/domain/repositories/commissions.repository";
import type {
  Commission,
  CommissionRule,
  CommissionStatus,
} from "@/domain/entities/commission";

describe("CommissionsRepository interface (PR-4) — contract", () => {
  it("has listarPorVendedor method", () => {
    expectTypeOf<CommissionsRepository["listarPorVendedor"]>().toEqualTypeOf<
      (vendedorId: string) => Promise<Commission[]>
    >();
  });

  it("has crear method", () => {
    expectTypeOf<CommissionsRepository["crear"]>().toEqualTypeOf<
      (data: {
        vendedorId: string;
        propertyId: string;
        salePrice: number;
      }) => Promise<Commission>
    >();
  });

  it("has cambiarEstado method", () => {
    expectTypeOf<CommissionsRepository["cambiarEstado"]>().toEqualTypeOf<
      (id: string, status: CommissionStatus) => Promise<Commission>
    >();
  });

  it("has listarReglas method", () => {
    expectTypeOf<CommissionsRepository["listarReglas"]>().toEqualTypeOf<
      () => Promise<CommissionRule[]>
    >();
  });
});
