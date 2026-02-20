"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";

interface Milestone {
  name: string;
  structure: string;
  icon: string;
  table: "classifications" | "comments";
  field: string;
  value: string;
  requiredCount: number;
  extendedDescription: string;
}

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
}

interface UserMilestone {
  id: string;
  week_start: string;
  milestone_data: Milestone;
}

export function NewMilestones() {
  const session = useSession();

  const [milestones, setMilestones] = useState<UserMilestone[]>([]);
  const [progress, setProgress] = useState<{ [name: string]: number }>({});

  useEffect(() => {
    if (!session) {
      return;
    }

    const fetchMilestones = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekday = today.getDay(); // Sunday = 0
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - weekday);
      const response = await fetch("/api/gameplay/milestones", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      const weekStartKey = weekStart.toLocaleDateString("en-CA");
      const week = (payload?.playerMilestones || []).find((w: WeekMilestones) => w.weekStart === weekStartKey);
      const normalized: UserMilestone[] = (week?.data || []).map((milestone: Milestone, index: number) => ({
        id: `${weekStartKey}-${index}`,
        week_start: weekStartKey,
        milestone_data: milestone,
      }));
      setMilestones(normalized);
    };

    fetchMilestones();
  }, [session]);

  useEffect(() => {
    if (!session || !milestones || milestones.length === 0) {
      return;
    }

    const fetchProgress = async () => {
      const progressMap: { [name: string]: number } = {};
      const weekStartDate = new Date(milestones[0].week_start);
      const response = await fetch("/api/gameplay/milestones/weekly-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStartDate.toISOString().slice(0, 10),
          data: milestones.map((m) => m.milestone_data),
        }),
      });
      const payload = await response.json().catch(() => null);
      Object.assign(progressMap, payload?.progress || {});

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
}
