"use client";

/**
 * Top Bar
 *
 * Page title, mobile hamburger, connection status, and quick sign out.
 */

import { usePathname } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/overview": "Overview",
  "/inbox": "Inbox",
  "/campaigns": "Campaigns",
  "/campaigns/new": "New Campaign",
  "/automations": "Campaigns",
  "/automations/new": "New Campaign",
  "/logs": "DM Logs",
  "/settings": "Settings",
  "/diagnostics": "Diagnostics",
};

interface TopBarProps {
  onMenuClick: () => void;
  instagramUsername: string | null;
  instagramAccountCount: number;
}

export default function TopBar({
  onMenuClick,
  instagramUsername,
  instagramAccountCount,
}: TopBarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-8 border-b border-border bg-background"
      // Installed to the home screen the app starts at the very top of the
      // display, so without this the title sits under the clock and battery.
      // The inset is 0 in a browser tab and on desktop.
      style={{
        height: "calc(4rem + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden shrink-0 px-2.5 py-1.5 rounded border border-border text-sm text-muted hover:text-foreground cursor-pointer"
          aria-label="Toggle sidebar"
        >
          Menu
        </button>
        <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {instagramAccountCount > 0 ? (
          <p className="shrink-0 truncate text-xs sm:text-sm text-muted">
            {instagramAccountCount > 1
              ? `${instagramAccountCount} accounts`
              : `@${instagramUsername}`}
          </p>
        ) : (
          <a
            href="/api/instagram/connect"
            className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            {/* Full label needs more room than a 360px header has to spare. */}
            <span className="sm:hidden">Connect</span>
            <span className="hidden sm:inline">Connect Instagram</span>
          </a>
        )}

        <div className="h-4 w-px bg-border hidden sm:block" />

        <SignOutButton
          variant="ghost"
          showIcon={true}
          className="text-xs text-muted hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5"
        >
          <span className="hidden md:inline">Sign Out</span>
        </SignOutButton>
      </div>
    </header>
  );
}
