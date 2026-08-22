import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import PublicSiteHeader from "@/components/public-site-header";
import TemplateVisual from "@/components/template-visual";
import { GradientButton } from "@/components/ui-refined/gradient-button";
import { CAMPAIGN_TEMPLATES } from "@/lib/templates/campaign-templates";

export const metadata: Metadata = {
  title: "Instagram Comment to DM Templates — OpenReply",
  description:
    "Copy ready-to-launch Instagram comment-to-DM campaign templates for product links, lead magnets, real estate, fitness, restaurants, events, and creators.",
  keywords: [
    "Instagram comment to DM templates",
    "comment to DM campaigns",
    "Instagram DM automation templates",
    "Manychat alternative templates",
  ],
};

const GITHUB_URL = "https://github.com/diwenne/openreply";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <PublicSiteHeader active="templates" />

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
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-orange-800 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-orange-600" />
              <span>Public Template Library</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Instagram campaigns you can{" "}
              <span className="text-gradient">copy in minutes</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Start with proven comment-to-DM playbooks for lead magnets,
              product links, events, service menus, and agency client campaigns.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link href="/login" className="inline-flex shrink-0">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </GradientButton>
              </Link>
              <a
                href="#template-grid"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
              >
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>Browse templates</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
            {CAMPAIGN_TEMPLATES.slice(0, 2).map((template) => (
              <TemplateVisual key={template.slug} template={template} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Template Grid Section */}
      <section
        id="template-grid"
        className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="mb-10 text-center sm:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Proven Playbooks
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready-to-launch campaign blueprints
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Choose a playbook below to see exact trigger keywords, DM copy, and setup instructions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CAMPAIGN_TEMPLATES.map((template) => (
            <article
              key={template.slug}
              className="flex min-h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-elevated hover:border-orange-200 transition-all group"
            >
              <div className="mb-4">
                <TemplateVisual template={template} compact />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-600">
                  {template.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {template.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 mt-auto">
                <Link
                  href={`/templates/${template.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                >
                  View playbook
                </Link>
                <Link
                  href={`/login?template=${template.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-semibold shadow-glow hover:brightness-105 transition-all"
                >
                  <span>Use template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
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
            <Link href="/templates" className="text-orange-600 font-bold">
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
