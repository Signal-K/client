"use client";

import React, { useEffect, useRef, useState } from "react";
import GameNavbar from "@/components/Layout/Tes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import BiologyResearch from "@/components/Research/BiologyItems";
import AstronomyResearch from "@/components/Research/AstronomyItems";
import MeteorologyResearch from "@/components/Research/MeteorologyItems";
import ReferralCodePanel from "@/components/Account/Referrals";
import AutomatonSurfaceRoverResearch from "@/components/Research/Automatons/Rovers";

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
  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [availablePoints, setAvailablePoints] = useState(0);
  const totalPointsRef = useRef<any>(null);

  // Referral related states
  const [userHasReferral, setUserHasReferral] = useState<boolean | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralError, setReferralError] = useState<string | null>(null);
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);

  // Check if user already has a referral code
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

  // Submit referral code for user
  const handleReferralSubmit = async () => {
    setReferralError(null);
    setReferralSuccess(null);

    if (!session?.user?.id) {
      setReferralError("You must be logged in to submit a referral code.");
      return;
    };

    if (!referralCodeInput.trim()) {
      setReferralError("Please enter a valid referral code.");
      return;
    };

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
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col text-[#2E3440]">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth background"
      />

      <div className="z-10 w-full">
        <GameNavbar />
      </div>

      <div className="flex flex-1 justify-center items-center px-4 py-8">
        <Dialog
          defaultOpen
          onOpenChange={(open) => {
            if (!open) router.push("/");
          }}
        >
          <DialogContent
            className="rounded-3xl w-full max-w-screen-md lg:max-w-[1000px] h-[80vh] overflow-y-auto p-8 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #E5EEF4, #D8E5EC)",
              color: "#2E3440",
            }}
          >
            <div className="text-center mb-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#5E81AC]">
                RESEARCH LAB
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 rounded-border border-[#1e3a5f]">
                <span className="text-[#4cc9f0]">Stardust:</span>
                <span className="font-bold text-[#0f7285] text-xl">
                  <TotalPoints ref={totalPointsRef} />
                </span>
              </div>
            </div>

            <main className="container mx-auto p-4">
              <div className="my-4" onClick={handleDivClick}>
                <AstronomyResearch />
                <MeteorologyResearch />
                <AutomatonSurfaceRoverResearch />
                <BiologyResearch />
              </div>

              <div className="my-4">
                <ReferralCodePanel />
              </div>

              {/* NEW referral input section if user has no referral yet */}
              {userHasReferral === false && (
                <div className="max-w-md mx-auto mt-8 p-6 bg-[#2E3440] rounded-md border border-[#5E81AC] shadow-md">
                  <h4 className="text-lg font-semibold text-[#81A1C1] mb-2">
                    Add Your Referral Code
                  </h4>
                  <p className="text-[#D8DEE9] mb-4">
                    If someone referred you to Star Sailors, add their code to get some bonus stardust!
                  </p>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    placeholder="Enter your referral code"
                    disabled={isSubmittingReferral}
                    className="w-full mb-3 px-3 py-2 rounded border border-[#81A1C1] bg-[#3B4252] text-[#ECEFF4] focus:outline-none focus:ring-2 focus:ring-[#88C0D0]"
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
                    className="w-full bg-[#81A1C1] text-[#2E3440] hover:bg-[#88C0D0]"
                  >
                    {isSubmittingReferral ? "Submitting..." : "Submit Referral"}
                  </Button>
                </div>
              )}
            </main>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};