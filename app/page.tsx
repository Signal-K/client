"use client"

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import OnboardingWindow from "../components/(scenes)/chapters/(onboarding)/window";
import { useActivePlanet } from "@/context/ActivePlanet";
import {
  EarthView,
  MoonView,
  JupiterView,
  AmaltheaView,
  EuropaView,
  IoView,
  MarsView,
  DeimosView,
  PhobosView,
  MercuryView,
  MiningView,
  // NeptuneView,
  // TritonView,
  PlanetView,
  // PlutoView,
  // SaturnView,
  // EnceladusView,
  // TitanView,
  // UranusView,
  // MirandaView,
  VenusView
} from './scenes';
import GlobeView from "./scenes/globe/page";
import { EarthScene } from "./scenes/earth/scene";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
import EnhancedWeatherEvents from "@/components/enhanced-weather-events";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Onboarding from "./scenes/onboarding/page";
import VerticalToolbar from "@/components/Layout/Toolbar";
import StructureMissionGuide from "@/components/Layout/Guide";

export default function Home() {
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    console.log(session?.user.id);
  });

  const planetViews: Record<number, JSX.Element> = {
    10: <MercuryView />,
    20: <VenusView />,
    69: <EarthView />,
    31: <MoonView />,
    40: <MarsView />,
    41: <PhobosView />,
    42: <DeimosView />,
    50: <JupiterView />,
    52: <IoView />,
    55: <EuropaView />,
    51: <AmaltheaView />,
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
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-1">
            <EnhancedWeatherEvents />
          </div>
          <center>
            <OrbitalStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <div className="py-2">
          <center>
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
      <div className="w-full py-2"><StructureMissionGuide />
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

  if (activePlanet?.id === 69) {
    return (
      <EarthScene />
    );
  };

  if (activePlanet?.id == 35) {
    return (
      <GlobeView />
    );
  };

  return planetViews[activePlanet?.id] || <Onboarding />;
};