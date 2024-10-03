"use client"

import { OnboardingLayout } from "@/app/components/Template";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Landing } from "@/app/components/landing";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import OnboardingWindow from "./components/(scenes)/chapters/(onboarding)/window";
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
  NeptuneView,
  TritonView,
  PlanetView,
  PlutoView,
  SaturnView,
  EnceladusView,
  TitanView,
  UranusView,
  MirandaView,
  VenusView
} from './scenes';

export default function Home() {
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    console.log(session?.user.id);
  })

  // Mapping planet IDs to corresponding views
  const planetViews: Record<number, JSX.Element> = {
    10: <MercuryView />,
    20: <VenusView />,
    69: <EarthView />,
    70: <MoonView />,
    30: <MarsView />,
    31: <PhobosView />,
    32: <DeimosView />,
    40: <JupiterView />,
    41: <IoView />,
    42: <EuropaView />,
    43: <AmaltheaView />,
    50: <SaturnView />,
    51: <TitanView />,
    52: <EnceladusView />,
    60: <UranusView />,
    61: <MirandaView />,
    // 70: <NeptuneView />,
    71: <TritonView />,
    80: <PlutoView />,
    90: <MiningView />,
  };

  if (!session) {
    return <LoginPage />;
  };

  if (activePlanet?.id === null || activePlanet?.id == 69) {
    return (
      <EarthView />
    );
  };

  return planetViews[activePlanet?.id] || <EarthView />;
};