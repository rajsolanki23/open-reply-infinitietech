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

import { loginAction, registerAction, signOutAction } from "../app/login/actions";

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
    it("returns error when required fields are missing", async () => {
      const formData = new FormData();
      formData.set("email", "");
      formData.set("password", "");

      const result = await registerAction(null, formData);
      expect(result.error).toBe("Please enter both email and password.");
    });

    it("returns error when email format is invalid", async () => {
      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("password", "pass123");
      formData.set("confirmPassword", "pass123");

      const result = await registerAction(null, formData);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("returns error when password is under 6 characters", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "12345");
      formData.set("confirmPassword", "12345");

      const result = await registerAction(null, formData);
      expect(result.error).toBe("Password must be at least 6 characters long.");
    });

    it("returns error when passwords do not match", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "secret123");
      formData.set("confirmPassword", "different123");

      const result = await registerAction(null, formData);
      expect(result.error).toBe("Passwords do not match. Please verify.");
    });

    it("creates user, provisions workspace, and signs in on successful registration", async () => {
      const { prisma } = await import("@/lib/db/client");
      const { signIn } = await import("@/lib/auth");
      const { ensureWorkspaceForUser } = await import("@/lib/workspace");

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: "user-123",
        email: "newuser@example.com",
        name: "New User",
      });

      const formData = new FormData();
      formData.set("email", "newuser@example.com");
      formData.set("password", "securepassword123");
      formData.set("confirmPassword", "securepassword123");
      formData.set("name", "New User");
      formData.set("callbackUrl", "/campaigns");

      const result = await registerAction(null, formData);
      expect(result.error).toBeUndefined();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(ensureWorkspaceForUser).toHaveBeenCalledWith("user-123", "newuser@example.com");
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "newuser@example.com",
        password: "securepassword123",
        redirectTo: "/campaigns",
      });
    });

    it("informs user when account with email already exists", async () => {
      const { prisma } = await import("@/lib/db/client");
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-existing",
        passwordHash: "$2a$10$hashedpassword...",
      });

      const formData = new FormData();
      formData.set("email", "existing@example.com");
      formData.set("password", "secret123");
      formData.set("confirmPassword", "secret123");

      const result = await registerAction(null, formData);
      expect(result.error).toBe(
        "An account with this email already exists. Please sign in instead."
      );
      expect(result.isExistingAccount).toBe(true);
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
