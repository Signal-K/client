"use client";

import { FlaskConical, ChevronRight } from "lucide-react";
import { cn } from "@/src/shared/utils";

interface ResearchBriefCardProps {
  availableStardust: number;
  onNavigate: () => void;
  className?: string;
}

export function ResearchBriefCard({
  availableStardust,
  onNavigate,
  className,
}: ResearchBriefCardProps) {
  return (
    <div
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-purple-500/20 bg-purple-950/5 p-4 transition-all hover:border-purple-500/40 hover:bg-purple-950/10 active:scale-[0.98] cursor-pointer",
        className
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]" aria-hidden>
        <FlaskConical size={120} />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 border border-purple-500/20">
              <FlaskConical size={14} className="text-purple-400" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-purple-400">
              Research Protocols
            </span>
          </div>

          <h3 className="text-lg font-black leading-tight text-foreground mb-1.5">
            Advance Station Capabilities
          </h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground max-w-[280px]">
            Accumulated stardust can be allocated to improve sensor sensitivity, orbital duration, and data extraction efficiency.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl font-black text-purple-400 tabular-nums">
            {availableStardust}
          </div>
          <div className="text-[9px] font-mono uppercase tracking-tighter text-purple-400/40">
            Available CR
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-purple-500/10 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/60 group-hover:text-purple-400 transition-colors">
          Initialize Research Lab
        </span>
        <ChevronRight size={14} className="text-purple-400/40 group-hover:text-purple-400 transition-colors" />
      </div>
    </div>
  );
}
