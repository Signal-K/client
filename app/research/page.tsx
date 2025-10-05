"use client";

import React, { useEffect, useRef, useState } from "react";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import { Button } from "@/src/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CompactResearchPanel from "@/src/components/research/CompactResearchPanel";
import ReferralCodePanel from "@/src/components/profile/setup/Referrals";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import Login from "../auth/page";

export default function ResearchPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { isDark, toggleDarkMode } = UseDarkMode();

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
      {/* Main content with more space from sidebar and increased width */}
      <div className="w-full flex justify-center pt-24 relative z-10">
        <div className="w-full max-w-4xl px-6 md:px-8 lg:px-12 xl:px-0">
          {/* Activity Header from main page */}
          <div className="mb-8">
            <ActivityHeaderSection
              classificationsCount={0}
              landmarksExpanded={false}
              onToggleLandmarks={() => {}}
            />
          </div>
          <main className="w-full flex flex-col gap-6">
            {/* Main Research Panel - Compact Layout */}
            <CompactResearchPanel />

            {/* Referral Section - Compact Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <ReferralCodePanel />
              </div>
              
              {/* Referral Input - Only show if user has no referral */}
              {userHasReferral === false && (
                <div className={`p-4 ${cardColor} rounded-lg shadow-sm border ${borderColor}`}>
                  <h4 className={`text-base font-semibold ${isDark ? "text-[#81A1C1]" : "text-[#5E81AC]"} mb-2`}>
                    Add Referral Code
                  </h4>
                  <p className={`text-sm ${isDark ? "text-[#D8DEE9]" : "text-[#232a36]"} mb-3`}>
                    Get bonus stardust if someone referred you!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value)}
                      placeholder="Enter referral code"
                      disabled={isSubmittingReferral}
                      className={`flex-1 px-3 py-2 rounded-lg border-0 text-sm ${isDark ? "bg-[#3B4252] text-[#ECEFF4]" : "bg-[#E5EEF4] text-[#232a36]"} focus:outline-none focus:ring-2 focus:ring-[#88C0D0]`}
                    />
                    <Button
                      onClick={handleReferralSubmit}
                      disabled={isSubmittingReferral}
                      size="sm"
                      className={`${isDark ? "bg-[#81A1C1] text-[#2E3440] hover:bg-[#88C0D0]" : "bg-[#5E81AC] text-white hover:bg-[#88C0D0]"}`}
                    >
                      {isSubmittingReferral ? "..." : "Submit"}
                    </Button>
                  </div>
                  {referralError && (
                    <p className="text-red-400 text-xs mt-2">{referralError}</p>
                  )}
                  {referralSuccess && (
                    <p className="text-green-400 text-xs mt-2">{referralSuccess}</p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};