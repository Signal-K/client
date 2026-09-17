"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { subDays } from "date-fns";
import Link from "next/link";
import { Telescope } from "lucide-react";

import ActivityHeader from "@/components/(scenes)/deploy/ActivityHeader";
import LandingSS from "./auth/landing";
import NPSPopup from "@/lib/helper/nps-popup";
import RecentActivity from "@/components/Data/RecentActivity";
import RecentDiscoveries from "@/components/Data/RecentDiscoveries";
import TipsPanel from "@/components/Structures/Missions/Milestones/NextStepsTips";
import CompleteProfileForm from "@/components/Account/FinishProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WeeklyBanner from "@/components/ui/update-banner";
import GameNavbar from "@/components/Layout/Tes";

export interface LinkedAnomaly {
  id: number;
  anomaly_id: number;
  date: string;
  anomaly: {
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
}

interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

export interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly?: number;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  classificationPoints: number | null;
}

export default function ActivityPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([]);
  const [activityFeed, setActivityFeed] = useState<CommentVote[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [otherClassifications, setOtherClassifications] = useState<OtherClassification[]>([]);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showNpsModal, setShowNpsModal] = useState(false);
  const [hasCheckedNps, setHasCheckedNps] = useState(false);
  const [showTipsPanel, setShowTipsPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!session) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const userId = session.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, full_name, classificationPoints")
        .eq("id", userId)
        .maybeSingle();
      setProfile(profileData);

      const { data: myClassifications } = await supabase
        .from("classifications")
        .select("id, classificationtype, content, created_at, anomaly")
        .eq("author", userId)
        .order("created_at", { ascending: false })
        .limit(4);
      setClassifications(myClassifications ?? []);

      const classifiedAnomalyIds = new Set(myClassifications?.map((c) => c.anomaly));

      const { data: rawLinked } = await supabase
        .from("linked_anomalies")
        .select(`
          id,
          anomaly_id,
          date,
          anomaly:anomaly_id(
            content,
            anomalytype,
            anomalySet
          )
        `)
        .eq("author", userId)
        .order("date", { ascending: false });

      const linked = (rawLinked ?? []) as unknown as LinkedAnomaly[];
      const filteredLinked = linked.filter((a) => !classifiedAnomalyIds.has(a.anomaly_id));
      setLinkedAnomalies(filteredLinked);

      const oneWeekAgo = subDays(new Date(), 7).toISOString();

      const { data: comments } = await supabase
        .from("comments")
        .select("id")
        .eq("author", userId);

      const { data: votes } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", userId);

      const hasInteracted = (comments?.length ?? 0) > 0 || (votes?.length ?? 0) > 0;
      setShowTipsPanel(!hasInteracted);

      const { data: commentDetails } = await supabase
        .from("comments")
        .select("created_at, content, classification_id")
        .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
        .gte("created_at", oneWeekAgo);

      const { data: voteDetails } = await supabase
        .from("votes")
        .select("created_at, vote_type, classification_id")
        .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
        .gte("created_at", oneWeekAgo);

      const allActivity: CommentVote[] = [];
      if (commentDetails) allActivity.push(...commentDetails.map((c) => ({ type: "comment" as const, ...c })));
      if (voteDetails) allActivity.push(...voteDetails.map((v) => ({ type: "vote" as const, ...v })));

      setActivityFeed(
        allActivity.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );

      const { data: others } = await supabase
        .from("classifications")
        .select("id, classificationtype, content, author, created_at")
        .neq("author", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setOtherClassifications(others ?? []);
    };

    const scheduleNpsCheck = () => {
      if (hasCheckedNps) return;
      const timer = setTimeout(async () => {
        const { data, error } = await supabase
          .from("nps_surveys")
          .select("id")
          .eq("user_id", session.user.id);

        if (!error && Array.isArray(data) && data.length === 0) {
          setShowNpsModal(true);
        }
        setHasCheckedNps(true);
      }, 15000);
      return () => clearTimeout(timer);
    };

    fetchData();
    scheduleNpsCheck();
  }, [session, supabase]);

  if (!session) return <LandingSS />;

  const needsProfileSetup = !profile?.username || !profile?.full_name;

  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-hidden pb-20"
         style={{
           background: "var(--color-background)",
           color: "var(--color-foreground)"
         }}
    >
      <div className="w-full sticky top-0 z-50">
        <ActivityHeader
          scrolled={scrolled}
          landmarksExpanded={landmarksExpanded}
          onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
        />
      </div>

      {scrolled && <GameNavbar />}

      <div className="w-full flex justify-center">
        <div
          className={`w-full px-4 py-6 gap-6 ${
            showTipsPanel
              ? "flex flex-col lg:flex-row max-w-screen-xl"
              : "flex flex-col items-center max-w-screen-md"
          }`}
        >
          <main className="w-full space-y-6 z-10 relative">
            <RecentDiscoveries
              classifications={classifications}
              linkedAnomalies={linkedAnomalies}
            />

            {needsProfileSetup ? (
              <section
                className="rounded-2xl p-6 border shadow space-y-4 text-center"
                style={{
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3 className="text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
                  Finish setting up your account
                </h3>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  Unlock Structures, Research, and referral features by completing your profile.
                </p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="mt-4 px-4 py-2 rounded-lg transition"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)"
                  }}
                >
                  Complete your profile
                </button>
              </section>
            ) : (
              <>
                <RecentActivity
                  activityFeed={activityFeed}
                  otherClassifications={otherClassifications}
                />

                <section
                  className="rounded-2xl p-4 border shadow space-y-4"
                  style={{
                    backgroundColor: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                    borderColor: "var(--color-border)"
                  }}
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Telescope style={{ color: "var(--color-primary)" }} />
                    Structures & Research
                  </h3>
                  <div className="space-y-4">
                    <div className="border p-3 rounded-lg"
                         style={{
                           backgroundColor: "var(--color-popover)",
                           borderColor: "var(--color-border)"
                         }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Telescope Array</p>
                          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                            Enhances classification of distant light curves and planet candidates.
                          </p>
                        </div>
                        <Link
                          href="/activity/deploy"
                          className="px-3 py-1 rounded text-sm"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-primary-foreground)"
                          }}
                        >
                          Deploy
                        </Link>
                      </div>
                    </div>

                    {["Satellites", "Rovers", "Balloons"].map((label) => (
                      <div
                        key={label}
                        className="border p-3 rounded-lg"
                        style={{
                          backgroundColor: "var(--color-muted)",
                          color: "var(--color-muted-foreground)",
                          borderColor: "var(--color-border)"
                        }}
                      >
                        <p className="font-medium">{label} (Coming Soon)</p>
                        <p className="text-sm">
                          {label === "Satellites" && "Will scan magnetic & atmospheric fields."}
                          {label === "Rovers" && "Explore surface geology and send rich data back."}
                          {label === "Balloons" && "Float above atmospheres for weather anomaly mapping."}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {showNpsModal && (
              <NPSPopup
                userId={session.user.id}
                isOpen={true}
                onClose={() => setShowNpsModal(false)}
              />
            )}
          </main>

          {showTipsPanel && <TipsPanel />}
        </div>
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-primary)" }}>
              Complete Your Profile
            </DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      <WeeklyBanner
        message="🚀 The full Star Sailors experience has more projects and deeper mechanics. Feel free to explore—or stay here for a simpler start."
        buttonLabel="Play"
        buttonHref="/alpha"
      />
    </div>
  );
}