interface RUCResult {
  valid: boolean;
  razonSocial?: string;
  error?: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRUC extends RUCResult {
  cachedAt: number;
}

/**
 * Validate a Peruvian RUC number against SUNAT format rules.
 * Caches valid results in localStorage for 24 hours.
 *
 * RUC format: 11 digits for legal entities (empresas).
 * Returns { valid, razonSocial } on success,
 * or { valid: false, error } on failure.
 */
export async function validateRUC(ruc: string): Promise<RUCResult> {
  // Check cache first
  const cachedRaw = localStorage.getItem(`ruc-${ruc}`);
  if (cachedRaw) {
    try {
      const cached: CachedRUC = JSON.parse(cachedRaw);
      if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return { valid: cached.valid, razonSocial: cached.razonSocial };
      }
      // Cache expired — remove and revalidate
      localStorage.removeItem(`ruc-${ruc}`);
    } catch {
      localStorage.removeItem(`ruc-${ruc}`);
    }
  }

  // Validate format: exactly 11 digits
  if (!/^\d{11}$/.test(ruc)) {
    return { valid: false, error: "RUC debe tener 11 dígitos" };
  }

  // Call SUNAT REST API (mock for now — production uses Edge Function)
  const result: RUCResult = {
    valid: true,
    razonSocial: `Empresa ${ruc}`,
  };

  // Cache the result
  const cacheEntry: CachedRUC = {
    ...result,
    cachedAt: Date.now(),
  };
  localStorage.setItem(`ruc-${ruc}`, JSON.stringify(cacheEntry));

  return result;
}
