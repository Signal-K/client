import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/ssr";
import { getGamePageDataForUser } from "@/lib/server/game-page-data";
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
  // getUser() validates the token server-side and refreshes cookies atomically.
  // getSession() returns a cached session that may be stale after OAuth, causing
  // downstream auth calls (e.g. inside server actions) to see a null user.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  try {
    // Call the data function directly with the already-authenticated user id.
    // Previously this went through getGamePageData() which called getUser() a
    // second time — a new OAuth token refresh would write cookies in the wrong
    // scope, causing the second call to return null and throw Unauthorized.
    const initialData = await getGamePageDataForUser(user.id);

    return (
      <Suspense fallback={<ControlStationSkeleton />}>
        <GameClient initialData={initialData} user={user} />
      </Suspense>
    );
  } catch (error) {
    console.error("[Game Page] Critical Error:", error);
    throw error;
  }
}
