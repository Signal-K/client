"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { Sparkles } from "lucide-react";

interface StardustBalanceProps {
  onPointsUpdate?: (points: number) => void;
}

export default function StardustBalance({ onPointsUpdate }: StardustBalanceProps) {
  const [stardustPoints, setStardustPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStardustBalance = async () => {
      try {
        // Fetch all points sources
        const [
          { data: classifications },
          { data: researched },
          { data: profile }
        ] = await Promise.all([
          supabase
            .from("classifications")
            .select("id, classificationtype")
            .eq("author", session.user.id),
          supabase
            .from("researched")
            .select("tech_type")
            .eq("user_id", session.user.id),
          supabase
            .from("profiles")
            .select("referral_code")
            .eq("id", session.user.id)
            .maybeSingle()
        ]);

        // Calculate base points from classifications (1 point each)
        const basePoints = classifications?.length || 0;

        // Only count purchased upgrades that cost stardust (not automatic unlocks)
        const paidUpgrades = researched?.filter(r => 
          ['probereceptors', 'satellitecount', 'probecount', 'proberange', 'rovercount'].includes(r.tech_type)
        ) || [];

        // Calculate penalty from research upgrades (10 points each)
        const researchPenalty = paidUpgrades.length * 10;

        // Calculate referral bonus if they have a referral code
        let referralBonus = 0;
        if (profile?.referral_code) {
          const { count } = await supabase
            .from("referrals")
            .select("id", { count: "exact", head: true })
            .eq("referral_code", profile.referral_code);
          referralBonus = (count || 0) * 5;
        }

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
  }, [session, supabase, onPointsUpdate]);

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