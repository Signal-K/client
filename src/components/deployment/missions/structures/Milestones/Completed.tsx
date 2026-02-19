"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";

interface Milestone {
  name: string;
  structure: string;
  icon: string;
  group: "Biology" | "Astronomy" | "Meteorology";
  table: "classifications" | "comments" | "uploads";
  field: "classificationtype" | "category" | "source";
  value: string;
  requiredCount: number;
}

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
}

export default function MilestoneHistoryList() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{
    [weekKey: string]: { [milestoneName: string]: number };
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/gameplay/milestones");
      const data = await res.json();

      const sorted = [...data.playerMilestones].sort(
        (a: WeekMilestones, b: WeekMilestones) =>
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      );

      setMilestones(sorted);

      if (!session?.user?.id) return;

      const progressMap: {
        [weekKey: string]: { [milestoneName: string]: number };
      } = {};

      for (const week of sorted) {
        const startDate = new Date(week.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999); // Include full last day

        const weekKey = week.weekStart;
        progressMap[weekKey] = {};

        for (const milestone of week.data) {
          const { table, field, value } = milestone;

          const { count, error } = (await supabase
            .from(table as string) // prevent type explosion from unions
            .select("*", { count: "exact", head: true })
            .eq(field as string, value)
            .or(`author.eq.${session.user.id},user_id.eq.${session.user.id}`)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())) as {
            count: number | null;
            error: any;
          };

          if (!error) {
            progressMap[weekKey][milestone.name] = count ?? 0;
          }
        }
      }

      setUserProgress(progressMap);
    };

    fetchData();
  }, [session, supabase]);

  const completedByGroup: {
    [group: string]: { name: string; date: string }[];
  } = {};

  milestones.forEach((week) => {
    const weekStart = new Date(week.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const formattedRange = `${weekStart.toLocaleDateString()} – ${weekEnd.toLocaleDateString()}`;

    week.data.forEach((milestone) => {
      const completed = userProgress[week.weekStart]?.[milestone.name] || 0;
      const isComplete = completed >= milestone.requiredCount;
      if (isComplete) {
        if (!completedByGroup[milestone.group]) {
          completedByGroup[milestone.group] = [];
        }
        completedByGroup[milestone.group].push({
          name: milestone.name,
          date: formattedRange,
        });
      }
    });
  });

  // Count the number of completed milestones per group
  const groupCompletionCount: { [group: string]: number } = {
    Biology: 0,
    Astronomy: 0,
    Meteorology: 0,
  };

  Object.keys(completedByGroup).forEach((group) => {
    groupCompletionCount[group] = completedByGroup[group].length;
  });

  return (
    <div className="w-full max-w-3xl mx-auto p-4 text-white space-y-8">
      <div className="rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold text-purple-400 uppercase mb-3">
          Bonus points:
        </h3>
        <ul className="text-green-300 space-y-1 text-sm">
          {Object.entries(groupCompletionCount).map(([group, count], index) => (
            <li key={index} className="text-gray-400">
              {group}: <span className="text-green-300">{count}</span> completed
            </li>
          ))}
        </ul>
      </div>

      {Object.keys(completedByGroup).length === 0 ? (
        <p className="text-center text-gray-300">
          No completed milestones yet.
        </p>
      ) : (
        Object.entries(completedByGroup).map(([group, items], index) => (
          <div
            key={index}
            className="bg-[#0f172a] border border-[#581c87] rounded-xl p-4 shadow"
          >
            <h3 className="text-lg font-semibold text-purple-400 uppercase mb-3">
              {group}
            </h3>
            <ul className="list-disc list-inside text-green-300 space-y-1 text-sm">
              {items.map((item, idx) => (
                <li key={idx}>
                  {item.name}{" "}
                  <span className="text-gray-400">({item.date})</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
