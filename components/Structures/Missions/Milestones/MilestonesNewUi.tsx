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
};

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
};

export default function MilestoneCard() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [communityMilestones, setCommunityMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
  const [communityProgress, setCommunityProgress] = useState<{ [key: string]: number }>({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [skillProgress, setSkillProgress] = useState<{ [key: string]: number }>({});
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
    if (!session) return;

    const fetchSkillProgress = async () => {
      const skillCounts: { [key: string]: number } = {
        telescope: 0,
        weather: 0,
      };

      const start = new Date("2000-01-01").toISOString();

      const queries = [
        supabase
          .from("classifications")
          .select("*", { count: "exact" })
          .eq("author", session.user.id)
          .in("classificationtype", ["planet", "telescope-minorPlanet"])
          .gte("created_at", start),
        supabase
          .from("classifications")
          .select("*", { count: "exact" })
          .eq("author", session.user.id)
          .in("classificationtype", ["cloud", "lidar-jovianVortexHunter"])
          .gte("created_at", start),
      ];

      const [telescopeRes, weatherRes] = await Promise.all(queries);

      if (!telescopeRes.error && telescopeRes.count !== null) {
        skillCounts.telescope = telescopeRes.count;
      }

      if (!weatherRes.error && weatherRes.count !== null) {
        skillCounts.weather = weatherRes.count;
      }

      setSkillProgress(skillCounts);
    };

    fetchSkillProgress();
  }, [session]);

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

        {/* Skill Progress */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium text-chart-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Field Experience
          </div>

          <ul className="space-y-3">
            {/* Planetary Observation */}
            <li className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-muted/20 p-4 rounded border border-border hover:bg-muted/30 transition">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  Planetary Observation
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Unlock asteroid detection with {Math.max(4 - skillProgress.telescope, 0)} more discoveries.
                </div>
                <div className="mt-2 w-full bg-muted rounded h-2">
                  <div
                    className="h-2 bg-chart-1 rounded transition-all duration-300"
                    style={{ width: `${Math.min((skillProgress.telescope / 4) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap sm:text-right">
                {Math.min(skillProgress.telescope, 4)}/4 completed
              </div>
            </li>

            {/* Active Asteroid Recon */}
            {skillProgress.telescope >= 4 && (
              <li className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-muted/20 p-4 rounded border border-border hover:bg-muted/30 transition cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    Active Asteroid Recon
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    You've unlocked asteroid detection. Now, focus on identifying signs of activity — jets, tails, or unusual paths. Confirm at least 2 minor asteroid classifications to unlock the <strong>Active Asteroids</strong> project.
                  </div>
                  <div className="mt-2 w-full bg-muted rounded h-2">
                    <div
                      className="h-2 bg-chart-2 rounded transition-all duration-300"
                      style={{ width: `${Math.min(((skillProgress.telescope - 4) / 2) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap sm:text-right">
                  {Math.min(skillProgress.telescope - 4, 2)}/2 completed
                </div>
              </li>
            )}

            {/* Atmospheric Analysis */}
            <li className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-muted/20 p-4 rounded border border-border hover:bg-muted/30 transition">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  Atmospheric Analysis
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Unlock gas giant pattern recognition with {Math.max(4 - skillProgress.weather, 0)} more cloud observations.
                </div>
                <div className="mt-2 w-full bg-muted rounded h-2">
                  <div
                    className="h-2 bg-chart-1 rounded transition-all duration-300"
                    style={{ width: `${Math.min((skillProgress.weather / 4) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap sm:text-right">
                {Math.min(skillProgress.weather, 4)}/4 completed
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

interface UserMilestone {
  id: string;
  user_id: string;
  week_start: string;
  milestone_data: {
    name: string;
    structure: string;
    group: string;
    icon: string;
    table: "classifications" | "comments";
    field: string;
    value: string;
    requiredCount: number;
    extendedDescription: string;
  };
};

export function NewMilestones() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const[milestones, setMilestones] = useState<UserMilestone[]>([]);
  const [progress, setProgress] = useState<{ [name: string]: number }>({});

  useEffect(() => {
    if (!session) {
      return;
    };

    const fetchMilestones = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekday = today.getDay(); // Sunday = 0
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - weekday);

      const { data, error } = await supabase
        .from("user_milestones")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("week_start", weekStart.toLocaleDateString("en-CA")); // formats as YYYY-MM-DD

      if (!error && data) {
        setMilestones(data as UserMilestone[]);
      };
    };

    fetchMilestones();
  }, [session]);

  useEffect(() => {
    if (!session || !milestones || milestones.length === 0) {
      return;
    };

    const fetchProgress = async () => {
      const progressMap: { [name: string]: number } = {};
      const weekStartDate = new Date(milestones[0].week_start);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      for (const milestone of milestones) {
        const {
          table,
          field,
          value
        } = milestone.milestone_data;

        const {
          count,
          error
        } = await supabase
          .from(table)
          .select("*", { count: "exact" })
          .eq("author", session.user.id)
          .eq(field, value)
          .gte("created_at", weekStartDate.toISOString())
          .lte("created_at", weekEndDate.toISOString());

        if (!error && count !== null) {
          progressMap[milestone.milestone_data.name] = count;
        }
      }

      setProgress(progressMap);
    };

    fetchProgress();
  }, [session, milestones]);

  return (
    <Card className="bg-card border border-chart-2/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-chart-2">
          <Zap className="w-4 h-4" />
          Your Weekly Milestones
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones assigned for this week.</p>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-muted/20 p-4 rounded border border-border hover:bg-muted/30 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {milestone.milestone_data.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {milestone.milestone_data.extendedDescription}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap sm:text-right">
                  {progress[milestone.milestone_data.name] || 0}/{milestone.milestone_data.requiredCount} completed
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};