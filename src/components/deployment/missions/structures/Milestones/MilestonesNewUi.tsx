"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
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
}

export function NewMilestones() {
  const supabase = useSupabaseClient();
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

      const { data, error } = await supabase
        .from("user_milestones")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("week_start", weekStart.toLocaleDateString("en-CA")); // formats as YYYY-MM-DD

      if (!error && data) {
        setMilestones(data as UserMilestone[]);
      }
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
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      for (const milestone of milestones) {
        const {
          table,
          field,
          value
        } = milestone.milestone_data;

        // Skip if any required values are undefined
        if (!table || !field || value === undefined) {
          console.warn('Skipping milestone with undefined data:', milestone.milestone_data);
          continue;
        }

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
        } else if (error) {
          console.error('Error fetching milestone progress:', error);
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
}