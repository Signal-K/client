"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Star } from "lucide-react";
import { AvatarGenerator } from "@/components/Account/Avatar";
import ProfileDetailsPanel from "@/components/Account/ProfileDetailsPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function ActivityHeader({
  landmarksExpanded,
  onToggleLandmarks,
}: {
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
}) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [profile, setProfile] = useState<{ classificationPoints: number | null } | null>(null);
  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{ [weekKey: string]: { [milestoneName: string]: number } }>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("classificationPoints")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(profileData);

      const res = await fetch("/api/gameplay/milestones");
      const data = await res.json();

      const sortedMilestones: WeekMilestones[] = [...data.playerMilestones].sort(
        (a: WeekMilestones, b: WeekMilestones) =>
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      );
      setMilestones(sortedMilestones);

      const progressMap: { [weekKey: string]: { [milestoneName: string]: number } } = {};

      for (const week of sortedMilestones) {
        const startDate = new Date(week.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const weekKey = week.weekStart;
        progressMap[weekKey] = {};

        for (const milestone of week.data) {
          const { table, field, value } = milestone;

          const { count } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true })
            .eq(field, value)
            .or(`author.eq.${session.user.id},user_id.eq.${session.user.id}`)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          progressMap[weekKey][milestone.name] = count ?? 0;
        }
      }

      setUserProgress(progressMap);
    };

    fetchData();
  }, [session, supabase]);

  const completedByGroup: { [group: string]: { name: string; date: string }[] } = {};

  milestones.forEach((week) => {
    const weekStart = new Date(week.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const formattedRange = `${weekStart.toLocaleDateString()} – ${weekEnd.toLocaleDateString()}`;

    week.data.forEach((milestone) => {
      const completed = userProgress[week.weekStart]?.[milestone.name] ?? 0;
      if (completed >= milestone.requiredCount) {
        if (!completedByGroup[milestone.group]) completedByGroup[milestone.group] = [];
        completedByGroup[milestone.group].push({
          name: milestone.name,
          date: formattedRange,
        });
      }
    });
  });

  const groupCompletionCount: { [group: string]: number } = {
    Biology: completedByGroup.Biology?.length || 0,
    Astronomy: completedByGroup.Astronomy?.length || 0,
    Meteorology: completedByGroup.Meteorology?.length || 0,
  };

  return (
    <header
      className={`relative w-full flex justify-between items-center px-6 transition-all duration-500`}
      style={{
        height: landmarksExpanded ? "70vh" : 220,
        backgroundImage: "url('/assets/Backdrops/Earth.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Left: Avatar, username, landmarks button */}
      <div className="relative z-10 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden">
          <AvatarGenerator author={session?.user.id ?? ""} />
        </div>
        <div className="text-white">
          <h2 className="text-3xl font-bold">{session?.user?.email || "User"}</h2>

          <div className="mt-2 flex flex-col gap-2">
            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="secondary"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1"
            >
              View Profile
            </Button>

            <Button
              onClick={onToggleLandmarks}
              className="inline-flex items-center px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 transition text-white font-semibold text-sm"
            >
              {landmarksExpanded ? "Hide Landmarks" : "View Landmarks"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Classification points and milestones */}
      <div className="relative z-10 text-white flex flex-col items-end gap-6">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Star className="w-7 h-7 text-yellow-400" />
          <span>{profile?.classificationPoints ?? 0} Classification Points</span>
        </div>

        <div className="flex gap-8">
          {Object.entries(groupCompletionCount).map(([group, count]) => (
            <div key={group} className="flex flex-col items-center">
              <span className="uppercase font-semibold text-purple-400">{group}</span>
              <span className="text-green-400 font-bold text-2xl">{count}</span>
              <span className="text-xs text-gray-300">Completed</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">Your Profile</DialogTitle>
          </DialogHeader>
          <ProfileDetailsPanel onClose={() => setShowDetailsModal(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};