import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Star } from "lucide-react";

interface Milestone {
  name: string;
  structure: string;
  icon: string;
  table: "classifications" | "comments" | "events";
  field: string;
  value: string;
  requiredCount: number;
}

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
}

export default function CombinedPointsOverview() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  useEffect(() => {
    fetch("/api/gameplay/milestones")
      .then((res) => res.json())
      .then((data) => {
        setMilestones(data.playerMilestones);
        setCurrentWeekIndex(data.playerMilestones.length - 1);
      });
  }, []);

  useEffect(() => {
    if (!session || milestones.length === 0) return;

    const fetchProgress = async () => {
      const progress: { [key: string]: number } = {};
      const { weekStart, data } = milestones[currentWeekIndex];
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      for (const milestone of data) {
        const { table, field, value } = milestone;

        let query = supabase
          .from(table)
          .select("*", { count: "exact" })
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .eq(field, value)
          .eq("author", session.user.id);

        const { count, error } = await query;
        if (!error && count !== null) {
          progress[milestone.name] = count;
        }
      }

      setUserProgress(progress);
    };

    fetchProgress();
  }, [session, milestones, currentWeekIndex]);

  const categorizeMilestone = (milestone: Milestone): "astronomy" | "meteorology" | "biology" | "other" => {
    const key = milestone.name.toLowerCase();
    if (key.includes("planet") || key.includes("minor") || key.includes("star")) return "astronomy";
    if (key.includes("cloud") || key.includes("weather") || key.includes("jvh") || key.includes("ai4m")) return "meteorology";
    if (key.includes("biology") || key.includes("cell") || key.includes("organism")) return "biology";
    return "other";
  };

  const pointsByCategory = { astronomy: 0, meteorology: 0, biology: 0, other: 0 };

  if (milestones.length > 0) {
    for (const milestone of milestones[currentWeekIndex].data) {
      const count = userProgress[milestone.name] || 0;
      const category = categorizeMilestone(milestone);
      pointsByCategory[category] += count;
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 text-[#5FCBC3] flex items-center gap-2">
        <Star className="w-5 h-5 text-[#FFD700]" />
        Category Points Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {["astronomy", "meteorology", "biology", "other"].map((cat) => (
          <div key={cat} className="p-4 bg-[#1D2833] rounded-lg border border-[#2C4F64]/30">
            <div className="text-sm text-[#5FCBC3] capitalize">{cat}</div>
            <div className="text-2xl font-bold text-[#FFD700]">
              {pointsByCategory[cat as keyof typeof pointsByCategory]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};