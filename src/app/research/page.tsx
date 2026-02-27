"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import { Button } from "@/src/components/ui/button";
import CompactResearchPanel from "@/src/components/research/CompactResearchPanel";
import ReferralCodePanel from "@/src/components/profile/setup/Referrals";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import Login from "../auth/page";
import { submitReferralCodeAction } from "@/src/components/profile/setup/actions";

// Small helper component to show how stardust was spent
function StardustSummary({ textColor }: { textColor: string }) {
  const [items, setItems] = useState<{ tech_type: string; created_at?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResearched() {
      try {
        const response = await fetch("/api/gameplay/research/summary");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load stardust spending");
        }
        setItems((payload?.researchedEntries || []) as { tech_type: string; created_at?: string }[]);
      } catch (error) {
        console.error("Error loading stardust spending:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResearched();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>;

  const quantityUpgrades = ['probereceptors', 'satellitecount', 'roverwaypoints'];

  const breakdown = items.map((it: any) => {
    const cost = quantityUpgrades.includes(it.tech_type) ? 10 : 2;
    return { tech: it.tech_type, cost, when: it.created_at };
  });

  const totalSpent = breakdown.reduce((s: number, b: any) => s + b.cost, 0);

  return (
    <div className={`${textColor} text-sm`}>
      {breakdown.length === 0 ? (
        <div>No research purchases yet.</div>
      ) : (
        <div>
          <ul className="list-disc pl-5 text-xs mb-2">
            {breakdown.map((b: any, i: number) => (
              <li key={i}>{b.tech} — {b.cost} ⭐ {b.when ? `(${new Date(b.when).toLocaleDateString()})` : ''}</li>
            ))}
          </ul>
          <div className="text-xs">Total spent: <span className="font-semibold">{totalSpent} ⭐</span></div>
        </div>
      )}
    </div>
  );
};

function ResearchPageContent() {
  const { isDark, toggleDarkMode } = UseDarkMode();
  const searchParams = useSearchParams();
  const referralPanelRef = useRef<HTMLDivElement | null>(null);

  // Referral related states
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userHasReferral, setUserHasReferral] = useState<boolean | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkReferral = async () => {
      try {
        const response = await fetch("/api/gameplay/profile/referral-status", {
          method: "GET",
        });
        const payload = await response.json();
        setAuthenticated(!!payload?.authenticated);
        setUserHasReferral(!!payload?.hasReferral);

        if (payload?.authenticated && !payload?.hasReferral && typeof window !== "undefined") {
          try {
            const pending = window.localStorage.getItem("pending_referral_code") || "";
            if (pending && /^[A-Za-z0-9]{3,32}$/.test(pending)) {
              setReferralCodeInput(pending);
            }
          } catch {
            // Ignore storage access issues.
          }
        }
      } catch {
        setAuthenticated(false);
        setUserHasReferral(false);
      }
    };
    checkReferral();
  }, []);

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (panel !== "referral") return;
    if (userHasReferral !== false) return;
    const timer = window.setTimeout(() => {
      referralPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams, userHasReferral]);

  const handleReferralSubmit = async () => {
    setReferralError(null);
    setReferralSuccess(null);
    if (!authenticated) {
      setReferralError("You must be logged in to submit a referral code.");
      return;
    }
    if (!referralCodeInput.trim()) {
      setReferralError("Please enter a valid referral code.");
      return;
    }
    setIsSubmittingReferral(true);
    try {
      const result = await submitReferralCodeAction(referralCodeInput.trim());
      if (!result.ok) {
        setReferralError(result.error || "Failed to submit referral code. Please try again.");
        setIsSubmittingReferral(false);
        return;
      }
      setReferralSuccess("Referral code added successfully!");
      setUserHasReferral(true);
      setReferralCodeInput("");
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem("pending_referral_code");
        } catch {
          // Ignore storage restrictions.
        }
      }
    } catch (e) {
      setReferralError("An unexpected error occurred.");
    } finally {
      setIsSubmittingReferral(false);
    };
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        Loading research...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Login />
    );
  };

  // Theme-based colors
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

            {/* Stardust Spending Summary */}
            <div className={`p-4 ${cardColor} rounded-lg shadow-sm border ${borderColor}`}>
              <h4 className={`text-base font-semibold ${isDark ? "text-[#81A1C1]" : "text-[#5E81AC]"} mb-2`}>Stardust Spending</h4>
              <StardustSummary textColor={textColor} />
            </div>

            {/* Referral Section - Compact Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <ReferralCodePanel />
              </div>
              
              {/* Referral Input - Only show if user has no referral */}
              {userHasReferral === false && (
                <div
                  ref={referralPanelRef}
                  className={`p-4 sm:p-5 ${cardColor} rounded-xl shadow-sm border ${borderColor} bg-gradient-to-br ${isDark ? "from-[#2E3440] to-[#2A2F3A]" : "from-white to-[#EDF3F8]"}`}
                >
                  <h4 className={`text-base font-semibold ${isDark ? "text-[#81A1C1]" : "text-[#5E81AC]"} mb-2`}>
                    Add Referral Code
                  </h4>
                  <p className={`text-sm ${isDark ? "text-[#D8DEE9]" : "text-[#232a36]"} mb-3`}>
                    Get bonus stardust if someone referred you!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value)}
                      placeholder="Enter referral code"
                      disabled={isSubmittingReferral}
                      className={`w-full sm:flex-1 px-3 py-2 rounded-lg border-0 text-sm ${isDark ? "bg-[#3B4252] text-[#ECEFF4]" : "bg-[#E5EEF4] text-[#232a36]"} focus:outline-none focus:ring-2 focus:ring-[#88C0D0]`}
                    />
                    <Button
                      onClick={handleReferralSubmit}
                      disabled={isSubmittingReferral}
                      size="sm"
                      className={`w-full sm:w-auto ${isDark ? "bg-[#81A1C1] text-[#2E3440] hover:bg-[#88C0D0]" : "bg-[#5E81AC] text-white hover:bg-[#88C0D0]"}`}
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
}

export default function ResearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black text-white flex items-center justify-center">Loading research...</div>}>
      <ResearchPageContent />
    </Suspense>
  );
}
