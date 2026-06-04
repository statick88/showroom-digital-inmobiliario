/**
 * observability — T-1.6 (PR-1 foundations).
 *
 * Thin, dependency-free façade for emitting telemetry. PR-1 ships a
 * console fallback only; later PRs (3, 4) can swap the body to wire a
 * real backend (Sentry / OTel / PostHog) without changing call sites.
 *
 * Functions:
 *   - logEvent(name, props?)            — semantic event ("lote.reservar.clicked")
 *   - logError(scope, err, context?)    — error with scope tag
 *   - logMetric(name, value, unit?)     — numeric metric, default unit: "count"
 *
 * All functions are no-ops during SSR (window is undefined). They never
 * throw — telemetry must not break the host app.
 */

type MetricUnit = "count" | "ms" | "bytes" | "ratio";

const isBrowser = typeof window !== "undefined";

export function logEvent(name: string, props?: Record<string, unknown>): void {
  if (!isBrowser) return;

  console.info(`[event] ${name}`, props ?? {});
}

export function logError(scope: string, err: unknown, context?: Record<string, unknown>): void {
  if (!isBrowser) return;

  console.error(`[error:${scope}]`, err, context ?? {});
}

export function logMetric(name: string, value: number, unit: MetricUnit = "count"): void {
  if (!isBrowser) return;

  console.info(`[metric] ${name}=${value}${unit}`);
}

export type { MetricUnit };
