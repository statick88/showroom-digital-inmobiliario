import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { logEvent, logError, logMetric } from "@/lib/observability";

describe("observability (T-1.6) — logEvent / logError / logMetric", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("logEvent", () => {
    it("(1) emits a structured event line with the event name and props", () => {
      logEvent("lote.reservar.clicked", { loteId: "l1", proyectoId: "p1" });

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const [tag, payload] = infoSpy.mock.calls[0] as [string, Record<string, unknown>];
      expect(tag).toBe("[event] lote.reservar.clicked");
      expect(payload).toEqual({ loteId: "l1", proyectoId: "p1" });
    });

    it("(2) accepts no props and emits an empty props object", () => {
      logEvent("app.boot");

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const [tag, payload] = infoSpy.mock.calls[0] as [string, Record<string, unknown>];
      expect(tag).toBe("[event] app.boot");
      expect(payload).toEqual({});
    });
  });

  describe("logError", () => {
    it("(3) emits an error line tagged with the scope and the error object", () => {
      const err = new Error("Supabase timeout");
      logError("lotes.listar", err, { proyectoId: "p1" });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const [tag, errArg, ctx] = errorSpy.mock.calls[0] as [
        string,
        Error,
        Record<string, unknown>,
      ];
      expect(tag).toBe("[error:lotes.listar]");
      expect(errArg).toBe(err);
      expect(ctx).toEqual({ proyectoId: "p1" });
    });

    it("(4) accepts a non-Error value (string, object) and forwards it", () => {
      logError("auth.bootstrap", "missing-token", { userId: "u1" });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const [tag, errArg, ctx] = errorSpy.mock.calls[0] as [
        string,
        unknown,
        Record<string, unknown>,
      ];
      expect(tag).toBe("[error:auth.bootstrap]");
      expect(errArg).toBe("missing-token");
      expect(ctx).toEqual({ userId: "u1" });
    });
  });

  describe("logMetric", () => {
    it("(5) emits a metric line with name=value (default unit: count)", () => {
      logMetric("lotes.loaded", 42);

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const [line] = infoSpy.mock.calls[0] as [string];
      expect(line).toBe("[metric] lotes.loaded=42count");
    });

    it("(6) emits a metric line with explicit unit (ms, bytes)", () => {
      logMetric("lotes.listar.latency", 250, "ms");
      logMetric("lotes.payload.size", 4096, "bytes");

      expect(infoSpy).toHaveBeenCalledTimes(2);
      expect(infoSpy.mock.calls[0]?.[0]).toBe("[metric] lotes.listar.latency=250ms");
      expect(infoSpy.mock.calls[1]?.[0]).toBe("[metric] lotes.payload.size=4096bytes");
    });
  });
});
