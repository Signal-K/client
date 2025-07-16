"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { AvatarGenerator } from "@/components/Account/Avatar";
import ProfileDetailsPanel from "@/components/Account/ProfileDetailsPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserMilestoneMissionSummary from "@/components/Structures/Missions/MissionProgress";

export default function ActivityHeader({
  landmarksExpanded,
  onToggleLandmarks,
  scrolled,
}: {
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
  scrolled: boolean;
}) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [profile, setProfile] = useState<{ classificationPoints: number | null } | null>(null);
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
    };

    fetchData();
  }, [session, supabase]);

  return (
    <header
      className={`transition-all duration-500 w-full px-6 flex items-center justify-between bg-cover bg-center bg-no-repeat`}
      style={{
        height: scrolled ? 60 : landmarksExpanded ? "70vh" : 220,
        backgroundImage: "url('/assets/Backdrops/Earth.png')",
      }}
    >
      <div className="flex items-center gap-4 z-10 text-white">
        {!scrolled && (
          <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden">
            <AvatarGenerator author={session?.user.id ?? ""} />
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">{session?.user?.email || "User"}</h2>

          {!scrolled && (
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
          )}
        </div>
      </div>

      {!scrolled && (
        <div className="text-white text-right flex flex-col items-end z-10 gap-4">
          <div className="text-xl font-semibold">
            {profile?.classificationPoints ?? 0} Stardust
          </div>
          <UserMilestoneMissionSummary />
        </div>
      )}

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