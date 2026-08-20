import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  normalizeEmail,
} from "../lib/auth-passwords";

describe("auth passwords utility", () => {
  it("hashes and correctly verifies passwords", async () => {
    const raw = "SecurePassword123!";
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(raw);

    const isValid = await verifyPassword(raw, hash);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword("WrongPassword123!", hash);
    expect(isWrong).toBe(false);
  });

  it("normalizes emails by trimming and lowercasing", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    expect(normalizeEmail("test.user+tag@domain.co.uk")).toBe(
      "test.user+tag@domain.co.uk"
    );
  });
});
