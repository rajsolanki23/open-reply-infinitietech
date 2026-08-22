import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock workspace access
vi.mock("@/lib/workspace-access", () => ({
  getCurrentWorkspaceContext: vi.fn(),
  canManageWorkspace: vi.fn((role: string) => role === "ADMIN" || role === "OWNER"),
}));

// Mock DB
vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    workspaceMember: {
      create: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/admin/users/create/route";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { prisma } from "@/lib/db/client";

describe("Admin User Creation API (/api/admin/users/create)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("returns 403 when user is not an admin or owner", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "user-1",
      workspaceId: "ws-1",
      role: "MEMBER",
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Forbidden");
  });

  it("validates missing email and password", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "",
        password: "",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Email and password are required.");
  });

  it("validates invalid email format", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email-format",
        password: "password123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Please enter a valid email address.");
  });

  it("validates short password (< 6 characters)", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "newmember@company.com",
        password: "12345",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password must be at least 6 characters long.");
  });

  it("rejects creation if user is already in the workspace (409)", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user-1",
      email: "existing@company.com",
      workspaceMembers: [{ id: "mem-1", workspaceId: "ws-1" }],
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@company.com",
        password: "securepass123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already a member of this workspace");
  });

  it("adds existing user to workspace without overwriting their password", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "existing-user-1",
      email: "victim@target.com",
      name: "Victim",
      passwordHash: "original_secure_hash",
      workspaceMembers: [], // not in ws-1
    });
    (prisma.workspaceMember.create as any).mockResolvedValue({
      id: "mem-2",
      role: "MEMBER",
      user: {
        id: "existing-user-1",
        email: "victim@target.com",
        name: "Victim",
      },
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "victim@target.com",
        password: "attackerPassword123",
        role: "MEMBER",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // CRITICAL: Verify prisma.user.update is NEVER called on existing user!
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "ws-1",
        userId: "existing-user-1",
        role: "MEMBER",
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  });

  it("successfully creates new user and workspace membership", async () => {
    (getCurrentWorkspaceContext as any).mockResolvedValue({
      userId: "admin-1",
      workspaceId: "ws-1",
      role: "ADMIN",
    });
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: "new-user-1",
      email: "alex@company.com",
      name: "Alex",
      workspaceMembers: [{ role: "MEMBER" }],
    });

    const req = new Request("http://localhost:3000/api/admin/users/create", {
      method: "POST",
      body: JSON.stringify({
        email: "alex@company.com",
        password: "securePassword123",
        name: "Alex",
        role: "MEMBER",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("alex@company.com");
    expect(data.user.role).toBe("MEMBER");
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
