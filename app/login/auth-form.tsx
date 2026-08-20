"use client";

import { useState, useActionState } from "react";
import { loginAction, registerAction, type AuthActionResult } from "./actions";

interface AuthFormProps {
  callbackUrl: string;
  initialMode?: "signin" | "signup";
}

export default function AuthForm({
  callbackUrl,
  initialMode = "signin",
}: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");

  const [loginState, runLoginAction, loginPending] = useActionState<
    AuthActionResult,
    FormData
  >(loginAction, {});

  const [registerState, runRegisterAction, registerPending] = useActionState<
    AuthActionResult,
    FormData
  >(registerAction, {});

  const activeError =
    mode === "signin" ? loginState.error : registerState.error;
  const isPending = mode === "signin" ? loginPending : registerPending;

  function switchMode(newMode: "signin" | "signup") {
    setMode(newMode);
  }

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 rounded-lg bg-surface/80 p-1 border border-border">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`py-2 text-sm font-semibold rounded-md transition-all ${
            mode === "signin"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`py-2 text-sm font-semibold rounded-md transition-all ${
            mode === "signup"
              ? "bg-accent text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400">
          <div className="flex items-start justify-between gap-2">
            <span>{activeError}</span>
            {registerState.isExistingAccount && mode === "signup" && (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="whitespace-nowrap text-xs font-semibold text-accent underline hover:text-accent-hover"
              >
                Sign In &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sign In Form */}
      {mode === "signin" ? (
        <form action={runLoginAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-1.5">
            <label
              htmlFor="signin-email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Email Address
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signin-password"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-indigo-500/25 transition-all hover:bg-accent-hover disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        /* Sign Up Form */
        <form action={runRegisterAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-1.5">
            <label
              htmlFor="signup-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Full Name (Optional)
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Email Address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-semibold text-foreground uppercase tracking-wide"
            >
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-indigo-500/25 transition-all hover:bg-accent-hover disabled:opacity-50"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
