"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import ViewportShell from "@/src/components/layout/ViewportShell";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";

export default function SatelliteDeployPage() {
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
          <div className="rounded-md bg-emerald-700/10 border border-emerald-600/20 text-emerald-300 px-3 py-2 text-sm">
            Satellite capacity upgrade active — you can launch additional satellites.
          </div>
        </div>
      )}
      <DeploySatelliteViewport />
    </ViewportShell>
  );
}
