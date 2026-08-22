"use client";

/**
 * Import Automations Page
 *
 * Paste a CSV of keywords, reply messages, links, and greetings. Each row is staged
 * and reviewed one at a time in the automation builder before publishing.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import { parseCsv } from "@/lib/utils/csv";
import { IMPORT_QUEUE_KEY, IMPORT_ACCOUNT_KEY } from "@/lib/import-queue";
import { AnimatedCard } from "@/components/ui-refined/animated-card";
import { GradientButton } from "@/components/ui-refined/gradient-button";

const SAMPLE = `keywords,dm_message,public_reply,tracked_url,opening_dm,opening_dm_button
"yc","here it is: {link}","sent. check dms","https://events.ycombinator.com/startup-school-2026","hey! click below for the referral","send link"
"LINK,SHOP","grab it here: {link}","dmed u",,,`;

export default function ImportAutomationsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          const next = payload.data.instagramAccounts ?? [];
          setAccounts(next);
          setSelectedAccountId(next[0]?.id ?? "");
        }
      })
      .catch(() => setAccounts([]));
  }, []);

  function startImport() {
    setError(null);
    const parsed = parseCsv(csv);
    if (parsed.length === 0) {
      setError("Paste a CSV with a header row and at least one automation.");
      return;
    }

    const rows = [];
    for (let i = 0; i < parsed.length; i++) {
      const r = parsed[i];
      const keywords = (r.keywords ?? "")
        .split(/[,;]/)
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 10);
      const dmMessage = (r.dm_message ?? r.message ?? "").trim();
      if (keywords.length === 0 || !dmMessage) {
        setError(`Row ${i + 1} is missing keywords or a message.`);
        return;
      }
      rows.push({
        name: (r.name ?? "").trim(),
        keywords,
        dmMessage,
        publicReply: (r.public_reply ?? "").trim(),
        trackedUrl: (r.tracked_url ?? "").trim(),
        openingDmMessage: (r.opening_dm ?? "").trim(),
        openingDmButtonLabel: (r.opening_dm_button ?? "").trim(),
      });
    }

    try {
      window.localStorage.setItem(IMPORT_QUEUE_KEY, JSON.stringify(rows));
      if (selectedAccountId) {
        window.localStorage.setItem(IMPORT_ACCOUNT_KEY, selectedAccountId);
      }
    } catch {
      setError("Could not stage the import in this browser.");
      return;
    }
    router.push("/campaigns/new");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={() => router.push("/campaigns")}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          aria-label="Back to automations"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Import automations
          </h1>
          <p className="text-xs text-slate-400">
            Paste a CSV to batch create multiple comment-to-DM automations
          </p>
        </div>
      </div>

      <AnimatedCard className="p-6 space-y-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          Paste a CSV with one row per automation. Each row will open in the builder
          prefilled and editable, so you can review it and pick the reel before
          publishing. Required columns are <code className="text-orange-600 font-semibold">keywords</code> and{" "}
          <code className="text-orange-600 font-semibold">dm_message</code>.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {accounts.length > 1 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Instagram account
            </label>
            <AccountSelect
              accounts={accounts}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              includeAll={false}
              label="Account"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            CSV data
          </label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={SAMPLE}
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-y transition-all"
          />
          <button
            type="button"
            onClick={() => setCsv(SAMPLE)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Fill with sample CSV data</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <GradientButton onClick={startImport} size="md" icon={Upload}>
            Review and import
          </GradientButton>
          <button
            type="button"
            onClick={() => router.push("/campaigns")}
            className="h-11 px-5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </AnimatedCard>
    </div>
  );
}
