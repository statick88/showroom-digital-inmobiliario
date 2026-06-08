export type CommissionStatus = "pending" | "approved" | "paid";

export interface CommissionRule {
  id: string;
  minPrice: number;
  maxPrice: number | null;
  percentage: number;
  description: string;
  active: boolean;
}

export interface Commission {
  id: string;
  vendedorId: string;
  propertyId: string;
  salePrice: number;
  commissionAmount: number;
  ruleApplied?: string;
  status: CommissionStatus;
  sunatInvoiceId?: string;
  createdAt: string;
}

/**
 * Calculate commission amount based on sale price and active rules.
 * Rules are matched by price range (minPrice <= price <= maxPrice).
 * Only active rules are considered. Returns 0 if no rule matches.
 */
export function calculateCommission(
  price: number,
  rules: CommissionRule[],
): number {
  const activeRules = rules.filter((r) => r.active);
  const applicable = activeRules.find(
    (r) => price >= r.minPrice && (r.maxPrice === null || price <= r.maxPrice),
  );
  return applicable ? price * (applicable.percentage / 100) : 0;
}
