"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import {
  Telescope,
  SnowflakeIcon,
  PawPrintIcon,
  MountainIcon,
  Star,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

type Milestone = {
  name: string;
  structure: string;
  icon: string;
  group: string;
  extendedDescription?: string;
};

type WeekMilestones = {
  weekStart: string;
  data: Milestone[];
};

const ALL_GROUPS = ["Astronomy", "Meteorology", "Geology", "Biology"];

const groupIcons: Record<string, JSX.Element> = {
  Astronomy: <Telescope className="w-7 h-7" />,
  Meteorology: <SnowflakeIcon className="w-7 h-7" />,
  Biology: <PawPrintIcon className="w-7 h-7" />,
  Geology: <MountainIcon className="w-7 h-7" />,
};

export default function UserMilestoneMissionSummary({
  groupsToShow,
}: {
  groupsToShow?: string[];
}) {
  const [milestones, setMilestones] = useState<WeekMilestones | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      const res = await fetch("/api/gameplay/milestones");
      const data = await res.json();
      setMilestones(data.playerMilestones?.[0] ?? null);
    };

    fetchMilestones();
  }, []);

  if (!milestones) return null;

  const activeGroups = groupsToShow ?? ALL_GROUPS;

  const grouped: Record<string, Milestone[]> = {};
  for (const m of milestones.data) {
    if (!grouped[m.group]) grouped[m.group] = [];
    grouped[m.group].push(m);
  }

  const backgroundStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "absolute",
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 100% 50%, #ff00cc 0% 2%, #00ffcc 3% 5%, transparent 6%),
      radial-gradient(circle at 0% 50%, #ff00cc 0% 2%, #00ffcc 3% 5%, transparent 6%),
      radial-gradient(ellipse at 50% 0%, #3300ff 0% 3%, transparent 4%) 10px 10px,
      radial-gradient(circle at 50% 50%, #00ffcc 0% 1%, #ff00cc 2% 3%, #3300ff 4% 5%, transparent 6%) 20px 20px,
      repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #242424 10px, #242424 20px)
    `,
    backgroundSize: "50px 50px, 50px 50px, 40px 40px, 60px 60px, 100% 100%",
    animation: "shift 15s linear infinite",
    opacity: 0.3,
    pointerEvents: "none",
    zIndex: 0,
  };

  return (
    <div className="relative flex gap-6 items-center py-4 px-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md overflow-hidden text-white min-h-[150px]">
      <style>{`
        @keyframes shift {
          0% {
            background-position:
              0 0,
              0 0,
              10px 10px,
              20px 20px,
              0 0;
          }
          100% {
            background-position:
              50px 50px,
              -50px -50px,
              60px 60px,
              80px 80px,
              0 0;
          }
        }
      `}</style>

      <div style={backgroundStyle} aria-hidden="true" />

      <div className="relative z-10 flex gap-6 items-center">
        {activeGroups.map((group) => {
          const hasMissions = grouped[group] && grouped[group].length > 0;
          const icon = groupIcons[group] || <Star className="w-7 h-7" />;

          return hasMissions ? (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className="flex flex-col items-center text-white hover:text-indigo-300 transition"
            >
              {icon}
              <span className="text-xs mt-1 uppercase">{group}</span>
            </button>
          ) : (
            <div
              key={group}
              className="flex flex-col items-center text-gray-500 opacity-40 cursor-default"
            >
              {icon}
              <span className="text-xs mt-1 uppercase">{group}</span>
            </div>
          );
        })}
      </div>

      <Sheet open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <SheetContent className="w-full max-w-lg h-screen overflow-y-auto p-6 bg-[#0d1b2a] text-white border-l border-white/10">
          <h2 className="text-xl font-bold text-indigo-300 mb-4">
            {selectedGroup} Missions –{" "}
            {new Date(milestones.weekStart).toLocaleDateString()}
          </h2>

          {grouped[selectedGroup ?? ""]?.map((m, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/10 bg-white/5 p-4 shadow flex gap-4 items-start mb-4"
            >
              <div className="pt-1 text-indigo-300">
                {groupIcons[m.group] || <Star className="w-5 h-5" />}
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-white">{m.name}</p>
                {m.extendedDescription && (
                  <p className="text-sm text-white/70">{m.extendedDescription}</p>
                )}
                <p className="text-xs text-white/50">
                  Structure: <span className="font-mono">{m.structure}</span>
                </p>
                <Link
                  href={`/structures/${m.structure.toLowerCase()}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-200 mt-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  View structure
                </Link>
              </div>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </div>
  );
}