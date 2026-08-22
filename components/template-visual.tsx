import type { CampaignTemplate } from "@/lib/templates/campaign-templates";
import { MessageSquare, Send } from "lucide-react";

interface TemplateVisualProps {
  template: CampaignTemplate;
  compact?: boolean;
}

export default function TemplateVisual({
  template,
  compact = false,
}: TemplateVisualProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all">
      {/* Trigger & Category Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
            <span>Comment Trigger</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            &ldquo;{template.triggerExample}&rdquo;
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-orange-200/80 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
          {template.category}
        </span>
      </div>

      {/* Keywords & Private Reply Grid */}
      <div className={`grid gap-3 pt-3.5 ${compact ? "" : "sm:grid-cols-2"}`}>
        {/* Keywords */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-lg border border-slate-200/80 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs font-mono"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Private Reply */}
        <div className="rounded-xl border border-orange-100/90 bg-orange-50/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-600">
            <Send className="h-3 w-3" />
            <span>Private DM</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 line-clamp-3">
            {template.privateReplyPreview}
          </p>
        </div>
      </div>
    </div>
  );
}
