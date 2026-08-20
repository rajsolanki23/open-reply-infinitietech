"use client";

/**
 * Sidebar Navigation
 *
 * Text-only nav with active state, workspace section, and sign out action.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", href: "/overview" },
  { label: "Inbox", href: "/inbox" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "DM Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
  { label: "Diagnostics", href: "/diagnostics" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  workspaceName,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 max-w-[85vw] shrink-0 bg-surface border-r border-border flex flex-col
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header / Brand */}
        <div
          className="px-6 py-5 border-b border-border flex items-center justify-between"
          style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}
        >
          <Link href="/dashboard" className="text-base font-semibold">
            OpenReply
          </Link>
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden text-xs text-muted hover:text-foreground p-1 rounded"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`
                  block px-3 py-2.5 rounded text-sm transition-colors
                  ${
                    isActive
                      ? "bg-surface-hover text-foreground font-medium"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Workspace info and Sign Out */}
        <div className="px-4 py-3.5 border-t border-border flex items-center justify-between gap-2 bg-surface/50">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{workspaceName}</p>
            <p className="text-xs text-muted">Self-hosted</p>
          </div>
          <SignOutButton
            variant="ghost"
            showIcon={true}
            className="text-xs text-muted hover:text-red-400 hover:bg-red-500/10 px-2 py-1.5 shrink-0"
          >
            <span className="text-xs">Sign out</span>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
