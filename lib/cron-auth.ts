import { timingSafeEqual } from "crypto";

/**
 * Timing-safe authorization helper for scheduled/cron API routes.
 *
 * Requires CRON_SECRET (or NEXTAUTH_SECRET as fallback) to be configured.
 * Strictly denies unauthenticated requests if secrets are not set.
 */
export function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

  if (!cronSecret || !authHeader) {
    return false;
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  if (authBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(authBuffer, expectedBuffer);
}
