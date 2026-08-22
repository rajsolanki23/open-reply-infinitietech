import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next-auth before actions are imported
vi.mock("next-auth", () => {
  class AuthError extends Error {
    type: string;
    constructor(message?: string) {
      super(message);
      this.type = "CredentialsSignin";
    }
  }
  return {
    default: vi.fn(),
    AuthError,
  };
});

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/workspace", () => ({
  ensureWorkspaceForUser: vi.fn().mockResolvedValue({ id: "ws-123", name: "Default" }),
}));

vi.mock("@/lib/utils/rate-limiter", () => ({
  checkAuthRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 5, retryAfterSeconds: 0 }),
}));

import { loginAction, registerAction, resetPasswordAction, signOutAction } from "../app/login/actions";
import { hashPassword } from "@/lib/auth-passwords";

describe("Auth Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginAction", () => {
    it("returns error when email or password is missing", async () => {
      const formData = new FormData();
      formData.set("email", "");
      formData.set("password", "");

      const result = await loginAction(null, formData);
      expect(result.error).toBe("Please enter both email and password.");
    });

    it("returns error for invalid email format", async () => {
      const formData = new FormData();
      formData.set("email", "not-an-email");
      formData.set("password", "validPass123");

      const result = await loginAction(null, formData);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("calls signIn with normalized email for valid input", async () => {
      const { signIn } = await import("@/lib/auth");
      const formData = new FormData();
      formData.set("email", "  User@Example.COM  ");
      formData.set("password", "secure123");
      formData.set("callbackUrl", "/dashboard");

      const result = await loginAction(null, formData);
      expect(result.error).toBeUndefined();
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "user@example.com",
        password: "secure123",
        redirectTo: "/dashboard",
      });
    });
  });

  describe("registerAction", () => {
    it("informs caller that public registration is disabled", async () => {
      const result = await registerAction();
      expect(result.error).toContain("Public registration is disabled");
    });
  });

  describe("resetPasswordAction", () => {
    it("returns error when email or passwords are missing", async () => {
      const formData = new FormData();
      formData.set("email", "");
      formData.set("existingPassword", "");

      const result = await resetPasswordAction(null, formData);
      expect(result.error).toBe("Please enter your email address.");
    });

    it("returns error when new passwords do not match", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("existingPassword", "oldpass123");
      formData.set("newPassword", "newpass123");
      formData.set("confirmPassword", "mismatched123");

      const result = await resetPasswordAction(null, formData);
      expect(result.error).toBe("New passwords do not match. Please verify.");
    });

    it("returns error when account does not exist", async () => {
      const { prisma } = await import("@/lib/db/client");
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const formData = new FormData();
      formData.set("email", "nonexistent@example.com");
      formData.set("existingPassword", "oldpass123");
      formData.set("newPassword", "newpass123");
      formData.set("confirmPassword", "newpass123");

      const result = await resetPasswordAction(null, formData);
      expect(result.error).toBe("No account found with this email address.");
    });

    it("returns warning when existing password is wrong", async () => {
      const { prisma } = await import("@/lib/db/client");
      const realHash = await hashPassword("actualpassword123");
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        passwordHash: realHash,
      });

      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("existingPassword", "WRONGpassword");
      formData.set("newPassword", "newpassword456");
      formData.set("confirmPassword", "newpassword456");

      const result = await resetPasswordAction(null, formData);
      expect(result.error).toBe("Existing password is wrong. Please check your credentials.");
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("successfully resets password when email and existing password match", async () => {
      const { prisma } = await import("@/lib/db/client");
      const realHash = await hashPassword("correctoldpassword123");
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        passwordHash: realHash,
      });
      (prisma.user.update as any).mockResolvedValue({ id: "user-1" });

      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("existingPassword", "correctoldpassword123");
      formData.set("newPassword", "brandnewpassword456");
      formData.set("confirmPassword", "brandnewpassword456");

      const result = await resetPasswordAction(null, formData);
      expect(result.error).toBeUndefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Password reset successfully! Please sign in with your new password.");
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe("signOutAction", () => {
    it("calls NextAuth signOut with redirect to login", async () => {
      const { signOut } = await import("@/lib/auth");
      await signOutAction();
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
    });
  });
});
