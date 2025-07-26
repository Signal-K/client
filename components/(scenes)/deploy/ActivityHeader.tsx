"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { AvatarGenerator } from "@/components/Account/Avatar";
import ProfileDetailsPanel from "@/components/Account/ProfileDetailsPanel";
import { Globe, Telescope } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

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
    <Card className="relative w-full h-48 sm:h-64 overflow-hidden rounded-lg border-chart-4/30 bg-card">
      <img
        src="/assets/Backdrops/Earth.png"
        alt="Earth"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent via-card/20 flex items-end p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            {/* <Globe className="w-8 h-8 text-chart-4" /> */}
            <div>
              <AvatarGenerator author={session?.user.id || ""} />
              <h2 className="text-l font-bold text-foreground">
                {profile?.username || "USERNAME"}
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end px-2 sm:px-8 text-sm text-muted-foreground">
            <div className="mb-2">Landmarks</div>
            <Link 
              href="/structures/telescope"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card/20 transition-colors group"
            >
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Telescope className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Telescope
              </span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};