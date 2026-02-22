"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupCard, SetupScaffold } from "@/src/features/setup/components/SetupScaffold";

type PlanetTarget = { id: number; name: string };
type DeployMode = "weather" | "planets" | "p-4";

type DeployStatusPayload = {
  planetTargets?: PlanetTarget[];
  deploymentStatus?: {
    satellites?: {
      deployed?: boolean;
      unclassifiedCount?: number;
      available?: boolean;
    };
  };
};

export default function SatelliteSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DeployStatusPayload | null>(null);
  const [mode, setMode] = useState<DeployMode>("weather");
  const [planetId, setPlanetId] = useState<number | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setIsLoading(true);
      const response = await fetch("/api/gameplay/deploy/status", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!mounted) return;

      if (response.status === 401) {
        router.replace("/auth");
        return;
      }

      if (!response.ok) {
        setError(payload?.error || "Failed to load satellite setup status.");
        setIsLoading(false);
        return;
      }

      const parsed = (payload || {}) as DeployStatusPayload;
      setStatus(parsed);
      setPlanetId(parsed.planetTargets?.[0]?.id ?? null);
      setIsLoading(false);
    }

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [router]);

  const hasTargets = (status?.planetTargets?.length || 0) > 0;

  const statusText = useMemo(() => {
    if (isLoading) return "Loading planet targets...";
    if (!hasTargets) return "No planet targets available yet. Classify a planet first.";
    const unclassified = status?.deploymentStatus?.satellites?.unclassifiedCount || 0;
    if (unclassified > 0) return `${unclassified} satellite anomalies waiting for classification.`;
    return "Satellite ready for deployment.";
  }, [isLoading, hasTargets, status]);

  async function handleDeploy() {
    if (!planetId) return;
    setDeploying(true);
    setError(null);

    const response = await fetch("/api/gameplay/deploy/satellite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ investigationMode: mode, planetId }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error || "Satellite deployment failed.");
      setDeploying(false);
      return;
    }

    setDeploying(false);
    router.push("/viewports/satellite");
  }

  return (
    <SetupScaffold
      title="Satellite Setup"
      subtitle="Choose a target planet and mission mode, deploy satellite coverage, then review and classify returned anomaly data."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SetupCard title="Mission Flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Select mission mode and target planet.</li>
            <li>Deploy satellite for this cycle.</li>
            <li>Open Satellite Viewport and classify returned anomalies.</li>
          </ol>
        </SetupCard>

        <SetupCard title="What You Should Do Now">
          <p className="mb-3">{statusText}</p>
          {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-red-200">{error}</p>}

          <div className="mb-3 grid gap-3">
            <label className="text-slate-200">
              <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Mission Mode</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as DeployMode)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
              >
                <option value="weather">Weather Analysis</option>
                <option value="planets">Planetary Survey</option>
                <option value="p-4">Wind Survey</option>
              </select>
            </label>

            <label className="text-slate-200">
              <span className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Target Planet</span>
              <select
                value={planetId ?? ""}
                onChange={(e) => setPlanetId(Number(e.target.value))}
                disabled={!hasTargets}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-400 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {hasTargets ? (
                  status?.planetTargets?.map((planet) => (
                    <option key={planet.id} value={planet.id}>
                      {planet.name}
                    </option>
                  ))
                ) : (
                  <option value="">No planet targets yet</option>
                )}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDeploy}
              disabled={deploying || !hasTargets || !planetId}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deploying ? "Deploying..." : "Deploy Satellite"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/viewports/satellite")}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80"
            >
              Open Satellite Viewport
            </button>
            {!hasTargets && (
              <button
                type="button"
                onClick={() => router.push("/structures/telescope")}
                className="rounded-lg border border-amber-500/50 bg-amber-950/40 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-900/40"
              >
                Classify Planets First
              </button>
            )}
          </div>
        </SetupCard>
      </div>
    </SetupScaffold>
  );
}
