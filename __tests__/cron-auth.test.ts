import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { verifyCronRequest } from "@/lib/cron-auth";

describe("Cron Auth Verification (verifyCronRequest)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns false when no secret is configured in environment", () => {
    delete process.env.CRON_SECRET;
    delete process.env.NEXTAUTH_SECRET;

    const req = new Request("http://localhost:3000/api/cron/worker-sync", {
      headers: { authorization: "Bearer some-token" },
    });

    expect(verifyCronRequest(req)).toBe(false);
  });

  it("returns false when authorization header is missing", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";

    const req = new Request("http://localhost:3000/api/cron/worker-sync");

    expect(verifyCronRequest(req)).toBe(false);
  });

  it("returns false when token is invalid or mismatched", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";

    const req = new Request("http://localhost:3000/api/cron/worker-sync", {
      headers: { authorization: "Bearer wrong-token" },
    });

    expect(verifyCronRequest(req)).toBe(false);
  });

  it("returns true when valid CRON_SECRET is provided", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";

    const req = new Request("http://localhost:3000/api/cron/worker-sync", {
      headers: { authorization: "Bearer super-secret-cron-token" },
    });

    expect(verifyCronRequest(req)).toBe(true);
  });

  it("falls back to NEXTAUTH_SECRET when CRON_SECRET is not set", () => {
    delete process.env.CRON_SECRET;
    process.env.NEXTAUTH_SECRET = "nextauth-secret-key-1234";

    const req = new Request("http://localhost:3000/api/cron/worker-sync", {
      headers: { authorization: "Bearer nextauth-secret-key-1234" },
    });

    expect(verifyCronRequest(req)).toBe(true);
  });
});
