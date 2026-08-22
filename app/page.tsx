import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import dynamic from "next/dynamic";
import PublicSiteHeader from "@/components/public-site-header";
import { GradientButton } from "@/components/ui-refined/gradient-button";

const HowItWorks = dynamic(() => import("@/components/landing/how-it-works"), {
  loading: () => <div className="h-96 w-full bg-white animate-pulse" />,
});

const FeaturesGrid = dynamic(() => import("@/components/landing/features-grid"), {
  loading: () => <div className="h-96 w-full bg-[#fafafa] animate-pulse" />,
});

const FinalCTA = dynamic(() => import("@/components/landing/final-cta"), {
  loading: () => <div className="h-72 w-full bg-white animate-pulse" />,
});

export const metadata: Metadata = {
  title: "OpenReply — Open Source Instagram Comment-to-DM Automation",
  description:
    "Free, self-hosted ManyChat alternative. Turn Instagram comments into automated DM replies, deliver resources, and grow followers using the official Meta API.",
};

const GITHUB_URL = "https://github.com/diwenne/openreply";

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/diwenne/openreply", {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

const heroStats = [
  { value: "24/7", label: "Comment monitoring" },
  { value: "< 1s", label: "Instant DM delivery" },
  { value: "100%", label: "Free & open source" },
];

function MockAppWindow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-elevated transition-all">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export default async function Home() {
  const stars = await getGitHubStars();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <PublicSiteHeader active="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient circle */}
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-[1155/678] w-[68rem] bg-gradient-to-tr from-orange-400/25 to-pink-500/20 opacity-70"
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-orange-800 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                <span>Open source · Official Instagram Meta API</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                Turn every comment into an{" "}
                <span className="text-gradient">instant DM reply</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                The open-source ManyChat alternative. Automatically send links,
                deliver lead magnets, and grow followers the moment someone comments
                on your Instagram posts or reels.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/login" className="inline-flex shrink-0">
                  <GradientButton size="lg">
                    <span>Sign in to OpenReply</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </GradientButton>
                </Link>

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>Star on GitHub</span>
                  {stars !== null && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
                      {formatStars(stars)}
                    </span>
                  )}
                </a>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto lg:mx-0">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-center shadow-xs backdrop-blur-xs"
                  >
                    <p className="text-xl sm:text-2xl font-black text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Interactive Mockup */}
            <div className="lg:col-span-5 relative">
              <MockAppWindow label="openreply / live preview">
                <div className="space-y-4">
                  {/* Top Notification Badge */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        OR
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Automated Reply Sent
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Triggered by comment &ldquo;GUIDE&rdquo;
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Delivered ✓
                    </span>
                  </div>

                  {/* Simulated Instagram DM Bubble */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
                        @
                      </div>
                      <p className="text-xs font-semibold text-slate-900">@yourcreator</p>
                    </div>

                    <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-orange-500 to-orange-400 text-white p-3.5 text-xs shadow-sm space-y-2">
                      <p>
                        Hey! Thanks for commenting. Here is your free creator guide:
                      </p>
                      <div className="rounded-xl bg-white/20 p-2 flex items-center justify-between text-white font-medium text-xs">
                        <span>📥 Download Creator Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                      <p className="text-xs text-slate-400">Click rate</p>
                      <p className="text-base font-bold text-emerald-600">38.4%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                      <p className="text-xs text-slate-400">Avg. delivery</p>
                      <p className="text-base font-bold text-slate-900">0.8s</p>
                    </div>
                  </div>
                </div>
              </MockAppWindow>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <HowItWorks />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Call to Action Banner */}
      <FinalCTA />

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 max-w-7xl px-5 sm:px-6 lg:px-8 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-xs">
              <MessageSquare className="h-4 w-4 fill-white/20" />
            </div>
            <span className="font-bold text-slate-900">OpenReply</span>
            <span className="text-xs text-slate-400">
              — Open Source Instagram Automation
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/templates" className="hover:text-slate-900 transition-colors">
              Templates
            </Link>
            <Link href="/instagram-dm-automation-agencies" className="hover:text-slate-900 transition-colors">
              Agencies
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
