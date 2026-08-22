'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  MessageCircle,
  Zap,
  Activity,
  Settings,
  HeartPulse,
  X,
  LogOut,
} from 'lucide-react';
import SignOutButton from '@/components/sign-out-button';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Insights', href: '/overview', icon: BarChart3 },
  { label: 'Messages', href: '/inbox', icon: MessageCircle },
  { label: 'Automations', href: '/campaigns', icon: Zap },
  { label: 'Activity', href: '/logs', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'System Status', href: '/diagnostics', icon: HeartPulse },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  userName?: string | null;
  userEmail?: string | null;
}

export const AppSidebar = memo(function AppSidebar({
  isOpen,
  onClose,
  workspaceName,
  userName,
  userEmail,
}: AppSidebarProps) {
  const pathname = usePathname();

  const displayName = userName || userEmail?.split('@')[0] || 'Creator';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full lg:shadow-none'}
        `}
      >
        {/* Top Header / Brand */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-glow text-white font-bold text-base">
              O
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                OpenReply
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Instagram Automation
              </span>
            </div>
          </Link>
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
              (item.href === '/campaigns' && pathname.startsWith('/automations'));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'border-l-3 border-orange-500 bg-orange-50/60 text-orange-700 rounded-r-xl'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl'
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Workspace card */}
          <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {workspaceName}
              </p>
              <p className="text-[10px] text-slate-400">Workspace</p>
            </div>
            <span className="rounded-full bg-white border border-slate-200/60 text-slate-500 text-[10px] font-medium px-2 py-0.5 shrink-0">
              Self-hosted
            </span>
          </div>

          {/* User row */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate max-w-[110px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {userEmail ?? 'online'}
                </p>
              </div>
            </div>

            <SignOutButton
              variant="ghost"
              showIcon={false}
              className="text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
});
export default AppSidebar;
