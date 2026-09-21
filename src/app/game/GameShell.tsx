"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import GameClient from "./GameClient";

export function ControlStationSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-11 border-b border-border/60 bg-background/95 animate-pulse" />
      <div className="h-8 border-b border-border/40 bg-muted/20 animate-pulse" />
      <div className="px-4 py-6 space-y-4 pt-20">
        <div className="h-28 rounded-xl bg-card/20 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Static shell: the server sends only this skeleton. Identity comes from the
 * Clerk browser session, so no Worker request does Clerk or PocketBase work to
 * render /game. Expired or missing sessions are sent to /auth from the browser.
 */
export default function GameShell() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || userId) return;
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/auth?next=${encodeURIComponent(next)}`);
  }, [isLoaded, userId]);

  if (!isLoaded || !userId) return <ControlStationSkeleton />;
  return <GameClient initialData={null} user={{ id: userId }} />;
}
