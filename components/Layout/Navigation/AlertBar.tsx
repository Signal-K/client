'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { formatDistanceToNow, startOfDay, addDays } from "date-fns";
import Cookies from "js-cookie";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
};

export default function AlertBar() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [alerts, setAlerts] = useState<string[]>([]);
  const [alertStructures, setAlertStructures] = useState<string[]>([]);
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

  const playRandomSound = () => {
    const soundFiles = [
      "/assets/audio/notifs/r2d2.wav",
      "/assets/audio/notifs/r2d21.wav",
    ];
    const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    const audio = new Audio(randomSound);
    audio.play().catch((err) => console.error("Failed to play sound:", err));
  };

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

      const milestoneAlerts: string[] = [];
      const structureSources: string[] = [];

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

        if ((count ?? 0) >= milestone.requiredCount) continue;

        let msg = `Mission incomplete: ${milestone.name} — visit the 1${milestone.structure} to contribute.`;

        if (milestone.structure === 'WeatherBalloon') {
          switch (milestone.value) {
            case 'sunspot':
              msg = "Sunspot activity detected — deploy Weather Balloon.";
              break;
            case 'satellite-planetFour':
              msg = "Dust storm approaching — assist in image classification.";
              break;
            case 'automaton-aiForMars':
              msg = "Rover anomaly reported — initiate diagnostics.";
              break;
            case 'lidar-jovianVortexHunter':
              msg = "Cyclonic activity spotted — help verify data.";
              break;
            case 'cloud':
            case 'balloon-marsCloudShapes':
              msg = "Unusual cloud formations detected — your analysis is needed.";
              break;
          }
        }

        if (milestone.structure === 'Greenhouse') {
          msg = "Sensor trigger from your desert/ocean pod — investigate recent anomaly.";
        }

        milestoneAlerts.push(msg);
        structureSources.push(milestone.structure);
      }

      // ✅ Additional Event Reminder Logic (Planet Events)
      const { data: classifications } = await supabase
        .from("classifications")
        .select("id, classificationtype, author, created_at")
        .eq("author", userId)
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      // if ((classifications ?? []).length > 0) {
      //   const classificationIds = classifications ? classifications.map(c => c.id) : [];
      //   const { data: weeklyEvents } = await supabase
      //     .from("events")
      //     .select("id, classification_location, created_at")
      //     .in("classification_location", classificationIds)
      //     .gte("created_at", startDate.toISOString())
      //     .lte("created_at", endDate.toISOString());

      //   if ((weeklyEvents?.length ?? 0) === 0) {
      //     milestoneAlerts.push("A weather event is happening this week - check your Weather Balloon");
      //     structureSources.push("WeatherBalloon");
      //   };
      // };

      if (milestoneAlerts.length === 0) {
        milestoneAlerts.push("You've completed all milestone goals this week!");
        structureSources.push("");
      };

      setAlerts(milestoneAlerts);
      setAlertStructures(structureSources);
      setHasNewAlert(milestoneAlerts.length > 0);
      setNewNotificationsCount(milestoneAlerts.length);
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

  const dismissCurrentAlert = async () => {
    if (!session?.user) return;

    const milestoneRes = await fetch("/api/gameplay/milestones");
    const milestoneData = await milestoneRes.json();
    const thisWeekMilestones = milestoneData.playerMilestones.at(-1);

    if (!thisWeekMilestones) return;

    const { weekStart, data } = thisWeekMilestones;
    const cookieKey = getCookieKey(session.user.id, weekStart);
    const dismissedIds: string[] = JSON.parse(Cookies.get(cookieKey) || "[]");

    const incompleteAndNotDismissed = data.filter((m: Milestone) => !dismissedIds.includes(m.id));
    const current = incompleteAndNotDismissed[currentAlertIndex];

    if (current?.id) {
      const updated = [...new Set([...dismissedIds, current.id])];
      Cookies.set(cookieKey, JSON.stringify(updated), { expires: 7 });
    }

    const nextIndex = currentAlertIndex + 1;
    playRandomSound();

    if (nextIndex < alerts.length) {
      setCurrentAlertIndex(nextIndex);
      setNewNotificationsCount(alerts.length - (nextIndex + 1));
    } else {
      setAlerts(["You've completed all milestone goals this week!"]);
      setAlertStructures([""]);
      setCurrentAlertIndex(0);
      setHasNewAlert(false);
      setNewNotificationsCount(0);
    }
  };

  const currentStructure = alertStructures[currentAlertIndex]?.toLowerCase();
  const structurePath = currentStructure
    ? `/structures/${currentStructure === "weatherballoon" ? "balloon" : currentStructure}`
    : null;

  return (
    <div className="w-full max-w-[400px] bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border border-[#581c87] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-400" />
          <span className="ml-2 text-white">Alerts</span>
          {hasNewAlert && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs">
              {newNotificationsCount}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] mb-4">
          Daily Alert
        </h2>
        <div className="mt-4 text-center text-[#67e8f9] font-semibold">
          <p>{alerts[currentAlertIndex] || "No new alerts."}</p>
          <p className="mt-2 text-xs text-gray-500">Time remaining until next event: {timeRemaining}</p>

          {structurePath && (
            <div className="mt-4 flex justify-center">
              <Link href={structurePath}>
                <Button variant="default">Go to Structure</Button>
              </Link>
            </div>
          )}

          {alerts.length > 1 && currentAlertIndex < alerts.length - 1 && (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={dismissCurrentAlert}>
                Dismiss & Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};