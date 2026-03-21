"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import type { HubLeaderboardEntry } from "@/src/lib/server/hub-leaderboard";

interface HubLeaderboardProps {
  entries?: HubLeaderboardEntry[];
  currentUser?: HubLeaderboardEntry | null;
}

export function HubLeaderboard({ entries = [], currentUser = null }: HubLeaderboardProps) {
  return (
    <div
      className="rounded-xl border border-border/30 overflow-hidden"
      style={{ background: "rgba(4,10,22,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">
            Rankings
          </span>
        </div>
        <Link
          href="/leaderboards"
          className="font-mono text-[8px] uppercase tracking-widest text-primary/60 hover:text-primary flex items-center gap-1 transition-colors"
        >
          Full board <ArrowRight className="h-2.5 w-2.5" aria-hidden />
        </Link>
      </div>

      {entries.length > 0 ? (
        <div className="divide-y divide-border/10">
          {entries.slice(0, 5).map((e) => (
            <div key={`${e.rank}-${e.username}`} className="flex items-center gap-3 px-4 py-2">
              <span
                className="font-mono text-[9px] w-4 shrink-0 text-right"
                style={{ color: e.rank <= 3 ? "#fbbf24" : "rgba(255,255,255,0.25)" }}
              >
                {e.rank}
              </span>
              <span className="flex-1 text-xs text-foreground/70 truncate">
                {e.username}
                {e.isCurrentUser ? " (You)" : ""}
              </span>
              <span className="font-mono text-[10px] text-teal-400 tabular-nums">{e.score}</span>
            </div>
          ))}
          {currentUser && (
            <div className="flex items-center gap-3 px-4 py-2 bg-teal-500/5">
              <span className="font-mono text-[9px] w-4 shrink-0 text-right text-teal-300/90">
                {currentUser.rank}
              </span>
              <span className="flex-1 text-xs text-teal-100/90 truncate">{currentUser.username} (You)</span>
              <span className="font-mono text-[10px] text-teal-300 tabular-nums">{currentUser.score}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground/50">No rankings yet.</p>
          <Link
            href="/leaderboards"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            View leaderboards <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
