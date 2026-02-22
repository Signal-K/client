"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SetupCard, SetupScaffold } from "@/src/features/setup/components/SetupScaffold";

type TelescopeStatusPayload = {
  alreadyDeployed?: boolean;
  deploymentMessage?: string | null;
};

export default function TelescopeSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<TelescopeStatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setIsLoading(true);
      const response = await fetch("/api/gameplay/deploy/telescope?action=status", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!mounted) return;

      if (response.status === 401) {
        router.replace("/auth");
        return;
      }

      if (!response.ok) {
        setError(payload?.error || "Failed to load telescope status.");
        setIsLoading(false);
        return;
      }

      setStatus(payload || {});
      setIsLoading(false);
    }

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [router]);

  const statusText = useMemo(() => {
    if (isLoading) return "Checking telescope deployment status...";
    if (status?.deploymentMessage) return status.deploymentMessage;
    return status?.alreadyDeployed ? "Already deployed this cycle." : "Ready for deployment.";
  }, [isLoading, status]);

  return (
    <SetupScaffold
      title="Telescope Setup"
      subtitle="Pick targets, deploy your telescope, then classify discoveries as they arrive during the cycle."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SetupCard title="Mission Flow">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open telescope deploy console.</li>
            <li>Select mission targets for this cycle.</li>
            <li>Review and classify new telescope discoveries.</li>
          </ol>
        </SetupCard>

        <SetupCard title="What You Should Do Now">
          <p className="mb-3">{statusText}</p>
          {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-red-200">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/activity/deploy")}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open Telescope Deploy
            </button>
            <button
              type="button"
              onClick={() => router.push("/structures/telescope")}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80"
            >
              Open Telescope View
            </button>
          </div>
        </SetupCard>
      </div>
    </SetupScaffold>
  );
}
