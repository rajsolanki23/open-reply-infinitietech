import AuthForm from "./auth-form";
import { getCampaignTemplate } from "@/lib/templates/campaign-templates";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Sign In · OpenReply",
  description: "Sign in to manage your Instagram comment-to-DM automations and campaigns.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    template?: string;
    mode?: "signin" | "reset";
  }>;
}) {
  const params = await searchParams;
  const selectedTemplate = getCampaignTemplate(params.template);
  const templateCallbackUrl = selectedTemplate
    ? `/campaigns/new?template=${selectedTemplate.slug}`
    : null;
  const callbackUrl = params.callbackUrl ?? templateCallbackUrl ?? "/dashboard";
  const initialMode = params.mode === "reset" ? "reset" : "signin";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-orange-100 selection:text-orange-900">
      {/* Left panel: Gradient Brand Showcase (Desktop only or compact header on mobile) */}
      <div className="lg:col-span-5 xl:col-span-5 bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden text-white">
        {/* Floating background decorative shapes */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none animate-float" />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-orange-600/30 blur-3xl pointer-events-none animate-float"
          style={{ animationDelay: "-2s" }}
        />

        {/* Top brand logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl border border-white/30 shadow-lg">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              OpenReply
            </span>
          </Link>
        </div>

        {/* Middle copy */}
        <div className="relative z-10 my-10 lg:my-0 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/20 text-orange-50">
            <span>✨</span> Free &amp; Open Source Instagram Automation
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Automate your Instagram messages
          </h2>

          <p className="text-orange-50/90 text-base sm:text-lg leading-relaxed font-normal">
            When someone comments your keyword on a reel or post, send them an instant reply automatically.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-white shrink-0 fill-white/20" />
              <span className="text-sm font-medium text-white/95">
                Reply to comments instantly 24/7
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-white shrink-0 fill-white/20" />
              <span className="text-sm font-medium text-white/95">
                Grow your audience &amp; clicks on autopilot
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-white shrink-0 fill-white/20" />
              <span className="text-sm font-medium text-white/95">
                100% self-hosted with official Meta API
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright / note */}
        <div className="relative z-10 text-xs text-orange-100/70 pt-6">
          Official Instagram Integration · No password sharing
        </div>
      </div>

      {/* Right panel: Authentication Card */}
      <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50/50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-elevated border border-slate-100/80">
            {selectedTemplate && (
              <div className="mb-6 border border-orange-200 bg-orange-50/70 p-4 rounded-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                  Template selected
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedTemplate.title}
                </p>
              </div>
            )}

            <AuthForm callbackUrl={callbackUrl} initialMode={initialMode} />

            <div className="mt-8 text-center text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-5">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
