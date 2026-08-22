import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { hashPassword, normalizeEmail } from "@/lib/auth-passwords";
import { canManageWorkspace, getCurrentWorkspaceContext } from "@/lib/workspace-access";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const context = await getCurrentWorkspaceContext();

  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in to create accounts." },
      { status: 401 }
    );
  }

  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden. Only workspace owners and admins can create user accounts." },
      { status: 403 }
    );
  }

  const { workspaceId } = context;

  try {
    const body = await request.json();
    const rawEmail = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const roleInput = String(body.role ?? "MEMBER").toUpperCase();
    const role = roleInput === "ADMIN" ? "ADMIN" : "MEMBER";

    if (!rawEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(rawEmail);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        workspaceMembers: {
          where: { workspaceId },
        },
      },
    });

    if (existingUser) {
      if (existingUser.workspaceMembers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email is already a member of this workspace.",
          },
          { status: 409 }
        );
      }

      // If user exists globally but isn't in this workspace, add as member WITHOUT altering their existing credentials
      const member = await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: existingUser.id,
          role,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Existing account added to workspace: ${normalizedEmail}`,
        user: {
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          role: member.role,
        },
      });
    }

    // Create fresh user with hashed credentials
    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name || normalizedEmail.split("@")[0],
        workspaceMembers: {
          create: {
            workspaceId,
            role,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        workspaceMembers: {
          where: { workspaceId },
          select: { role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${normalizedEmail}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.workspaceMembers[0]?.role ?? role,
      },
    });
  } catch (error) {
    console.error("[Create User API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user account. Please try again." },
      { status: 500 }
    );
  }
}
