import { describe, it, expect } from "vitest";
import { cciSchema, cciMensajeError, type Cci } from "@/lib/schemas/cci";

describe("cciSchema — CCI format (spec #2668 + design #2669)", () => {
  it("(1) accepts a valid CCI: 002- prefix + 18 digits (happy path)", () => {
    const valid: Cci = "002-123456789012345678";
    const result = cciSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("002-123456789012345678");
    }
  });

  it("(2) accepts another valid CCI: different digits, same format (triangulation)", () => {
    const valid = "002-999999999999999999";
    const result = cciSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("(3) rejects a CCI that is too short (boundary)", () => {
    const result = cciSchema.safeParse("002-123");
    expect(result.success).toBe(false);
    if (!result.success) {
      // The error message must be the Spanish spec message.
      const issue = result.error.issues[0];
      expect(issue.message).toBe(cciMensajeError);
    }
  });

  it("(4) rejects a CCI that is too long (boundary)", () => {
    const result = cciSchema.safeParse("002-1234567890123456789"); // 19 digits
    expect(result.success).toBe(false);
  });

  it("(5) rejects a CCI with non-digit characters in the numeric portion (boundary)", () => {
    const result = cciSchema.safeParse("002-12345678901234567X");
    expect(result.success).toBe(false);
  });

  it("(6) rejects a CCI missing the 002- prefix (boundary)", () => {
    const result = cciSchema.safeParse("123456789012345678");
    expect(result.success).toBe(false);
  });

  it("(7) rejects an empty string (boundary)", () => {
    const result = cciSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("(8) rejects a number where a string is expected (type error)", () => {
    const result = cciSchema.safeParse(123 as unknown as string);
    expect(result.success).toBe(false);
  });
});
