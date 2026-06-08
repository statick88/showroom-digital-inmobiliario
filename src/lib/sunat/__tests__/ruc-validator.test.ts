import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock localStorage since it's not available in Node test environment
const localStorageStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  }),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
};

vi.stubGlobal("localStorage", mockLocalStorage);

import { validateRUC } from "@/lib/sunat/ruc-validator";

describe("validateRUC (PR-4) — SUNAT RUC validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  });

  afterEach(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  });

  it("returns invalid for non-11-digit RUC", async () => {
    const result = await validateRUC("12345");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for RUC with letters", async () => {
    const result = await validateRUC("1234567890A");
    expect(result.valid).toBe(false);
  });

  it("returns valid with razonSocial for valid 11-digit RUC", async () => {
    const result = await validateRUC("20512345678");
    expect(result.valid).toBe(true);
    expect(result.razonSocial).toBeDefined();
    expect(result.razonSocial!).toContain("20512345678");
  });

  it("caches valid RUC result in localStorage", async () => {
    await validateRUC("20512345678");

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "ruc-20512345678",
      expect.any(String),
    );
    const cached = localStorageStore["ruc-20512345678"];
    expect(cached).toBeDefined();
    const parsed = JSON.parse(cached!);
    expect(parsed.valid).toBe(true);
  });

  it("returns cached result on second call (no repeated validation)", async () => {
    await validateRUC("20512345678");

    const result = await validateRUC("20512345678");

    expect(result.valid).toBe(true);
    // Should have used getItem for cache lookup
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("ruc-20512345678");
  });

  it("returns invalid for empty string", async () => {
    const result = await validateRUC("");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for RUC with 10 digits (personas naturales)", async () => {
    const result = await validateRUC("1234567890");
    expect(result.valid).toBe(false);
  });

  it("returns invalid for RUC with 12 digits", async () => {
    const result = await validateRUC("123456789012");
    expect(result.valid).toBe(false);
  });
});
