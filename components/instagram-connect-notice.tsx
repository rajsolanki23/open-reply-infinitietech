"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

type Tone = "error" | "warning" | "success";

const TONE_CLASSES: Record<Tone, { container: string; icon: typeof AlertCircle }> = {
  error: {
    container: "border-rose-200 bg-rose-50/80 text-rose-800",
    icon: AlertCircle,
  },
  warning: {
    container: "border-amber-200 bg-amber-50/80 text-amber-800",
    icon: AlertTriangle,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
    icon: CheckCircle2,
  },
};

const MESSAGES: Record<string, { tone: Tone; title: string; detail: string }> = {
  denied: {
    tone: "warning",
    title: "Instagram connection cancelled",
    detail:
      "You declined the permission prompt on Instagram. Start again and accept all requested permissions.",
  },
  invalid: {
    tone: "error",
    title: "Instagram connection expired",
    detail:
      "The login link was older than 10 minutes. Click Connect Instagram to start a fresh attempt.",
  },
  forbidden: {
    tone: "error",
    title: "Permission required",
    detail:
      "Only workspace owners and admins can connect an Instagram account.",
  },
  already_connected: {
    tone: "warning",
    title: "Account already connected",
    detail:
      "That Instagram account is connected to another workspace. Disconnect it there first, or connect a different account.",
  },
};

export function InstagramConnectNotice() {
  const searchParams = useSearchParams();
  const status = searchParams.get("instagram");

  if (!status) return null;

  if (status === "misconfigured") {
    const missing = (searchParams.get("missing") ?? "")
      .split(",")
      .filter(Boolean);

    return (
      <Notice tone="warning" title="Instagram settings need updating">
        <p>
          Set{" "}
          {missing.length > 0
            ? "these configuration settings"
            : "the required configuration settings"}{" "}
          and restart the server:
        </p>
        {missing.length > 0 && (
          <ul className="mt-2 space-y-1">
            {missing.map((name) => (
              <li key={name} className="font-mono text-xs text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-md inline-block mr-1">
                {name}
              </li>
            ))}
          </ul>
        )}
      </Notice>
    );
  }

  if (status === "failed") {
    const reason = searchParams.get("reason");

    return (
      <Notice tone="error" title="Instagram connection could not be completed">
        <p>
          Instagram accepted the login but the connection could not be completed. Please check your account permissions and try reconnecting.
        </p>
        {reason && (
          <p className="mt-2 font-mono text-xs break-words opacity-80">
            {reason}
          </p>
        )}
      </Notice>
    );
  }

  const known = MESSAGES[status];
  if (!known) return null;

  return (
    <Notice tone={known.tone} title={known.title}>
      <p>{known.detail}</p>
    </Notice>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title: string;
  children: React.ReactNode;
}) {
  const config = TONE_CLASSES[tone];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 text-sm shadow-xs ${config.container}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1 flex-1">
          <p className="font-semibold text-slate-900">{title}</p>
          <div className="text-xs sm:text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
