"use client";

import dynamic from "next/dynamic";
import ViewportShell from "@/src/components/layout/ViewportShell";

const RoverViewportSection = dynamic(
  () => import("@/src/components/scenes/deploy/Rover/RoverSection"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-slate-400">Loading rover viewport...</div>,
  }
);

export default function RoverViewportExpandedPage() {
  return (
    <ViewportShell>
      <RoverViewportSection />
    </ViewportShell>
  );
}
