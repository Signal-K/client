"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { Sparkles } from "lucide-react";

interface StardustBalanceProps {
  onPointsUpdate?: (points: number) => void;
}

export default function StardustBalance({ onPointsUpdate }: StardustBalanceProps) {
  const [stardustPoints, setStardustPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStardustBalance = async () => {
      try {
        const response = await fetch("/api/gameplay/research/summary", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          throw new Error(payload?.error ?? "Failed to load stardust balance");
        }

        const basePoints = Number(payload?.counts?.all ?? 0);
        const techTypes = Array.isArray(payload?.researchedTechTypes) ? payload.researchedTechTypes : [];
        const paidUpgrades = techTypes.filter((techType: string) =>
          ["probereceptors", "satellitecount", "probecount", "proberange", "rovercount"].includes(techType)
        );
        const researchPenalty = paidUpgrades.length * 10;
        const referralBonus = Number(payload?.referralBonus ?? 0);

        const totalPoints = Math.max(0, basePoints + referralBonus - researchPenalty);
        
        setStardustPoints(totalPoints);
        onPointsUpdate?.(totalPoints);
      } catch (error) {
        console.error("Error fetching stardust balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStardustBalance();
  }, [session, onPointsUpdate]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
      <Sparkles className="w-3 h-3" />
      <span className="font-medium">{stardustPoints} Stardust</span>
    </div>
  );
}
