import Link from "next/link";

const GITHUB_URL = "https://github.com/diwenne/openreply";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 p-8 sm:p-14 text-white shadow-glow">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Turn your next Instagram reel into automated revenue
            </h2>
            <p className="text-base sm:text-lg text-orange-50 leading-relaxed">
              Free and open source. Deploy in minutes or launch on your own server.
              Zero monthly tier costs.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-white text-orange-600 text-sm font-bold shadow-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
              >
                Sign in to OpenReply
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border border-white/40 bg-white/10 backdrop-blur-xs text-white text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                View source on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
