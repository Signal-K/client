"use client";

import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Radio, Users, BarChart2, ExternalLink } from "lucide-react";
import { captureCrossGameNavigation } from "@/src/features/analytics/cross-game-navigation";
import { getSailyUrl } from "@/src/features/referrals/referral-links";

interface AgencyNetworkCardProps {
  referralCode: string | null;
  referralsCount: number;
  onCopyInvite: () => void;
  userId?: string | null;
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

export function AgencyNetworkCard({
  referralCode,
  referralsCount,
  onCopyInvite,
  userId,
}: AgencyNetworkCardProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const rows: Array<{
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    channelId: string;
    action: () => void;
  }> = [
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: "Recruit Sailors",
      sublabel: referralsCount > 0 ? `${referralsCount} sailors recruited` : "Copy your invite route",
      channelId: "CH-01",
      action: () => onCopyInvite(),
    },
    {
      icon: <ExternalLink className="h-3.5 w-3.5" />,
      label: "Launch Saily",
      sublabel: referralCode ? "Open daily puzzle with your referral code" : "Open the daily puzzle",
      channelId: "CH-02",
      action: () => {
        captureCrossGameNavigation(posthog, {
          destination: "saily",
          source_section: "agency_network_card",
          user_id: userId ?? null,
        });
        window.open(getSailyUrl(referralCode), "_blank", "noopener,noreferrer");
      },
    },
    {
      icon: <Radio className="h-3.5 w-3.5" />,
      label: "Research Lab",
      sublabel: "Tech tree · Upgrades",
      channelId: "CH-03",
      action: () => router.push("/research"),
    },
    {
      icon: <BarChart2 className="h-3.5 w-3.5" />,
      label: "Fleet Rankings",
      sublabel: "Global leaderboard",
      channelId: "CH-04",
      action: () => router.push("/leaderboards"),
    },
  ];

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
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse-slow shadow-[0_0_4px_rgba(136,192,208,0.8)]" aria-hidden />
          <div className="min-w-0">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-teal-400/60">
              Recruit New Sailors
            </div>
            <div className="text-[11px] text-foreground/70">
              {referralsCount > 0 ? `${referralsCount} crew in your network` : "Your referral route is live"}
            </div>
          </div>
        </div>
        <CarrierWave />
      </div>

      <div className="grid grid-cols-2 gap-2 border-b px-3 py-2" style={{ borderColor: "rgba(136,192,208,0.08)" }}>
        <div className="rounded-lg border border-teal-400/15 bg-teal-500/8 px-2.5 py-2">
          <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-teal-300/55">Invite Code</div>
          <div className="mt-1 truncate font-mono text-[11px] text-teal-100/85">
            {referralCode ?? "Create profile"}
          </div>
        </div>
        <div className="rounded-lg border border-amber-400/15 bg-amber-500/8 px-2.5 py-2">
          <div className="font-mono text-[7px] uppercase tracking-[0.2em] text-amber-300/55">Crew Recruited</div>
          <div className="mt-1 text-[11px] text-amber-100/85">{referralsCount}</div>
        </div>
      </div>

      {/* Channel rows */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {rows.map((row) => (
          <button
            key={row.channelId}
            onClick={row.action}
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
                {row.sublabel}
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
