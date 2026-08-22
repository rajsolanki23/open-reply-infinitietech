import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Connect Instagram",
    description:
      "Log in and connect your Instagram professional or creator profile with official OAuth. No password sharing or fragile scraping.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Set keywords & reply",
    description:
      "Pick any post or reel, set target trigger keywords, customize opening greetings, and attach your tracked resource links.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Automate & grow",
    description:
      "Real-time webhooks catch comments instantly and deliver private DMs. Track views, clicks, and follower conversions live.",
    icon: TrendingUp,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Simple 3-Step Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            A comment comes in, your DM goes out
          </h2>
          <p className="text-base text-slate-500">
            Connect your account once, set up your trigger keywords, and let OpenReply
            handle the conversation on autopilot.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-3xl border border-slate-100 bg-slate-50/60 p-8 space-y-4 hover:border-orange-200 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-orange-400 font-mono">
                    {s.step}
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
