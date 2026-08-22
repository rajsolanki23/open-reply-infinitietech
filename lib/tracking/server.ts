import { createHash, randomBytes } from "node:crypto";

export function generateTrackedLinkSlug() {
  return randomBytes(7).toString("base64url");
}

export function hashClickIp(ipAddress: string | null | undefined) {
  if (!ipAddress) return null;

  const salt = process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET or ENCRYPTION_KEY is required for click IP hashing");
    }
    return createHash("sha256").update(`dev-salt:${ipAddress}`).digest("hex");
  }

  return createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex");
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    null
  );
}
