import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import PublicSiteHeader from "@/components/public-site-header";
import { GradientButton } from "@/components/ui-refined/gradient-button";

export interface SeoPageSection {
  title: string;
  body: string;
}

export interface SeoPageConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta?: string;
  bullets: string[];
  sections: SeoPageSection[];
  comparisonTitle: string;
  comparisons: Array<{
    label: string;
    ours: string;
    other: string;
  }>;
  templateLinks: Array<{
    label: string;
    href: string;
  }>;
  faqs: SeoPageSection[];
}

const GITHUB_URL = "https://github.com/diwenne/openreply";

export default function SeoPageShell({ config }: { config: SeoPageConfig }) {
  const isAgencies =
    config.title.toLowerCase().includes("agencies") ||
    config.eyebrow.toLowerCase().includes("agencies");

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <PublicSiteHeader active={isAgencies ? "agencies" : undefined} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-18 sm:pb-24 border-b border-slate-100 bg-white">
        {/* Glow ambient background */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-[1155/678] w-[64rem] bg-gradient-to-tr from-orange-400/20 to-pink-500/15 opacity-70"
          />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-orange-800 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-orange-600" />
              <span>{config.eyebrow}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {config.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {config.description}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link href="/login" className="inline-flex shrink-0">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  <span>{config.primaryCta}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </GradientButton>
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
              >
                <span>{config.secondaryCta ?? "Browse templates"}</span>
              </Link>
            </div>
          </div>

          {/* Right Checklist Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-elevated space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Campaign OS Checklist
                </p>
              </div>
              <ul className="space-y-3.5">
                {config.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {config.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs hover:shadow-elevated hover:border-orange-200 transition-all space-y-3"
            >
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center sm:text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Direct Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {config.comparisonTitle}
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="p-4 sm:p-5">Need</div>
              <div className="p-4 sm:p-5 text-orange-600 font-extrabold">OpenReply</div>
              <div className="p-4 sm:p-5">Generic automation</div>
            </div>
            {config.comparisons.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-1 border-b border-slate-100 last:border-0 md:grid-cols-[0.8fr_1fr_1fr]"
              >
                <div className="bg-slate-50/50 p-4 sm:p-5 text-xs sm:text-sm font-bold text-slate-900">
                  {item.label}
                </div>
                <div className="bg-orange-50/40 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed font-semibold text-orange-950 border-y md:border-y-0 md:border-x border-orange-100/80">
                  {item.ours}
                </div>
                <div className="p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-slate-500">
                  {item.other}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Quick Links */}
      {config.templateLinks.length > 0 && (
        <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Start From A Template
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Launch faster with proven playbooks
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Use a pre-configured template, connect your Instagram account, select your reel or post, and ship in minutes.
            </p>
          </div>
          <div className="lg:col-span-7 grid gap-3 sm:grid-cols-2">
            {config.templateLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 text-sm font-bold text-slate-800 shadow-xs hover:shadow-md hover:border-orange-300 hover:text-orange-600 transition-all flex items-center justify-between group"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {config.faqs.length > 0 && (
        <section className="border-t border-slate-100 bg-white py-16">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <div className="lg:col-span-8 grid gap-4">
              {config.faqs.map((faq) => (
                <article
                  key={faq.title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs space-y-2"
                >
                  <h3 className="text-base font-bold text-slate-900">{faq.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{faq.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 p-8 sm:p-14 text-white shadow-glow text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Turn every high-intent comment into an instant reply
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-orange-50 leading-relaxed">
            OpenReply is built for Instagram professional accounts with official Meta API compliance and real-time deliverability.
          </p>
          <div className="pt-4 flex items-center justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-orange-600 text-sm font-bold shadow-lg hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap"
            >
              <span>Sign in to OpenReply</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

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
            <Link
              href="/instagram-dm-automation-agencies"
              className={isAgencies ? "text-orange-600 font-bold" : "hover:text-slate-900 transition-colors"}
            >
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
