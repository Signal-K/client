"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import ViewportShell from "@/src/components/layout/ViewportShell";

const DeploySatelliteViewport = dynamic(
  () => import("@/src/components/scenes/deploy/satellite/DeploySatellite"),
  { ssr: false }
);

export default function SatelliteDeployPageClient() {
  const { user } = useAuthUser();
  const [hasSatelliteUpgrade, setHasSatelliteUpgrade] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/gameplay/research/summary", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        const researched = Array.isArray(payload?.researched) ? payload.researched : [];
        setHasSatelliteUpgrade(researched.some((r: any) => r.tech_type === "satellitecount"));
      })
      .catch(() => {});
  }, [user]);

  return (
    <ViewportShell>
      {hasSatelliteUpgrade && (
        <div className="mx-auto w-full max-w-4xl px-4 py-2">
          <div className="rounded-md border border-emerald-600/20 bg-emerald-700/10 px-3 py-2 text-sm text-emerald-300">
            Satellite capacity upgrade active - you can launch additional satellites.
          </div>
        </div>
      )}
      <DeploySatelliteViewport />
    </ViewportShell>
  );
}
