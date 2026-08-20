"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { hashPassword, normalizeEmail } from "@/lib/auth-passwords";
import { ensureWorkspaceForUser } from "@/lib/workspace";

export type AuthActionResult = {
  error?: string;
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

  try {
    await signIn("credentials", {
      email: normalizeEmail(rawEmail),
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

export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!rawEmail || !password) {
    return { error: "Please enter both email and password." };
  }

  if (!EMAIL_REGEX.test(rawEmail)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Please verify." };
  }

  const normalizedEmail = normalizeEmail(rawEmail);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, passwordHash: true },
    });

    if (existingUser) {
      if (existingUser.passwordHash) {
        return {
          error: "An account with this email already exists. Please sign in instead.",
          isExistingAccount: true,
        };
      }

      // If user existed without a password (legacy account), set password now
      const passwordHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          name: name || undefined,
        },
      });
      await ensureWorkspaceForUser(existingUser.id, normalizedEmail);
    } else {
      // Create fresh user
      const passwordHash = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name || normalizedEmail.split("@")[0],
        },
      });
      await ensureWorkspaceForUser(newUser.id, normalizedEmail);
    }

    // Immediately sign in the registered user
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: callbackUrl,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please switch to Sign In." };
    }
    // Must re-throw NEXT_REDIRECT to allow Next.js to navigate
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

