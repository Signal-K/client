"use client";

import React, { useEffect, useRef, useState } from "react";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import ResearchSectionModern from "@/src/components/sections/ResearchSectionModern";
import { Button } from "@/src/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import TotalPoints from "@/src/components/deployment/missions/structures/Stardust/Total";
import BiologyResearch from "@/src/components/research/BiologyItems";
import AstronomyResearch from "@/src/components/research/AstronomyItems";
import MeteorologyResearch from "@/src/components/research/MeteorologyItems";
import ReferralCodePanel from "@/src/components/profile/setup/Referrals";
import AutomatonSurfaceRoverResearch from "@/src/components/research/Automatons/Rovers";
import ResearchSection from "@/src/components/sections/ResearchSection";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import Login from "../auth/page";
import RoverResearch from "@/src/components/research/RoverItems";

type CapacityKey =
  | "probeCount"
  | "probeDistance"
  | "stationCount"
  | "balloonCount"
  | "Seiscam"
  | "Wheels"
  | "cameraCount"
  | "stationSize";

type UserCapacities = Record<CapacityKey, number>;

export default function ResearchPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { isDark, toggleDarkMode } = UseDarkMode();
  const totalPointsRef = useRef<any>(null);

  // Referral related states
  const [userHasReferral, setUserHasReferral] = useState<boolean | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const checkReferral = async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("id")
        .eq("referree_id", session.user.id)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Error checking referral:", error.message);
        setUserHasReferral(false);
      } else {
        setUserHasReferral(!!data);
      }
    };
    checkReferral();
  }, [session, supabase]);

  const handleDivClick = () => {
    setTimeout(() => {
      if (totalPointsRef.current?.refreshPoints) {
        totalPointsRef.current.refreshPoints();
      }
    }, 3000);
  };

  const handleReferralSubmit = async () => {
    setReferralError(null);
    setReferralSuccess(null);
    if (!session?.user?.id) {
      setReferralError("You must be logged in to submit a referral code.");
      return;
    }
    if (!referralCodeInput.trim()) {
      setReferralError("Please enter a valid referral code.");
      return;
    }
    setIsSubmittingReferral(true);
    try {
      const { error } = await supabase.from("referrals").insert({
        referree_id: session.user.id,
        referral_code: referralCodeInput.trim(),
      });
      if (error) {
        setReferralError("Failed to submit referral code. Please try again.");
        setIsSubmittingReferral(false);
        return;
      }
      setReferralSuccess("Referral code added successfully!");
      setUserHasReferral(true);
      setReferralCodeInput("");
    } catch (e) {
      setReferralError("An unexpected error occurred.");
    } finally {
      setIsSubmittingReferral(false);
    };
  };

  if (!session) {
    return (
      <Login />
    );
  };

  // Theme-based colors
  const bgColor = isDark ? "bg-[#232a36]" : "bg-[#E5EEF4]";
  const textColor = isDark ? "text-[#E5EEF4]" : "text-[#232a36]";
  const cardColor = isDark ? "bg-[#2E3440]" : "bg-white";
  const borderColor = isDark ? "border-[#5E81AC]" : "border-[#1e3a5f]";

  return (
    <div className={`min-h-screen w-full relative flex justify-center ${textColor}`}>
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground 
          sectorX={0} 
          sectorY={0} 
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>
      {/* Main Header */}
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />
      {/* Navigation Toggle */}
      <div className="fixed top-20 right-10 z-20">
        <div className="flex flex-col space-y-2">
          <Button onClick={() => document.getElementById('astronomy-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Astronomy
          </Button>
          <Button onClick={() => document.getElementById('meteorology-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Meteorology
          </Button>
          <Button onClick={() => document.getElementById('automaton-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Automaton
          </Button>
          <Button onClick={() => document.getElementById('rover-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Rover
          </Button>
        </div>
      </div>
      {/* Main content with more space from sidebar and increased width */}
      <div className="w-full flex justify-center pt-24 relative z-10">
        <div className="w-full max-w-5xl px-6 md:px-8 lg:px-12 xl:px-0">
          {/* Activity Header from main page */}
          <div className="mb-10">
            <ActivityHeaderSection
              classificationsCount={0}
              landmarksExpanded={false}
              onToggleLandmarks={() => {}}
            />
          </div>
          <main className="w-full flex flex-col gap-0">
            <div className="w-full flex flex-col gap-0" onClick={handleDivClick}>
              <div id="astronomy-section">
                <ResearchSectionModern title="Astronomy" infoText="Explore astronomy research and discoveries." backgroundType="stars">
                  <AstronomyResearch />
                </ResearchSectionModern>
              </div>
              <div id="meteorology-section">
                <ResearchSectionModern title="Meteorology" infoText="Study meteorological phenomena and data." backgroundType="planets">
                  <MeteorologyResearch />
                </ResearchSectionModern>
              </div>
              {/* <div id="automaton-section">
                <ResearchSectionModern title="Automaton Surface Rover" infoText="Automaton rover research and surface exploration." backgroundType="rover">
                  <AutomatonSurfaceRoverResearch />
                </ResearchSectionModern>
              </div> */}
              <div id="rover-section">
                <ResearchSectionModern title="Rover Research" infoText="Explore rover research and technology." backgroundType="rover">
                  <RoverResearch />
                </ResearchSectionModern>
              </div>
            </div>
            <div className="w-full my-8">
              <ReferralCodePanel />
            </div>
            {/* NEW referral input section if user has no referral yet */}
            {userHasReferral === false && (
              <div className={`max-w-md mx-auto mt-8 p-6 ${cardColor} rounded-2xl shadow-xl`}>
                <h4 className={`text-lg font-semibold ${isDark ? "text-[#81A1C1]" : "text-[#5E81AC]"} mb-2`}>
                  Add Your Referral Code
                </h4>
                <p className={isDark ? "text-[#D8DEE9]" : "text-[#232a36] mb-4"}>
                  If someone referred you to Star Sailors, add their code to get some bonus stardust!
                </p>
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter your referral code"
                  disabled={isSubmittingReferral}
                  className={`w-full mb-3 px-3 py-2 rounded-xl border-0 ${isDark ? "bg-[#3B4252] text-[#ECEFF4]" : "bg-[#E5EEF4] text-[#232a36]"} focus:outline-none focus:ring-2 focus:ring-[#88C0D0]`}
                />
                {referralError && (
                  <p className="text-red-400 mb-2">{referralError}</p>
                )}
                {referralSuccess && (
                  <p className="text-green-400 mb-2">{referralSuccess}</p>
                )}
                <Button
                  onClick={handleReferralSubmit}
                  disabled={isSubmittingReferral}
                  className={`w-full ${isDark ? "bg-[#81A1C1] text-[#2E3440] hover:bg-[#88C0D0]" : "bg-[#5E81AC] text-white hover:bg-[#88C0D0]"}`}
                >
                  {isSubmittingReferral ? "Submitting..." : "Submit Referral"}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};