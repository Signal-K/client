"use client";

import { useRouter } from "next/navigation";
import { Radio, Users, BarChart2 } from "lucide-react";

interface AgencyNetworkCardProps {
  referralCode: string | null;
  referralsCount: number;
  onCopyInvite: () => void;
}

// Animated carrier wave bars (comms signal visualization)
function CarrierWave() {
  const heights = [3, 5, 8, 12, 9, 6, 10, 7, 4, 9, 11, 6, 8, 5, 3];
  return (
    <div className="flex items-center gap-px h-4" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-px rounded-full bg-teal-400/40 animate-pulse-slow"
          style={{
            height: `${h}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: "2.5s",
          }}
        />
      ))}
    </div>
  );
}

const rows: Array<{
  icon: React.ReactNode;
  label: string;
  sublabel: (props: AgencyNetworkCardProps) => string;
  channelId: string;
  action: (props: AgencyNetworkCardProps, router: ReturnType<typeof useRouter>) => void;
}> = [
  {
    icon: <Users className="h-3.5 w-3.5" />,
    label: "Recruit Crew",
    sublabel: (p) => p.referralsCount > 0 ? `${p.referralsCount} enlisted` : "No crew yet",
    channelId: "CH-01",
    action: (p) => p.onCopyInvite(),
  },
  {
    icon: <Radio className="h-3.5 w-3.5" />,
    label: "Research Lab",
    sublabel: () => "Tech tree · Upgrades",
    channelId: "CH-02",
    action: (_, r) => r.push("/research"),
  },
  {
    icon: <BarChart2 className="h-3.5 w-3.5" />,
    label: "Fleet Rankings",
    sublabel: () => "Global leaderboard",
    channelId: "CH-03",
    action: (_, r) => r.push("/leaderboards"),
  },
];

export function AgencyNetworkCard({
  referralCode,
  referralsCount,
  onCopyInvite,
}: AgencyNetworkCardProps) {
  const router = useRouter();
  const props = { referralCode, referralsCount, onCopyInvite };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(136,192,208,0.12)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* Comms header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "rgba(136,192,208,0.1)", background: "rgba(136,192,208,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse-slow shadow-[0_0_4px_rgba(136,192,208,0.8)]" aria-hidden />
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-teal-400/60">
            Comms Array
          </span>
        </div>
        <CarrierWave />
      </div>

      {/* Channel rows */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {rows.map((row) => (
          <button
            key={row.channelId}
            onClick={() => row.action(props, router)}
            className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.03] group"
          >
            {/* Channel ID */}
            <span
              className="font-mono text-[7px] uppercase tracking-widest shrink-0"
              style={{ color: "rgba(136,192,208,0.3)" }}
            >
              {row.channelId}
            </span>

            {/* Icon */}
            <div className="text-muted-foreground/40 group-hover:text-teal-400/70 transition-colors shrink-0">
              {row.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground/75 group-hover:text-foreground/90 transition-colors leading-none">
                {row.label}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground/35 mt-0.5">
                {row.sublabel(props)}
              </p>
            </div>

            {/* Transmit indicator */}
            <div
              className="shrink-0 font-mono text-[7px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "rgba(136,192,208,0.5)" }}
              aria-hidden
            >
              TX ›
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
