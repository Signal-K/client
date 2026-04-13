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
  const supabase = createSupabaseServerClient();

  // getSession() reads the cookie that middleware already refreshed.
  // No network call, no cookie writes — safe to use in a Server Component.
  // (getUser() makes a network call and tries to write cookies on refresh,
  // which Next.js blocks in Server Components and causes a 408.)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <Suspense fallback={<ControlStationSkeleton />}>
      <GameClient initialData={null} user={session.user} />
    </Suspense>
  );
}
