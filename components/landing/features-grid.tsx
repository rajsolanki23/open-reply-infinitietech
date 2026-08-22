import {
  ShieldCheck,
  Zap,
  Heart,
  TrendingUp,
  Lock,
  Infinity as InfinityIcon,
} from "lucide-react";
import { AnimatedCard } from "@/components/ui-refined/animated-card";

const featureList = [
  {
    title: "Official Meta API",
    description:
      "Built strictly on Meta's official APIs to ensure compliance, account safety, and high inbox delivery rates.",
    icon: ShieldCheck,
  },
  {
    title: "Keyword Comment Triggers",
    description:
      "Trigger automations on exact keywords, partial matches, or reply to all comments on a post automatically.",
    icon: Zap,
  },
  {
    title: "Follow-to-Unlock Gate",
    description:
      "Grow your audience by asking viewers to follow your Instagram account before delivering exclusive resources.",
    icon: Heart,
  },
  {
    title: "Tracked Links & Analytics",
    description:
      "Generate shortened, tracked links for every campaign with real-time click counts and conversion tracking.",
    icon: TrendingUp,
  },
  {
    title: "Encrypted Security at Rest",
    description:
      "Tokens and credentials are encrypted using AES-256 at rest, with isolated multi-account workspaces.",
    icon: Lock,
  },
  {
    title: "Unlimited & Free Forever",
    description:
      "Self-hosted architecture with BullMQ queues and PostgreSQL. No per-DM charges or subscription paywalls.",
    icon: InfinityIcon,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Complete Feature Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for creators, influencers, and brands
          </h2>
          <p className="text-base text-slate-500">
            Everything you need to turn social audience engagement into measurable newsletter subscribers, leads, and sales.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {featureList.map((f) => {
            const Icon = f.icon;
            return (
              <AnimatedCard key={f.title} className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.description}
                </p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
