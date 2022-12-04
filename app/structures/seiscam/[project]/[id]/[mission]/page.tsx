"use client";

import { useRouter, useParams } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import GameNavbar from "@/src/components/layout/Tes";
import AI4M from "@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars";
import PlanetFour from "@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/PlanetFour";
import React, { useEffect, useState } from "react";
import { AiForMarsProjectWithID } from "@/src/components/projects/Auto/AI4Mars";
import { RoverBackground } from "@/src/components/classification/telescope/rover-background";

export default function SeiscamProjectRoute() {
  const params = useParams();
  const projectParam = params ? params["project"] : undefined;
  const project = Array.isArray(projectParam) ? projectParam[0] : projectParam;
  const router = useRouter();

  const { session, isLoading } = useSessionContext();

  if (!isLoading && !session) {
    router.push("/");
    return null;
  }

  const projectStr = params ? String(params.project) : "";
  const missionStr = params ? String(params.mission) : "";
  const idParam = params ? String(params.id || "") : "";

  let anomalyId: number | undefined = undefined;
  if (idParam.startsWith("cl-")) {
    anomalyId = Number(idParam.replace("cl-", ""));
  } else if (idParam.startsWith("db-")) {
    anomalyId = Number(idParam.replace("db-", ""));
  } else if (!isNaN(Number(idParam))) {
    anomalyId = Number(idParam);
  }

  let ProjectComponent: React.ReactNode = null;
  switch (projectStr) {
    case "ai4mars":
      switch (missionStr) {
        case "one":
          ProjectComponent = <AiForMarsProjectWithID anomalyid={anomalyId} />;
          break;
        default:
          ProjectComponent = <div className="text-white p-4">Unknown mission for AI4Mars.</div>;
          break;
      }
      break;
    default:
      ProjectComponent = <div className="text-white p-4">Unknown mission or project.</div>;
      break;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
        <GameNavbar />
      <div className="fixed inset-0 z-10">
        <RoverBackground />
      </div>
      <main className="relative z-20 py-8 pb-24 flex justify-center">
        <div className="w-full max-w-6xl px-4 bg-black/20 rounded-lg border border-[#78cc32]/30">
          {ProjectComponent}
        </div>
      </main>
    </div>
  );
}