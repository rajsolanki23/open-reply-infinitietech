'use client';

import React, { memo } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';
import Link from 'next/link';

function InstagramIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const pageTitles: Record<string, { title: string; breadcrumb?: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/overview': { title: 'Insights' },
  '/insights': { title: 'Insights' },
  '/inbox': { title: 'Messages' },
  '/messages': { title: 'Messages' },
  '/campaigns': { title: 'Automations' },
  '/campaigns/new': { title: 'Create automation', breadcrumb: 'Automations' },
  '/automations': { title: 'Automations' },
  '/automations/new': { title: 'Create automation', breadcrumb: 'Automations' },
  '/logs': { title: 'Activity' },
  '/activity': { title: 'Activity' },
  '/settings': { title: 'Settings' },
  '/diagnostics': { title: 'System Status' },
  '/system-status': { title: 'System Status' },
};

function getPageInfo(pathname: string): { title: string; breadcrumb?: string } {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Handle dynamic /campaigns/... and /automations/... routes
  if (pathname.startsWith('/campaigns') || pathname.startsWith('/automations')) {
    if (pathname.endsWith('/new')) {
      return { title: 'Create automation', breadcrumb: 'Automations' };
    }
    if (pathname.endsWith('/edit')) {
      return { title: 'Edit automation', breadcrumb: 'Automations' };
    }
    if (pathname.endsWith('/import')) {
      return { title: 'Import automations', breadcrumb: 'Automations' };
    }
    return { title: 'Automation details', breadcrumb: 'Automations' };
  }

  if (pathname.startsWith('/inbox') || pathname.startsWith('/messages')) {
    return { title: 'Messages' };
  }

  if (pathname.startsWith('/overview') || pathname.startsWith('/insights')) {
    return { title: 'Insights' };
  }

  if (pathname.startsWith('/logs') || pathname.startsWith('/activity')) {
    return { title: 'Activity' };
  }

  if (pathname.startsWith('/settings')) {
    return { title: 'Settings' };
  }

  if (pathname.startsWith('/diagnostics') || pathname.startsWith('/system-status')) {
    return { title: 'System Status' };
  }

  // Safe fallback for other paths: sanitize IDs
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments.pop() ?? 'Dashboard';

  // If last segment looks like an ID (cuid/uuid/hex/long hash), fallback to parent or generic title
  if (/^[a-z0-9]{16,}$/i.test(lastSegment) || /^c[a-z0-9]{20,}$/i.test(lastSegment)) {
    const parentSegment = segments.pop();
    if (parentSegment) {
      return {
        title: `${parentSegment.replace(/-/g, ' ')} details`,
        breadcrumb: parentSegment.replace(/-/g, ' '),
      };
    }
    return { title: 'Dashboard' };
  }

  return {
    title: lastSegment.replace(/-/g, ' '),
  };
}

interface TopHeaderProps {
  onMenuClick: () => void;
  instagramUsername: string | null;
  instagramAccountCount: number;
}

export const TopHeader = memo(function TopHeader({
  onMenuClick,
  instagramUsername,
  instagramAccountCount,
}: TopHeaderProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  const isCreatePage = pathname.includes('/new');

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md"
      style={{
        height: 'calc(4rem + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Left side: Mobile trigger + Title & Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {pageInfo.breadcrumb && (
            <>
              <Link
                href="/campaigns"
                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors truncate"
              >
                {pageInfo.breadcrumb}
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate capitalize">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side: Instagram status + quick actions */}
      <div className="flex items-center gap-3 shrink-0">
        {instagramAccountCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-100/70 transition-colors">
            <div className="relative flex items-center justify-center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs">
                <InstagramIcon className="h-3 w-3 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <span className="truncate max-w-[130px] sm:max-w-[180px] font-medium text-slate-800">
              {instagramAccountCount > 1
                ? `${instagramAccountCount} accounts connected`
                : `@${instagramUsername}`}
            </span>
          </div>
        ) : (
          <a
            href="/api/instagram/connect"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-medium shadow-glow hover:brightness-105 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Connect Instagram</span>
          </a>
        )}

        {!isCreatePage && pathname !== '/campaigns/new' && (
          <Link
            href="/campaigns/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-medium shadow-glow hover:brightness-105 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New automation</span>
          </Link>
        )}
      </div>
    </header>
  );
});
export default TopHeader;
