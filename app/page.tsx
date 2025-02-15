"use client"

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import { useActivePlanet } from "@/context/ActivePlanet";
import {
  EarthView,
} from './scenes';
import { EarthScene } from "./scenes/earth/scene";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
import EnhancedWeatherEvents from '@/components/(scenes)/mining/enhanced-weather-events';
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Onboarding from "./scenes/onboarding/page";
import VerticalToolbar from "@/components/Layout/Toolbar";
import SimpleeMissionGuide from "./tests/singleMissionGuide";
import Navbar from "@/components/Layout/Navbar";
import AllSatellitesOnActivePlanet from "@/components/Structures/Auto/AllSatellites";

export default function Home() {
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    console.log(session?.user.id);
  });

  const planetViews: Record<number, JSX.Element> = {
    // 30: <EarthScene
    //   topSection={
    //     <EnhancedWeatherEvents />
    //   }
    //   middleSection={
    //     <StructuresOnPlanet />
    //   }
    //   middleSectionTwo={
    //     <AllAutomatonsOnActivePlanet />
    //   }
    // />,
    30: <EarthViewLayout>
      <div className="w-full">
        <Navbar />
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-1">
            {/* <EnhancedWeatherEvents /> */}
          </div>
          <center> 
            <OrbitalStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <div className="py-2">
          <center>
            <AllSatellitesOnActivePlanet />
            <AtmosphereStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full py-2">
        <center>
          <StructuresOnPlanet />
          <AllAutomatonsOnActivePlanet />
        </center>
      </div>
      {/* <div className="w-full py-2"><StructureMissionGuide /> */}
      <div className="w-full py-2"><SimpleeMissionGuide />
  </div>
    </EarthViewLayout>
    // 60: <SaturnView />,
    // 62: <TitanView />,
    // 61: <EnceladusView />,
    // 70: <UranusView />,
    // 71: <MirandaView />,
    // 80: <NeptuneView />,
    // 81: <TritonView />,
    // 90: <PlutoView />,
    // <MiningView />,
  };

  if (!session) {
    return <LoginPage />;
  };

  return (
    <EarthViewLayout>
      <div className="w-full">
        <Navbar />
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-1">
            {/* <EnhancedWeatherEvents /> */}
          </div>
          <center> 
            <OrbitalStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <div className="py-2">
          <center>
            <AllSatellitesOnActivePlanet />
            <AtmosphereStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full py-2">
        <center>
          <StructuresOnPlanet />
          <AllAutomatonsOnActivePlanet />
        </center>
      </div>
      {/* <div className="w-full py-2"><StructureMissionGuide /> */}
      <div className="w-full py-2"><SimpleeMissionGuide />
      </div>
    </EarthViewLayout>
  );
};