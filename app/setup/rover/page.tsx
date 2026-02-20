"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupCard, SetupScaffold } from "@/src/components/setup/SetupScaffold";

type RoverSetupPayload = {
  maxWaypoints?: number;
  isFastDeployEnabled?: boolean;
  hasExistingRoverDeployment?: boolean;
};

export default function RoverSetupPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<RoverSetupPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSetup() {
      setIsLoading(true);
      const response = await fetch("/api/gameplay/deploy/rover/setup", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!mounted) return;

      if (response.status === 401) {
        setError("Please sign in to load rover setup.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(payload?.error || "Failed to load rover setup.");
        setIsLoading(false);
        return;
      }

      setSetup(payload || {});
      setIsLoading(false);
    }

    loadSetup();
    return () => {
      mounted = false;
    };
  }, [router]);

  const statusText = useMemo(() => {
    if (isLoading) return "Loading rover capabilities...";
    if (!setup) return "Rover setup unavailable.";
    if (setup.hasExistingRoverDeployment) return "Rover already deployed this cycle.";
    return "Rover ready for a new route.";
  }, [isLoading, setup]);

  return (
    <SetupScaffold
      title="Rover Setup"
      subtitle="Plan rover waypoints for this cycle. Your rover follows your route and surfaces classification targets along the path."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SetupCard title="Mission Flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open route planner and place waypoints.</li>
            <li>Deploy rover to start traversal.</li>
            <li>Return to Rover Viewport to classify findings at each stop.</li>
          </ol>
        </SetupCard>

        <SetupCard title="What You Should Do Now">
          <p className="mb-2">{statusText}</p>
          {setup && (
            <ul className="mb-3 space-y-1 text-slate-300">
              <li>Waypoint capacity: {setup.maxWaypoints ?? 4}</li>
              <li>Fast deploy active: {setup.isFastDeployEnabled ? "Yes" : "No"}</li>
            </ul>
          )}
          {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-red-200">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/activity/deploy/roover")}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open Rover Planner
            </button>
            <button
              type="button"
              onClick={() => router.push("/viewports/roover")}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80"
            >
              Open Rover Viewport
            </button>
          </div>
        </SetupCard>
      </div>
    </SetupScaffold>
  );
}
