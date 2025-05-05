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
};

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

  const playRandomSound = () => {
    const soundFiles = [
      "/assets/audio/notifs/r2d2.wav",
      "/assets/audio/notifs/r2d21.wav",
    //   "/assets/audio/notifs/notify3.wav",
    //   "/assets/audio/notifs/notify4.wav"
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
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const cookieKey = getCookieKey(userId, weekStart);
      const dismissedIds = JSON.parse(Cookies.get(cookieKey) || "[]");

      const milestoneAlerts: string[] = [];

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

        let msg = `Mission incomplete: ${milestone.name} — visit the ${milestone.structure} to contribute.`;

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
      }

      if (milestoneAlerts.length === 0) {
        const discoveryOptions = [
          { structure: 'Telescope', type: 'telescope-minorPlanet', message: 'A new asteroid has been detected by your telescope.' },
          { structure: 'Telescope', type: 'planet', message: 'A planet candidate has been spotted by your telescope.' },
          { structure: 'WeatherBalloon', type: 'sunspot', message: 'Your Weather Balloon has recorded intense sunspot activity.' },
          { structure: 'WeatherBalloon', type: 'automaton-aiForMars', message: 'Rover anomaly reported — assist analysis via Weather Balloon.' },
          { structure: 'WeatherBalloon', type: 'lidar-jovianVortexHunter', message: 'Cyclone-like structures seen from orbit — verify data.' },
          { structure: 'Greenhouse', type: null, message: 'Sensor event detected from your Greenhouse pod — check for changes in terrain.' }
        ];

        const eligibleDiscoveries = [];

        for (const option of discoveryOptions) {
          if (!option.type) {
            eligibleDiscoveries.push(option);
            continue;
          }

          const { data: existing, error } = await supabase
            .from('classifications')
            .select('id')
            .eq('classificationtype', option.type)
            .gte('created_at', sevenDaysAgo.toISOString());

          if (error) {
            console.error('Discovery check failed:', error);
            continue;
          }

          if ((existing?.length ?? 0) === 0) {
            eligibleDiscoveries.push(option);
          }
        }

        if (eligibleDiscoveries.length > 0) {
          const randomDiscovery = eligibleDiscoveries[Math.floor(Math.random() * eligibleDiscoveries.length)];
          milestoneAlerts.push(randomDiscovery.message);
        } else {
          milestoneAlerts.push("You've completed all milestone goals this week!");
        }
      }

      setAlerts(milestoneAlerts);
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

  const dismissCurrentAlert = () => {
    if (!session?.user) return;

    const milestoneRes = fetch("/api/gameplay/milestones").then((res) => res.json());
    milestoneRes.then((milestoneData) => {
      const thisWeekMilestones = milestoneData.playerMilestones.at(-1);
      if (!thisWeekMilestones) return;

      const { weekStart, data } = thisWeekMilestones;
      const cookieKey = getCookieKey(session.user.id, weekStart);
      const dismissedIds: string[] = JSON.parse(Cookies.get(cookieKey) || "[]");

      const current = data.find((_: { id: any }, index: any) => {
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

      playRandomSound();
      console.log("Alert dismissed:", current?.name);

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