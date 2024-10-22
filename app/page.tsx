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
import InitialiseChapterOneUser from "@/components/(scenes)/chapters/one/InitialiseUser";

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
      <EarthView />
    );
  };

  if (activePlanet?.id === null) {
    return (
      <InitialiseChapterOneUser />
    );
  };

  if (activePlanet?.id == 35) {
    return (
      <GlobeView />
    );
  };

  return planetViews[activePlanet?.id] || <EarthView />;
};