"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/ui-refined/app-sidebar";
import { TopHeader } from "@/components/ui-refined/top-header";

interface DashboardShellProps {
  children: React.ReactNode;
  workspaceName: string;
  instagramUsername: string | null;
  instagramAccountCount: number;
}

export default function DashboardShell({
  children,
  workspaceName,
  instagramUsername,
  instagramAccountCount,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-white text-slate-900">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        workspaceName={workspaceName}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/40">
        <TopHeader
          onMenuClick={() => setSidebarOpen(true)}
          instagramUsername={instagramUsername}
          instagramAccountCount={instagramAccountCount}
        />

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain focus:outline-none"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
