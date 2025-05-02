import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { formatDistanceToNow } from "date-fns";

const AlertComponent = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [alertMessage, setAlertMessage] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchAlert = async () => {
      if (!session?.user) return;

      const userId = session.user.id;

      // Fetch milestone data
      const milestoneRes = await fetch("/api/gameplay/milestones");
      const milestoneData = await milestoneRes.json();
      const currentWeek = milestoneData.playerMilestones[0];
      if (!currentWeek) return;

      const { weekStart, data: milestones } = currentWeek;
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      // Track progress per milestone
      const progressChecks = await Promise.all(
        milestones.map(async (m: any) => {
          let query = supabase
            .from(m.table)
            .select("*", { count: "exact" })
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .eq(m.field, m.value)
            .eq("author", userId);

          const { count, error } = await query;
          if (error) return null;
          return {
            name: m.name,
            completed: count !== null && count >= m.requiredCount,
          };
        })
      );

      const incomplete = progressChecks.filter((p) => p && !p.completed);

      if (incomplete.length > 0) {
        setAlertMessage(`You have ${incomplete.length} incomplete milestone${incomplete.length > 1 ? "s" : ""} for this week.`);
      }

      // Optional: show time until next week
      const now = new Date();
      const nextWeek = new Date(endDate);
      nextWeek.setDate(nextWeek.getDate() + 1);
      setTimeRemaining(formatDistanceToNow(nextWeek, { addSuffix: true }));
    };

    fetchAlert();
  }, [session]);

  if (!alertMessage) return null;

  return (
    <div className="bg-yellow-200 text-black p-4 rounded-md shadow-md mb-4">
      <p className="font-semibold">{alertMessage}</p>
      <p className="text-sm">Time left: {timeRemaining}</p>
    </div>
  );
};

export default AlertComponent;