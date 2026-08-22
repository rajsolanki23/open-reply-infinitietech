import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Target, Users, MessageSquare } from "lucide-react";
import PublicSiteHeader from "@/components/public-site-header";
import TemplateVisual from "@/components/template-visual";
import { GradientButton } from "@/components/ui-refined/gradient-button";
import {
  CAMPAIGN_TEMPLATES,
  getCampaignTemplate,
  getCampaignTemplateSlugs,
} from "@/lib/templates/campaign-templates";

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
};

const GITHUB_URL = "https://github.com/diwenne/openreply";

export function generateStaticParams() {
  return getCampaignTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getCampaignTemplate(slug);

  if (!template) {
    return {
      title: "Template Not Found — OpenReply",
    };
  }

  return {
    title: `${template.title} — Instagram Comment to DM Template | OpenReply`,
    description: template.summary,
    keywords: [
      `${template.title} template`,
      "Instagram comment to DM template",
      "Instagram DM campaign template",
      template.category,
      template.audience,
    ],
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getCampaignTemplate(slug);

  if (!template) {
    notFound();
  }

  const relatedTemplates = CAMPAIGN_TEMPLATES.filter(
    (item) => item.slug !== template.slug
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <PublicSiteHeader active="templates" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 border-b border-slate-100 bg-white">
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

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all templates</span>
          </Link>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                {template.category} Playbook
              </span>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                {template.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {template.summary}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link href={`/login?template=${template.slug}`} className="inline-flex shrink-0">
                  <GradientButton size="lg" className="w-full sm:w-auto">
                    <span>Use this template</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </GradientButton>
                </Link>
                <a
                  href="#playbook"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                >
                  <span>Read playbook</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <TemplateVisual template={template} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Playbook & Specs Section */}
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Sidebar Specs */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Users className="h-4 w-4 text-orange-500" />
              <span>Target Audience</span>
            </div>
            <p className="text-base font-bold text-slate-900">{template.audience}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Estimated Setup Time</span>
            </div>
            <p className="text-base font-bold text-slate-900">{template.setupMinutes} minutes</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Target className="h-4 w-4 text-orange-500" />
              <span>Campaign Goal</span>
            </div>
            <p className="text-base font-bold text-slate-900">{template.goal}</p>
          </div>
        </aside>

        {/* Right Playbook Content */}
        <div id="playbook" className="lg:col-span-8 space-y-6">
          {/* Outcome */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Campaign Outcome</h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {template.outcome}
            </p>
          </section>

          {/* Step-by-Step Playbook */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Setup Playbook</h2>
            <ol className="space-y-4">
              {template.playbook.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-bold text-white shadow-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700 font-medium pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Best For & Metrics */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900">Best For</h3>
              <ul className="space-y-2">
                {template.bestFor.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900">Key Metrics</h3>
              <ul className="space-y-2">
                {template.metrics.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Launch CTA Banner */}
          <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 p-8 sm:p-10 text-white shadow-glow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-extrabold tracking-tight">
                  Launch this campaign now
                </h3>
                <p className="text-xs sm:text-sm text-orange-50 leading-relaxed">
                  Sign in, connect Instagram, pick your post or reel, and the template copy will be pre-filled automatically.
                </p>
              </div>
              <Link
                href={`/login?template=${template.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-orange-600 text-xs sm:text-sm font-bold shadow-lg hover:bg-orange-50 transition-colors shrink-0 whitespace-nowrap"
              >
                <span>Use this template</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </section>
        </div>
      </section>

      {/* More Templates */}
      {relatedTemplates.length > 0 && (
        <section className="border-t border-slate-100 bg-white py-16">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              More campaign templates
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedTemplates.map((item) => (
                <Link
                  key={item.slug}
                  href={`/templates/${item.slug}`}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-elevated hover:border-orange-200 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-orange-600">
                    <span>View playbook</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
