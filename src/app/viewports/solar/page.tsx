"use client";

import dynamic from "next/dynamic";
import ViewportShell from "@/src/components/layout/ViewportShell";

const SolarHealth = dynamic(() => import("@/src/components/scenes/deploy/solar/SolarHealth"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs text-slate-400">Loading solar viewport...</div>,
});

export default function SolarHealthViewportExpandedPage() {
  return (
    <ViewportShell>
      <SolarHealth />
    </ViewportShell>
  );
}
