import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, startOfDay, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const classificationTypes = [
  "zoodex-burrowingOwl", 
  "telescope-minorPlanet",
  "sunspot",
  "satellite-planetFour",
  "planet",
  "lidar-jovianVortexHunter",
  "cloud",
  "balloon-marsCloudShapes",
  "automaton-aiForMars",
];

const AlertComponent = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [alertMessage, setAlertMessage] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchAlert = async () => {
      if (!session?.user) return;

      const userId = session.user.id;

      // Fetch current milestones
      const milestoneRes = await fetch("/api/gameplay/milestones");
      const milestoneData = await milestoneRes.json();

      const currentMilestones = milestoneData.playerMilestones[0]?.data || [];

      // Filter to classification-based milestones only
      const classificationMilestones = currentMilestones.filter(
        (m: any) =>
          m.table === "classifications" &&
          m.field === "classificationtype"
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: classifications, error } = await supabase
        .from("classifications")
        .select("classificationtype, created_at")
        .gte("created_at", oneWeekAgo.toISOString())
        .eq("author", userId);

      if (error) {
        console.error("Error fetching classifications", error);
        return;
      }

      const typeCounts: Record<string, number> = {};
      classifications?.forEach((item) => {
        const type = item.classificationtype;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Find the first incomplete classification milestone
      const incompleteMilestone = classificationMilestones.find((m: any) => {
        const count = typeCounts[m.value] || 0;
        return count < m.requiredCount;
      });

      if (incompleteMilestone) {
        let message = "";

        const { value, structure } = incompleteMilestone;

        if (value === "planet" && structure === "Telescope") {
          message = "New planet candidate discovered by your telescope.";
        } else if (value === "sunspot" && structure === "Telescope") {
          message = "Sunspot activity detected — help us classify.";
        } else if (value === "cloud" && structure === "WeatherBalloon") {
          message = "Unusual cloud formations need your attention.";
        } else {
          message = `Incomplete discovery: ${value} via ${structure}`;
        }

        setAlertMessage(message);
      } else {
        setAlertMessage("You've completed all classification goals this week!");
      }
    };

    fetchAlert();
  }, [session]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const melbourneTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
      );
      const nextMidnight = startOfDay(addDays(melbourneTime, 1));
      const remaining = formatDistanceToNow(nextMidnight, { addSuffix: true });
      setTimeRemaining(remaining);
    };

    const interval = setInterval(calculateTimeRemaining, 60000);
    calculateTimeRemaining();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
          Daily Alert
        </h2>
        <div className="mt-4 text-center text-[#67e8f9] font-semibold">
          <p>{alertMessage}</p>
          <p className="mt-2 text-xs text-gray-500">
            Time remaining until next event: {timeRemaining}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertComponent;