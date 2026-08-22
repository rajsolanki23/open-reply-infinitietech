"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { hashPassword, normalizeEmail, verifyPassword } from "@/lib/auth-passwords";
import { ensureWorkspaceForUser } from "@/lib/workspace";
import { checkAuthRateLimit } from "@/lib/utils/rate-limiter";

export type AuthActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
  isExistingAccount?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!rawEmail || !password) {
    return { error: "Please enter both email and password." };
  }

  if (!EMAIL_REGEX.test(rawEmail)) {
    return { error: "Please enter a valid email address." };
  }

  const normalized = normalizeEmail(rawEmail);
  const rateLimit = await checkAuthRateLimit(`login:${normalized}`, 10, 900);
  if (!rateLimit.allowed) {
    return {
      error: "Too many sign-in attempts. Please wait a few minutes before trying again.",
    };
  }

  try {
    await signIn("credentials", {
      email: normalized,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password. Please check your credentials." };
        default:
          return { error: "Unable to sign in. Please verify your email and password." };
      }
    }
    // Must re-throw NEXT_REDIRECT to allow Next.js to navigate
    throw error;
  }
}

export async function registerAction(): Promise<AuthActionResult> {
  return {
    error:
      "Public registration is disabled. Please contact your workspace administrator in Settings to provision an account.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const existingPassword = String(formData.get("existingPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!rawEmail) {
    return { error: "Please enter your email address." };
  }

  if (!EMAIL_REGEX.test(rawEmail)) {
    return { error: "Please enter a valid email address." };
  }

  if (!existingPassword) {
    return { error: "Please enter your existing password." };
  }

  if (!newPassword) {
    return { error: "Please enter a new password." };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match. Please verify." };
  }

  const normalizedEmail = normalizeEmail(rawEmail);

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { error: "No account found with this email address." };
    }

    const isValid = await verifyPassword(existingPassword, user.passwordHash);
    if (!isValid) {
      return { error: "Existing password is wrong. Please check your credentials." };
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: "Password reset successfully! Please sign in with your new password.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

