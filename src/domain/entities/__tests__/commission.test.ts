import { describe, it, expectTypeOf } from "vitest";
import type {
  Commission,
  CommissionRule,
  CommissionStatus,
} from "@/domain/entities/commission";

describe("Commission entity (PR-4) — type-level sanity", () => {
  it("Commission has required fields with correct types", () => {
    expectTypeOf<Commission>().toHaveProperty("id");
    expectTypeOf<Commission>().toHaveProperty("vendedorId");
    expectTypeOf<Commission>().toHaveProperty("propertyId");
    expectTypeOf<Commission>().toHaveProperty("salePrice");
    expectTypeOf<Commission>().toHaveProperty("commissionAmount");
    expectTypeOf<Commission>().toHaveProperty("status");
    expectTypeOf<Commission>().toHaveProperty("createdAt");

    expectTypeOf<Commission["id"]>().toBeString();
    expectTypeOf<Commission["vendedorId"]>().toBeString();
    expectTypeOf<Commission["propertyId"]>().toBeString();
    expectTypeOf<Commission["salePrice"]>().toBeNumber();
    expectTypeOf<Commission["commissionAmount"]>().toBeNumber();
    expectTypeOf<Commission["createdAt"]>().toBeString();
  });

  it("Commission.status is a union of pending | approved | paid", () => {
    expectTypeOf<CommissionStatus>().toEqualTypeOf<
      "pending" | "approved" | "paid"
    >();
  });

  it("Commission.sunatInvoiceId is optional string", () => {
    expectTypeOf<Commission["sunatInvoiceId"]>().toEqualTypeOf<
      string | undefined
    >();
  });
});

describe("CommissionRule entity (PR-4) — type-level sanity", () => {
  it("CommissionRule has required fields with correct types", () => {
    expectTypeOf<CommissionRule>().toHaveProperty("id");
    expectTypeOf<CommissionRule>().toHaveProperty("minPrice");
    expectTypeOf<CommissionRule>().toHaveProperty("maxPrice");
    expectTypeOf<CommissionRule>().toHaveProperty("percentage");
    expectTypeOf<CommissionRule>().toHaveProperty("description");
    expectTypeOf<CommissionRule>().toHaveProperty("active");

    expectTypeOf<CommissionRule["id"]>().toBeString();
    expectTypeOf<CommissionRule["minPrice"]>().toBeNumber();
    expectTypeOf<CommissionRule["percentage"]>().toBeNumber();
    expectTypeOf<CommissionRule["description"]>().toBeString();
    expectTypeOf<CommissionRule["active"]>().toBeBoolean();
  });

  it("CommissionRule.maxPrice is number or null (open-ended tier)", () => {
    expectTypeOf<CommissionRule["maxPrice"]>().toEqualTypeOf<number | null>();
  });
});
