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

  const [profile, setProfile] = useState<{
    classificationPoints: number | null;
    username: string | null;
  } | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [groupsToShow, setGroupsToShow] = useState<string[]>(["Astronomy", "Meteorology", "Geology", "Biology"]);

  useEffect(() => {
    const updateGroups = () => {
      if (window.innerWidth < 640) {
        setGroupsToShow(["Astronomy"]);
      } else {
        setGroupsToShow(["Astronomy", "Meteorology", "Geology", "Biology"]);
      }
    };

    updateGroups();
    window.addEventListener("resize", updateGroups);
    return () => window.removeEventListener("resize", updateGroups);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("classificationPoints, username")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(profileData);
    };

    fetchData();
  }, [session, supabase]);

  const displayName = profile?.username || session?.user?.email || "User";

  return (
    <header
      className="transition-all duration-500 w-full px-4 sm:px-6 pt-4 py-10 sm:pt-6 bg-cover bg-center bg-no-repeat"
      style={{
        height: scrolled ? 60 : landmarksExpanded ? "70vh" : 220,
        backgroundImage: "url('/assets/Backdrops/Earth.png')",
      }}
    >
      <div className="w-full flex flex-row items-start justify-between gap-4 z-10 text-white overflow-x-auto">
        {/* Left Section: Avatar + Buttons */}
        <div className="flex flex-row items-start gap-4 min-w-[250px] max-w-full flex-shrink-0">
          {!scrolled && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white overflow-hidden">
              <AvatarGenerator author={session?.user.id ?? ""} />
            </div>
          )}

          <div className="flex flex-col">
            <h2 className="text-lg sm:text-2xl font-bold">{displayName}</h2>

            {!scrolled && (
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setShowDetailsModal(true)}
                  variant="secondary"
                  className="bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)] text-white text-xs sm:text-sm px-3 py-1"
                >
                  View Profile
                </Button>

                <Button
                  onClick={onToggleLandmarks}
                  className="inline-flex items-center px-3 py-1 rounded bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-hover)] transition text-white font-semibold text-xs sm:text-sm"
                >
                  {landmarksExpanded ? "Hide Landmarks" : "View Landmarks"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Stardust + Missions */}
        {!scrolled && (
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-sm sm:text-xl font-semibold whitespace-nowrap">
              {profile?.classificationPoints ?? 0} Stardust
            </div>

            <div className="w-full">
              <UserMilestoneMissionSummary groupsToShow={groupsToShow} />
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[color:var(--color-primary)]">Your Profile</DialogTitle>
          </DialogHeader>
          <ProfileDetailsPanel onClose={() => setShowDetailsModal(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};