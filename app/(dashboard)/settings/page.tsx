"use client";

/**
 * Settings Page
 *
 * Instagram connection status, accounts management, team members, invitations,
 * and workspace security.
 */

import { Suspense, useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Users,
  Copy,
  Check,
  Trash2,
  Send,
  Zap,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
import type { AccountOption } from "@/components/account-select";
import { InstagramConnectNotice } from "@/components/instagram-connect-notice";
import SignOutButton from "@/components/sign-out-button";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { GradientButton } from "@/components/ui-refined/gradient-button";
import { Avatar } from "@/components/ui-refined/avatar";

interface SettingsData {
  workspace: {
    name: string;
    dmsSentThisPeriod: number;
  };
  instagramAccount: {
    id: string;
    username: string;
    instagramId: string;
    tokenExpiresAt: string | null;
    webhookSubscribed: boolean;
  } | null;
  instagramAccounts: Array<
    AccountOption & {
      tokenExpiresAt: string | null;
      webhookSubscribed: boolean;
    }
  >;
}

interface WorkspaceMembersData {
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER";
  members: Array<{
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: string;
    user: {
      id: string;
      email: string | null;
      name: string | null;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    inviteUrl: string;
    expiresAt: string;
  }>;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [membersData, setMembersData] = useState<WorkspaceMembersData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Create new user account state
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [createUserBusy, setCreateUserBusy] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateUserError(null);
    setCreateUserSuccess(null);

    const trimmedEmail = newUserEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setCreateUserError("Please enter a valid email address.");
      return;
    }
    if (newUserPassword.length < 6) {
      setCreateUserError("Password must be at least 6 characters long.");
      return;
    }

    setCreateUserBusy(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: trimmedEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setCreateUserError(resData.error ?? "Failed to create account.");
      } else {
        setCreateUserSuccess(resData.message ?? "Account created successfully!");
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        await refreshMembers();
      }
    } catch {
      setCreateUserError("Network error. Please try again.");
    } finally {
      setCreateUserBusy(false);
    }
  }

  // Password reset / change state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showChangeExisting, setShowChangeExisting] = useState(false);
  const [showChangeNew, setShowChangeNew] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!existingPassword) {
      setPasswordError("Please enter your existing password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please verify.");
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setPasswordError(resData.error ?? "Failed to update password.");
      } else {
        setPasswordSuccess(resData.message ?? "Password updated successfully!");
        setExistingPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordBusy(false);
    }
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((res) => res.json()),
      fetch("/api/workspace/members").then((res) => res.json()),
    ])
      .then(([statsPayload, membersPayload]) => {
        if (statsPayload.success) setData(statsPayload.data);
        if (membersPayload.success) setMembersData(membersPayload.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refreshMembers() {
    const res = await fetch("/api/workspace/members");
    const payload = await res.json();
    if (payload.success) setMembersData(payload.data);
  }

  async function disconnectInstagram(instagramAccountId: string) {
    if (
      !confirm(
        "Disconnect Instagram account? Automations for this profile will be paused."
      )
    ) {
      return;
    }

    setBusy(`disconnect:${instagramAccountId}`);
    await fetch("/api/instagram/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramAccountId }),
    });
    window.location.reload();
  }

  async function inviteMember(event: React.FormEvent) {
    event.preventDefault();
    setMemberError(null);
    setBusy("invite");
    const res = await fetch("/api/workspace/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const payload = await res.json();
    if (payload.success) {
      setMembersData(payload.data);
      setInviteEmail("");
    } else {
      setMemberError(payload.error ?? "Could not send invite");
    }
    setBusy(null);
  }

  async function removeInvitation(invitationId: string) {
    setBusy(`invite:${invitationId}`);
    await fetch("/api/workspace/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });
    await refreshMembers();
    setBusy(null);
  }

  async function copyInvite(id: string, url: string) {
    await navigator.clipboard?.writeText(url);
    setCopiedInviteId(id);
    window.setTimeout(() => setCopiedInviteId((c) => (c === id ? null : c)), 2000);
  }

  if (loading && !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const accounts = data?.instagramAccounts ?? [];
  const canManageMembers =
    membersData?.currentUserRole === "OWNER" ||
    membersData?.currentUserRole === "ADMIN";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Search param notice for Instagram OAuth */}
      <Suspense fallback={null}>
        <InstagramConnectNotice />
      </Suspense>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your Instagram connection, workspace members, and account security
        </p>
      </div>

      {/* 1. Instagram Connection Card */}
      <AnimatedCard className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center text-white shadow-xs">
              <InstagramIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Instagram connection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-replies and message delivery depend on this official connection
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              accounts.length > 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                accounts.length > 0
                  ? "bg-emerald-500 animate-pulse-dot"
                  : "bg-amber-500"
              }`}
            />
            <span>{accounts.length > 0 ? "Connected" : "Not connected"}</span>
          </span>
        </div>

        {/* Connected Accounts List */}
        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 space-y-3">
              <p className="text-sm font-medium">No Instagram accounts connected yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Connect your Instagram professional or creator account to begin launching comment-to-DM automations.
              </p>
              <a
                href="/api/instagram/connect"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-semibold shadow-glow hover:brightness-105 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Connect Instagram account</span>
              </a>
            </div>
          ) : (
            accounts.map((account) => {
              const expiresDate = account.tokenExpiresAt
                ? new Date(account.tokenExpiresAt)
                : null;
              const daysLeft = expiresDate
                ? Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 3600 * 24))
                : 60;
              const isExpiringSoon = daysLeft < 7;

              return (
                <div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/70"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar name={account.username} size="lg" status="online" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          @{account.username}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                          Professional account
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Real-time sync active</span>
                        </span>
                        <span>·</span>
                        <span
                          className={
                            isExpiringSoon
                              ? "text-amber-600 font-medium"
                              : "text-slate-400"
                          }
                        >
                          {expiresDate
                            ? `Reconnect by ${expiresDate.toLocaleDateString()}`
                            : "Session active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => disconnectInstagram(account.id)}
                    disabled={busy === `disconnect:${account.id}`}
                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-auto disabled:opacity-50"
                  >
                    {busy === `disconnect:${account.id}`
                      ? "Disconnecting..."
                      : "Disconnect account"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {accounts.length > 0 && (
          <div className="pt-2">
            <a
              href="/api/instagram/connect"
              className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ Connect another account</span>
            </a>
          </div>
        )}
      </AnimatedCard>

      {/* 2. Team Members & User Management Card */}
      <AnimatedCard className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Team &amp; User Accounts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage accounts and provision new users with system access
              </p>
            </div>
          </div>

          {canManageMembers && (
            <button
              type="button"
              onClick={() => {
                setCreateAccountOpen(!createAccountOpen);
                setCreateUserError(null);
                setCreateUserSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200/80 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="h-4 w-4" />
              <span>{createAccountOpen ? "Close panel" : "Create new account"}</span>
            </button>
          )}
        </div>

        {/* Create New Account Form */}
        {createAccountOpen && (
          <form
            onSubmit={handleCreateUser}
            className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/40 via-white to-slate-50 border border-orange-200/70 space-y-4 animate-in fade-in duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-orange-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Provision New User Account
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                User can immediately log in with these credentials
              </p>
            </div>

            {createUserSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{createUserSuccess}</span>
              </div>
            )}
            {createUserError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{createUserError}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showNewUserPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Workspace Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "ADMIN" | "MEMBER")}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:border-orange-400 outline-none transition-all cursor-pointer"
                >
                  <option value="MEMBER">Member (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <GradientButton
                type="submit"
                size="sm"
                loading={createUserBusy}
                className="px-6 text-xs font-bold"
              >
                <span>Create Account</span>
                <UserPlus className="h-3.5 w-3.5 shrink-0" />
              </GradientButton>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="divide-y divide-slate-100">
          {membersData?.members.map((member) => {
            const roleBadgeStyle = {
              OWNER: "bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold shadow-xs",
              ADMIN: "bg-violet-100 text-violet-700 font-semibold",
              MEMBER: "bg-slate-100 text-slate-600 font-medium",
            }[member.role] ?? "bg-slate-100 text-slate-600";

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.user.name ?? member.user.email ?? "User"} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {member.user.name ?? member.user.email?.split("@")[0] ?? "Member"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{member.user.email}</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${roleBadgeStyle}`}
                >
                  {member.role.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pending Invites */}
        {membersData?.invitations && membersData.invitations.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending invites
            </p>
            <div className="space-y-2">
              {membersData.invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {invite.email}
                    </p>
                    <p className="text-xs text-slate-400">
                      Role: {invite.role.toLowerCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void copyInvite(invite.id, invite.inviteUrl)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {copiedInviteId === invite.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-400" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeInvitation(invite.id)}
                      disabled={busy === `invite:${invite.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Revoke invitation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Invite Form */}
        {canManageMembers && (
          <form
            onSubmit={inviteMember}
            className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
            <select
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as "ADMIN" | "MEMBER")
              }
              className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:border-orange-400 outline-none transition-all cursor-pointer"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <GradientButton
              type="submit"
              size="md"
              loading={busy === "invite"}
              icon={Send}
            >
              Send invite
            </GradientButton>
          </form>
        )}
        {memberError && (
          <p className="text-xs text-rose-600">{memberError}</p>
        )}
      </AnimatedCard>

      {/* 3. Account & Security Card */}
      <AnimatedCard className="p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Account &amp; security
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current workspace session and authentication
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Current session
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Workspace role:{" "}
              <span className="font-semibold text-slate-800">
                {membersData?.currentUserRole ?? "MEMBER"}
              </span>
            </p>
          </div>

          <SignOutButton
            variant="danger"
            className="px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-xs"
          >
            Sign out
          </SignOutButton>
        </div>

        {/* Change Password Section */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Change password</p>
                <p className="text-xs text-slate-400">
                  Verify your existing password to set a new password
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChangePasswordOpen(!changePasswordOpen);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              {changePasswordOpen ? "Cancel" : "Update password"}
            </button>
          </div>

          {changePasswordOpen && (
            <form
              onSubmit={handlePasswordChange}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200"
            >
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Existing password
                </label>
                <div className="relative">
                  <input
                    type={showChangeExisting ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={existingPassword}
                    onChange={(e) => setExistingPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangeExisting(!showChangeExisting)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showChangeExisting ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showChangeNew ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangeNew(!showChangeNew)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showChangeNew ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showChangeConfirm ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangeConfirm(!showChangeConfirm)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showChangeConfirm ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <GradientButton
                  type="submit"
                  size="sm"
                  loading={passwordBusy}
                  className="px-5 text-xs font-semibold"
                >
                  Verify &amp; Update Password
                </GradientButton>
              </div>
            </form>
          )}
        </div>
      </AnimatedCard>

      {/* 4. Usage Card */}
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-slate-900">
              Monthly activity
            </h2>
            <p className="text-xs text-slate-400">
              Self-hosted — 100% free with no monthly plan limits.
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {(data?.workspace.dmsSentThisPeriod ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Messages sent this month</p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
