import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { FishIcon } from "lucide-react";

const PlanktonDiscoveryStats = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [totalPlankton, setTotalPlankton] = useState(0);
  const [recentPlankton, setRecentPlankton] = useState(0);
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchPlanktonCount = async () => {
      const query = supabase
        .from("classifications")
        .select("id, created_at")
        .eq("classificationtype", "zoodex-planktonPortal");

      if (onlyMine) {
        query.eq("author", session.user.id);
      };

      const { data, error } = await query;
      if (error) return;

      setTotalPlankton(data.length);

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const recentCount = data.filter((entry) => new Date(entry.created_at) > oneYearAgo).length;
      setRecentPlankton(recentCount);
    };

    fetchPlanktonCount();
  }, [supabase, session, onlyMine]);

  const healthScore = Math.min(100, (recentPlankton / 50) * 100);
  const healthLabel = healthScore > 75 ? "Excellent" : healthScore > 50 ? "Good" : healthScore > 25 ? "Moderate" : "Low";

  return (
    <Card className="p-4 w-full max-w-md bg-card border shadow-md rounded-lg">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-500 flex items-center gap-2">
            <FishIcon className="w-5 h-5" /> Total Plankton Discovered
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Only Mine</span>
            <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
          </div>
        </div>
        <p className="text-xl font-bold text-green-400">{totalPlankton}</p>
        <div>
          <p className="text-sm text-gray-500">Health Score: {healthLabel}</p>
          <Progress value={healthScore} className="h-2 bg-green-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanktonDiscoveryStats;