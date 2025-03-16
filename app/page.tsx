"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import { useActivePlanet } from "@/context/ActivePlanet";
import {
  EarthView,
} from './scenes';
import { EarthScene } from "./scenes/earth/scene";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
// import EnhancedWeatherEvents from '@/components/(scenes)/mining/enhanced-weather-events';
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Onboarding from "./scenes/onboarding/page";
import VerticalToolbar from "@/components/Layout/Toolbar";
import SimpleeMissionGuide from "./tests/singleMissionGuide";
import Navbar from "@/components/Layout/Navbar";
import AllSatellitesOnActivePlanet from "@/components/Structures/Auto/AllSatellites";
import LandingSS from "./auth/landing";

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { activePlanet } = useActivePlanet();

  const [hasRequiredItems, setHasRequiredItems] = useState<boolean | null>(null);
  const [userClassifications, setUserClassifications] = useState<boolean | null>(false);

  useEffect(() => {
    if (!session) {
      return;
    };

    const checkInventory = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("id, quantity")
          .eq("owner", session.user.id)
          .in("item", [3105, 3104, 3103])
          .gt("quantity", 0);

        if (error) throw error;

        setHasRequiredItems(data.length > 0);
      } catch (error: any) {
        console.error("Error checking inventory:", error.message);
        setHasRequiredItems(false);
      };
    };

    const checkClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("author", session.user.id)

        if (error) setUserClassifications(false);
        if (data) {
          setUserClassifications(true);
        };
      } catch (error: any) {
        console.error(error);
      };
    };

    checkClassifications();
    checkInventory();
  }, [session, supabase]);

  if (!session) {
    // return <LoginPage />;
    return (
      <LandingSS />
    );
  };

  if (hasRequiredItems === null) {
    return <div>Loading...</div>;
  };

  if (!hasRequiredItems) {
    return <Onboarding />;
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
      {!userClassifications && (
        <div className="w-full py-2"><SimpleeMissionGuide /></div>
      )}
    </EarthViewLayout>
  );
};