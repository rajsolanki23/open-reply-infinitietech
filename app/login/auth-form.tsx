"use client";

import { useState, useActionState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, Lock } from "lucide-react";
import {
  loginAction,
  resetPasswordAction,
  type AuthActionResult,
} from "./actions";
import { GradientButton } from "@/components/ui-refined/gradient-button";

interface AuthFormProps {
  callbackUrl: string;
  initialMode?: "signin" | "reset";
}

export default function AuthForm({
  callbackUrl,
  initialMode = "signin",
}: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showExistingPassword, setShowExistingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [clientError, setClientError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const [loginState, runLoginAction, loginPending] = useActionState<
    AuthActionResult,
    FormData
  >(loginAction, {});

  const [resetState, runResetAction, resetPending] = useActionState<
    AuthActionResult,
    FormData
  >(resetPasswordAction, {});

  // Reset client error on field changes
  useEffect(() => {
    if (clientError) setClientError(null);
  }, [email, password, existingPassword, newPassword, confirmNewPassword]);

  // Update reset success message
  useEffect(() => {
    if (resetState.success && resetState.message) {
      setResetSuccessMessage(resetState.message);
      setExistingPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [resetState]);

  const activeServerErr = mode === "signin" ? loginState.error : resetState.error;
  const activeError = clientError || activeServerErr;
  const isPending = mode === "signin" ? loginPending : resetPending;

  function switchMode(newMode: "signin" | "reset") {
    setMode(newMode);
    setClientError(null);
    setResetSuccessMessage(null);
    setShowPassword(false);
    setShowExistingPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  }

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    setClientError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      event.preventDefault();
      setClientError("Please enter your email address.");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      event.preventDefault();
      setClientError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      event.preventDefault();
      setClientError("Please enter your password.");
      return;
    }
  }

  function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
    setClientError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      event.preventDefault();
      setClientError("Please enter your email address.");
      return;
    }
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      event.preventDefault();
      setClientError("Please enter a valid email address.");
      return;
    }
    if (!existingPassword) {
      event.preventDefault();
      setClientError("Please enter your existing password.");
      return;
    }
    if (newPassword.length < 6) {
      event.preventDefault();
      setClientError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      event.preventDefault();
      setClientError("New passwords do not match. Please verify.");
      return;
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Header */}
      {mode === "reset" ? (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
              <p className="text-[11px] text-slate-500">
                Match existing password to authorize update
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Sign in</span>
          </button>
        </div>
      ) : (
        <div className="pb-1 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sign In to OpenReply
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your company marketing workspace and automations
          </p>
        </div>
      )}

      {/* Success Alert */}
      {resetSuccessMessage && mode === "reset" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-800 animate-in fade-in duration-200 space-y-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold">{resetSuccessMessage}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                You can now sign in using your updated password.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              Sign in now &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {activeError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium text-xs sm:text-sm">{activeError}</span>
          </div>
        </div>
      )}

      {/* 1. Sign In Form */}
      {mode === "signin" && (
        <form
          action={runLoginAction}
          onSubmit={handleLoginSubmit}
          className="space-y-4.5"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div className="space-y-1.5">
            <label
              htmlFor="signin-email"
              className="block text-xs font-semibold text-slate-700 capitalize tracking-wide"
            >
              Email address
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
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold text-slate-700 capitalize tracking-wide"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              >
                Reset password?
              </button>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <GradientButton
              type="submit"
              size="md"
              loading={isPending}
              className="w-full h-11 text-sm font-semibold"
            >
              <span>Sign in</span>
            </GradientButton>
          </div>

          <p className="text-center text-[11px] text-slate-400 pt-2">
            🔒 Private company management tool. Accounts are provisioned inside Settings by team administrators.
          </p>
        </form>
      )}

      {/* 2. Reset Password Form */}
      {mode === "reset" && (
        <form
          action={runResetAction}
          onSubmit={handleResetSubmit}
          className="space-y-4.5"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-slate-700 capitalize tracking-wide"
            >
              Account Email
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Existing Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-existing-password"
              className="block text-xs font-semibold text-slate-700 tracking-wide"
            >
              Existing Password
            </label>
            <div className="relative">
              <input
                id="reset-existing-password"
                name="existingPassword"
                type={showExistingPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter current password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowExistingPassword(!showExistingPassword)}
                tabIndex={-1}
                aria-label={showExistingPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showExistingPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Email + existing password must match to authorize reset.
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-new-password"
              className="block text-xs font-semibold text-slate-700 tracking-wide"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-new-password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-amber-600 mt-1">
                New password must be at least 6 characters ({newPassword.length}/6)
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-confirm-new-password"
              className="block text-xs font-semibold text-slate-700 tracking-wide"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="reset-confirm-new-password"
                name="confirmPassword"
                type={showConfirmNewPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                tabIndex={-1}
                aria-label={
                  showConfirmNewPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showConfirmNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className="text-xs text-amber-600 mt-1">
                New passwords do not match
              </p>
            )}
          </div>

          <div className="pt-2">
            <GradientButton
              type="submit"
              size="md"
              loading={isPending}
              className="w-full h-11 text-sm font-semibold"
            >
              <span>Verify &amp; Reset Password</span>
            </GradientButton>
          </div>
        </form>
      )}
    </div>
  );
}
