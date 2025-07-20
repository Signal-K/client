"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Milestone {
  name: string;
  structure: string;
  icon: string;
  table: "classifications" | "comments";
  field: "classificationtype" | "category";
  value: string;
  requiredCount: number;
  extendedDescription: string;
}

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
}

export default function MilestoneCard() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [communityMilestones, setCommunityMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
  const [communityProgress, setCommunityProgress] = useState<{ [key: string]: number }>({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"player" | "community">("player");

  useEffect(() => {
    fetch("/api/gameplay/milestones")
      .then((res) => res.json())
      .then((data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedPlayerMilestones = [...data.playerMilestones].sort(
          (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );
        const sortedCommunityMilestones = [...data.communityMilestones].sort(
          (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );

        const latestIndex = sortedPlayerMilestones.findIndex((group) => {
          const start = new Date(group.weekStart);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return today >= start && today <= end;
        });

        setMilestones(sortedPlayerMilestones);
        setCommunityMilestones(sortedCommunityMilestones);
        setCurrentWeekIndex(latestIndex !== -1 ? latestIndex : 0);
      });
  }, []);

  useEffect(() => {
    if (!session || milestones.length === 0) return;

    const fetchProgress = async (isCommunity = false) => {
      const progress: { [key: string]: number } = {};
      const weekData = isCommunity ? communityMilestones : milestones;
      if (!weekData[currentWeekIndex]) return;

      const { weekStart, data } = weekData[currentWeekIndex];
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
          .eq(field, value);

        if (!isCommunity && session.user.id) {
          query = query.eq("author", session.user.id);
        }

        const { count, error } = await query;
        if (!error && count !== null) {
          progress[milestone.name] = count;
        }
      }

      if (isCommunity) setCommunityProgress(progress);
      else setUserProgress(progress);
    };

    fetchProgress(false);
    fetchProgress(true);
  }, [session, milestones, communityMilestones, currentWeekIndex]);

  const formatWeekDisplay = (index: number) => {
    const diff = milestones.length - 1 - index;
    if (diff === 0) return "Current Week";
    if (diff === 1) return "Last Week";
    return `${diff} Weeks Ago`;
  };

  const activeMilestones = activeTab === "player" ? milestones : communityMilestones;
  const activeProgress = activeTab === "player" ? userProgress : communityProgress;

  return (
    <Card className="bg-card border border-chart-2/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-chart-2">
            <Zap className="w-4 h-4" />
            Weekly Milestones
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Tabs */}
        {/* <div className="flex border-b border-border text-sm font-medium">
          {["player", "community"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type as "player" | "community")}
              className={`py-2 px-3 rounded-t-md transition-all ${
                activeTab === type
                  ? "bg-background border border-b-transparent border-border text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {type === "player" ? "Your Progress" : "Community Progress"}
            </button>
          ))}
        </div> */}

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekIndex((i) => Math.max(i - 1, 0))}
            disabled={currentWeekIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium text-chart-3 text-center flex-grow">
            {activeMilestones.length > 0 ? formatWeekDisplay(currentWeekIndex) : "Loading..."}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentWeekIndex((i) =>
                i < activeMilestones.length - 1 ? i + 1 : i
              )
            }
            disabled={currentWeekIndex >= activeMilestones.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Milestones */}
        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {activeMilestones[currentWeekIndex]?.data.map((milestone, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-muted/20 p-4 rounded border border-border hover:bg-muted/30 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{milestone.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{milestone.extendedDescription}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap sm:text-right">
                {activeProgress[milestone.name] || 0}/{milestone.requiredCount} completed
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}