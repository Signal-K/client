'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { formatDistanceToNow, startOfDay, addDays } from "date-fns";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  structure: string;
  table: string;
  field: string;
  value: string;
  requiredCount: number;
}

export default function AlertsDropdown() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [alerts, setAlerts] = useState<string[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  const FIELD_ALIASES: Record<string, Record<string, string>> = {
    events: {
      eventtype: "type",
    },
  };

  const getCookieKey = (userId: string, week: string) => `dismissed-alerts-${userId}-${week}`;

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!session?.user) return;
      const userId = session.user.id;

      const milestoneRes = await fetch("/api/gameplay/milestones");
      const milestoneData = await milestoneRes.json();
      const thisWeekMilestones = milestoneData.playerMilestones.at(-1);

      if (!thisWeekMilestones) return;

      const { weekStart, data } = thisWeekMilestones;
      const startDate = new Date(weekStart);
      const endDate = addDays(startDate, 6);
      const cookieKey = getCookieKey(userId, weekStart);
      const dismissedIds = JSON.parse(Cookies.get(cookieKey) || "[]");

      const alertMessages: string[] = [];

      for (const milestone of data as Milestone[]) {
        if (dismissedIds.includes(milestone.id)) continue;

        const actualField = FIELD_ALIASES[milestone.table]?.[milestone.field] ?? milestone.field;

        const { count, error } = await supabase
          .from(milestone.table)
          .select("*", { count: "exact" })
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .eq(actualField, milestone.value)
          .eq("author", userId);

        if (error) {
          console.error("Error checking milestone:", error);
          continue;
        }

        if ((count ?? 0) < milestone.requiredCount) {
          // Custom or fallback message
          let msg = `Mission incomplete: ${milestone.name} — visit the ${milestone.structure} to contribute.`;
          if (milestone.value === "planet" && milestone.structure === "Telescope") {
            msg = "New planet candidate discovered by your telescope.";
          } else if (milestone.value === "sunspot" && milestone.structure === "Telescope") {
            msg = "Sunspot activity detected — help us classify.";
          } else if (milestone.value === "cloud" && milestone.structure === "WeatherBalloon") {
            msg = "Unusual cloud formations need your attention.";
          }

          alertMessages.push(msg);
        }
      }

      if (alertMessages.length === 0) {
        alertMessages.push("You've completed all milestone goals this week!");
      } else {
        setHasNewAlert(true);
        setNewNotificationsCount(alertMessages.length);
      }

      setAlerts(alertMessages);
    };

    fetchAlerts();
  }, [session, supabase]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const melbourneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" }));
      const nextMidnight = startOfDay(addDays(melbourneTime, 1));
      setTimeRemaining(formatDistanceToNow(nextMidnight, { addSuffix: true }));
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  const dismissCurrentAlert = () => {
    if (!session?.user) return;

    const milestoneRes = fetch("/api/gameplay/milestones").then((res) => res.json());
    milestoneRes.then((milestoneData) => {
      const thisWeekMilestones = milestoneData.playerMilestones.at(-1);
      if (!thisWeekMilestones) return;

      const { weekStart, data } = thisWeekMilestones;
      const cookieKey = getCookieKey(session.user.id, weekStart);
      const dismissedIds: string[] = JSON.parse(Cookies.get(cookieKey) || "[]");

      const current = data.find((_: { id: any; }, index: any) => {
        // Match based on the alert index position
        const incompleteAndNotDismissed = data.filter((m: Milestone) => {
          const actualField = FIELD_ALIASES[m.table]?.[m.field] ?? m.field;
          return !dismissedIds.includes(m.id);
        });
        return incompleteAndNotDismissed[currentAlertIndex]?.id === _.id;
      });

      if (current?.id) {
        const updated = [...new Set([...dismissedIds, current.id])];
        Cookies.set(cookieKey, JSON.stringify(updated), { expires: 7 });
      }

      const nextIndex = currentAlertIndex + 1;
      if (nextIndex < alerts.length) {
        setCurrentAlertIndex(nextIndex);
        setNewNotificationsCount(alerts.length - (nextIndex + 1));
      } else {
        setAlerts(["You've completed all milestone goals this week!"]);
        setCurrentAlertIndex(0);
        setHasNewAlert(false);
        setNewNotificationsCount(0);
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative group">
          <Bell className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="ml-2 text-white">Alerts</span>
          {hasNewAlert && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs">
              {newNotificationsCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border border-[#581c87] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
        <div className="p-4">
          <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] mb-4">
            Daily Alert
          </h2>
          <div className="mt-4 text-center text-[#67e8f9] font-semibold">
            <p>{alerts[currentAlertIndex] || "No new alerts."}</p>
            <p className="mt-2 text-xs text-gray-500">Time remaining until next event: {timeRemaining}</p>
          </div>
          {alerts.length > 1 && currentAlertIndex < alerts.length - 1 && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={dismissCurrentAlert}>
                Dismiss & Next
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};