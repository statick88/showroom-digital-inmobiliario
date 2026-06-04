import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the SSR / no-window branches of the observability facade.
 *
 * The main `observability.test.ts` already covers the browser path.
 * Here we want to prove that:
 *   - when `window` is undefined (SSR / node-only context)
 *   - logEvent / logError / logMetric are all silent no-ops
 *   - they do NOT throw, regardless of the props
 *
 * Strategy: stub `window` to `undefined` via `vi.stubGlobal` so the module
 * re-evaluates `typeof window !== "undefined"` as false on the next import.
 */
describe("lib/observability — SSR no-op behavior (window=undefined)", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("(1) logEvent is a silent no-op when window is undefined (does not call console.info)", async () => {
    vi.stubGlobal("window", undefined);
    const { logEvent } = await import("@/lib/observability");
    expect(() => logEvent("app.boot", { foo: "bar" })).not.toThrow();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("(2) logError is a silent no-op when window is undefined (does not call console.error)", async () => {
    vi.stubGlobal("window", undefined);
    const { logError } = await import("@/lib/observability");
    expect(() => logError("scope.test", new Error("boom"), { ctx: 1 })).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("(3) logMetric is a silent no-op when window is undefined (does not call console.info)", async () => {
    vi.stubGlobal("window", undefined);
    const { logMetric } = await import("@/lib/observability");
    expect(() => logMetric("metric.name", 100, "ms")).not.toThrow();
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
