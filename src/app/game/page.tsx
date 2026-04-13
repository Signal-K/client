import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/ssr";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

// ─── Loading skeleton ───────────────────────────────────────────────────────

function ControlStationSkeleton() {
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

export default async function GamePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Data is fetched client-side via /api/gameplay/page-data to avoid
  // hitting Vercel's serverless timeout with 13+ sequential Prisma queries
  // on cold starts. The skeleton shows while the client fetches.
  return (
    <Suspense fallback={<ControlStationSkeleton />}>
      <GameClient initialData={null} user={user} />
    </Suspense>
  );
}
