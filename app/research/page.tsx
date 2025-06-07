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

type CapacityKey =
  | "probeCount"
  | "probeDistance"
  | "stationCount"
  | "balloonCount"
  | "cameraCount"
  | "stationSize";

type UserCapacities = Record<CapacityKey, number>;

export default function ResearchPage() {
  const router = useRouter();
  const [availablePoints, setAvailablePoints] = useState(0);

  const totalPointsRef = useRef<any>(null); // Ref to TotalPoints

  const handleDivClick = () => {
    setTimeout(() => {
      if (totalPointsRef.current?.refreshPoints) {
        totalPointsRef.current.refreshPoints();
      }
    }, 3000); // Wait 3 seconds before triggering refresh
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
                <BiologyResearch />
              </div>

              <div className="my-4">
                <ReferralCodePanel />
              </div>
            </main>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};