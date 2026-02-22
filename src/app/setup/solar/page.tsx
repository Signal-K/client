"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupCard, SetupScaffold } from "@/src/features/setup/components/SetupScaffold";

type AwaitingItem = {
  id: number;
  automaton: string;
};

export default function SolarSetupPage() {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSolarItems, setPendingSolarItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setIsLoading(true);
      const response = await fetch("/api/gameplay/deploy/awaiting", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!mounted) return;

      if (response.status === 401) {
        router.replace("/auth");
        return;
      }

      const linked = (payload?.linkedAnomalies || []) as AwaitingItem[];
      const pending = linked.filter((item) => item.automaton === "TelescopeSolar").length;
      setPendingSolarItems(pending);
      setIsLoading(false);
    }

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [router]);

  const statusText = useMemo(() => {
    if (isLoading) return "Checking this week's mission status...";
    if (pendingSolarItems > 0) return `Mission joined. ${pendingSolarItems} solar targets are still processing.`;
    return "Mission not joined yet this week.";
  }, [isLoading, pendingSolarItems]);

  async function handleJoinMission() {
    setJoining(true);
    setError(null);

    const response = await fetch("/api/gameplay/deploy/solar", { method: "POST" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error || "Failed to join solar mission.");
      setJoining(false);
      return;
    }

    setJoining(false);
    router.push("/viewports/solar");
  }

  return (
    <SetupScaffold
      title="Solar Observatory Setup"
      subtitle="Join the weekly Sun mission, wait for the event window to open, then count and classify solar anomalies."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SetupCard title="Mission Flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Join this week's solar mission.</li>
            <li>Wait for the anomaly window to unlock.</li>
            <li>Open Solar Viewport and count/classify sunspot anomalies.</li>
          </ol>
        </SetupCard>

        <SetupCard title="What You Should Do Now">
          <p className="mb-3">{statusText}</p>
          {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-red-200">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleJoinMission}
              disabled={joining}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joining ? "Joining..." : "Join Solar Mission"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/viewports/solar")}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80"
            >
              Open Solar Viewport
            </button>
          </div>
        </SetupCard>
      </div>
    </SetupScaffold>
  );
}
