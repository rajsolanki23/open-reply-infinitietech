import { randomBytes } from "node:crypto";
import { getBaseUrl } from "@/lib/env";

export function generateReportShareSlug() {
  return randomBytes(9).toString("base64url");
}

export function buildReportUrl(slug: string, baseUrl?: string) {
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

  return `${resolvedBaseUrl.replace(/\/$/, "")}/reports/${slug}`;
}

// Self-hosted build: reports are never branded.
export function isReportBranded() {
  return false;
}
