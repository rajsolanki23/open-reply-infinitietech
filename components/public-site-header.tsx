"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { GradientButton } from "@/components/ui-refined/gradient-button";

interface PublicSiteHeaderProps {
  active?: "home" | "features" | "templates" | "agencies";
}

const navLinks = [
  { label: "Features", href: "/#features", key: "features" },
  { label: "Templates", href: "/templates", key: "templates" },
  { label: "Agencies", href: "/instagram-dm-automation-agencies", key: "agencies" },
];

export default function PublicSiteHeader({ active }: PublicSiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="OpenReply home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-glow group-hover:scale-105 transition-transform">
            <MessageSquare className="h-5 w-5 fill-white/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            OpenReply
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                active === link.key
                  ? "text-orange-600 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="inline-flex shrink-0">
            <GradientButton size="sm">
              <span>Sign in</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </GradientButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
