"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { X, ExternalLink } from "lucide-react";
import { captureCrossGameNavigation } from "@/src/features/analytics/cross-game-navigation";

const CORAL_URL = "https://coral.starsailors.space";

export function CoralFishtank({ userId }: { userId?: string | null } = {}) {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    posthog?.capture("coral_fishtank_clicked");
    setOpen(true);
  };

  const handleExternalLink = () => {
    posthog?.capture("coral_external_link_clicked");
    captureCrossGameNavigation(posthog, {
      destination: "coral",
      source_section: "coral_fishtank",
      user_id: userId ?? null,
    });
  };

  return (
    <>
      {/* Fishtank widget */}
      <button
        onClick={handleClick}
        aria-label="Click-A-Coral fishtank"
        className="relative h-20 w-full overflow-hidden rounded-xl border border-sky-500/20 bg-sky-950/30 backdrop-blur-sm transition-all hover:border-sky-400/40 hover:bg-sky-900/30"
      >
        {/* Animated fish */}
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <span className="animate-[fish-swim_8s_linear_infinite] text-lg" aria-hidden>🐠</span>
          <span className="animate-[fish-swim_12s_linear_infinite_3s] text-sm opacity-70" aria-hidden>🐡</span>
          <span className="animate-[fish-swim_10s_linear_infinite_6s] text-base opacity-50" aria-hidden>🐟</span>
        </div>
        {/* Bubbles */}
        <div className="pointer-events-none absolute bottom-2 left-4 flex gap-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-sky-300/40 animate-[bubble-rise_3s_ease-in_infinite]"
              style={{ animationDelay: `${i * 1}s` }}
            />
          ))}
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-widest text-sky-300/60">
          Click-A-Coral ↗
        </div>
      </button>

      {/* Info modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="sci-fi-panel w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-black tracking-tight">Click-A-Coral</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Click-A-Coral is a separate citizen science game — classify coral reef health from real survey images. It lives at its own address and isn't integrated into Star Sailors.
            </p>
            <a
              href={CORAL_URL}
              target="_blank"
              rel="noreferrer"
              onClick={handleExternalLink}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-sky-400/60 py-3 text-sm font-black uppercase tracking-wider text-sky-300 transition-all hover:bg-sky-400/10"
            >
              Open coral.starsailors.space
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
