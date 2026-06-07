import { describe, it, expect } from "vitest";
import { normalizeDni, formatDni } from "./utils";

describe("normalizeDni", () => {
  it("removes non-digit characters", () => {
    expect(normalizeDni("12.345.678")).toBe("12345678");
    expect(normalizeDni("12-345-678")).toBe("12345678");
    expect(normalizeDni("1 2 3 4 5 6 7 8")).toBe("12345678");
    expect(normalizeDni("abc123def")).toBe("123");
  });

  it("keeps digits as-is", () => {
    expect(normalizeDni("12345678")).toBe("12345678");
    expect(normalizeDni("")).toBe("");
  });
});

describe("formatDni", () => {
  it("formats 8 digits with dots", () => {
    expect(formatDni("12345678")).toBe("12.345.678");
  });

  it("formats partial input", () => {
    expect(formatDni("12")).toBe("12");
    expect(formatDni("1234")).toBe("12.34");
    expect(formatDni("123456")).toBe("12.34.56");
  });

  it("normalizes then formats", () => {
    expect(formatDni("12.345.678")).toBe("12.345.678");
    expect(formatDni("1234-5678")).toBe("12.345.678");
  });
});

