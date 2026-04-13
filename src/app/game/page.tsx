import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/ssr";
import GameClient from "./GameClient";

export const dynamic = "force-dynamic";

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
  console.log("[GamePage] render start");
  try {
    const supabase = createSupabaseServerClient();
    console.log("[GamePage] supabase client created");

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("[GamePage] getSession done", { hasSession: !!session, sessionError });

    if (sessionError) {
      console.error("[GamePage] getSession error:", sessionError);
    }

    if (!session) {
      console.log("[GamePage] no session, redirecting to /auth");
      redirect("/auth");
    }

    console.log("[GamePage] rendering GameClient for user", session.user.id);
    return (
      <Suspense fallback={<ControlStationSkeleton />}>
        <GameClient initialData={null} user={session.user} />
      </Suspense>
    );
  } catch (err) {
    // Log the real error — visible in Vercel function logs
    console.error("[GamePage] FATAL ERROR:", err);
    console.error("[GamePage] error message:", err instanceof Error ? err.message : String(err));
    console.error("[GamePage] error stack:", err instanceof Error ? err.stack : "no stack");
    throw err;
  }
}
