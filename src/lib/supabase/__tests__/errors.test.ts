import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { rethrow, rethrowIfPresent } from "@/lib/supabase/errors";

describe("lib/supabase/errors — rethrow / rethrowIfPresent", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe("rethrow", () => {
    it("(1) logs the error to console.error with the message tag, then throws an Error with that message", () => {
      const original = new Error("original-error");
      let caught: unknown;
      try {
        rethrow(original, "translated-message");
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe("translated-message");
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const [tag, arg] = errorSpy.mock.calls[0] as [string, unknown];
      expect(tag).toBe("[translated-message]");
      expect(arg).toBe(original);
    });

    it("(2) rethrow is typed as `never` — preserves stack of the new Error", () => {
      const original = new Error("boom");
      try {
        rethrow(original, "rebranded");
      } catch (e) {
        const err = e as Error;
        expect(err.message).toBe("rebranded");
        expect(err).not.toBe(original);
        expect(err.stack).toBeDefined();
      }
    });
  });

  describe("rethrowIfPresent", () => {
    it("(3) returns void silently when error is null/undefined (no throw, no log)", () => {
      expect(() => rethrowIfPresent(null, "noop")).not.toThrow();
      expect(() => rethrowIfPresent(undefined, "noop")).not.toThrow();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("(4) rethrows when error is a non-null object (supabase PostgrestError shape)", () => {
      const supabaseError = { message: "Row not found", code: "PGRST116" };
      let caught: unknown;
      try {
        rethrowIfPresent(supabaseError, "Error al listar lotes");
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe("Error al listar lotes");
      expect(errorSpy).toHaveBeenCalledWith("[Error al listar lotes]", supabaseError);
    });

    it("(5) rethrows when error is a string (defensive — non-object errors)", () => {
      let caught: unknown;
      try {
        rethrowIfPresent("string-error", "translated");
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toBe("translated");
      expect(errorSpy).toHaveBeenCalledWith("[translated]", "string-error");
    });
  });
});
