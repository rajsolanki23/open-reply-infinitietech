import { randomBytes } from "node:crypto";
import { getBaseUrl } from "@/lib/env";

const INVITE_TTL_DAYS = 14;

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateInvitationToken() {
  return randomBytes(18).toString("base64url");
}

export function getInvitationExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);
  return expiresAt;
}

export function buildInvitationUrl(token: string, baseUrl?: string) {
  let resolvedBaseUrl = baseUrl;
  if (!resolvedBaseUrl || resolvedBaseUrl.includes("localhost")) {
    if (
      typeof window !== "undefined" &&
      window.location.origin &&
      !window.location.origin.includes("localhost")
    ) {
      resolvedBaseUrl = window.location.origin;
    } else {
      resolvedBaseUrl = getBaseUrl();
    }
  }

  return `${resolvedBaseUrl.replace(/\/$/, "")}/invite/${token}`;
}

