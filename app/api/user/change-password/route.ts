import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth-passwords";
import { checkAuthRateLimit } from "@/lib/utils/rate-limiter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkAuthRateLimit(`change-password:${userId}`, 5, 900);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many password change attempts. Please wait 15 minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const existingPassword = String(body.existingPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (!existingPassword) {
      return NextResponse.json(
        { error: "Please enter your existing password." },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "Please enter a new password." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match. Please verify." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Account not found or password not initialized." },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(existingPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Existing password is wrong. Please check your credentials." },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
