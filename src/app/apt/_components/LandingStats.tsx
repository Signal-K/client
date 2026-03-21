import { getActiveSailors, getTotalDiscoveries, getActiveProjects } from "@/src/lib/server/stats";

export const revalidate = 300;

function fmt(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  return n > 0 ? `${n}+` : "—";
}

export async function LandingStats() {
  const [sailors, discoveries, projects] = await Promise.all([
    getActiveSailors().catch(() => 0),
    getTotalDiscoveries().catch(() => 0),
    getActiveProjects().catch(() => 0),
  ]);

  const stats = [
    { value: fmt(projects) || "11+", label: "Science projects" },
    { value: fmt(discoveries) || "100k+", label: "Classifications" },
    { value: fmt(sailors) || "—", label: "Active sailors (24h)" },
    { value: "1", label: "Open Source" },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {stats.map((s) => (
        <div key={s.label} className="sci-fi-panel p-6 bg-background/40">
          <div className="text-4xl font-black text-primary tracking-tighter animate-[fade-up_0.4s_ease_both]">
            {s.value}
          </div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Fallback for Suspense — static values, no spinner */
export function LandingStatsFallback() {
  const stats = [
    { value: "11+", label: "Science projects" },
    { value: "100k+", label: "Classifications" },
    { value: "—", label: "Active sailors (24h)" },
    { value: "1", label: "Open Source" },
  ];
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {stats.map((s) => (
        <div key={s.label} className="sci-fi-panel p-6 bg-background/40">
          <div className="text-4xl font-black text-primary tracking-tighter">{s.value}</div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
