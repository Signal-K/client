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
import GameNavbar from "@/components/Layout/Tes";

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  
  const { activePlanet } = useActivePlanet();

  const [hasRequiredItems, setHasRequiredItems] = useState<boolean | null>(null);
  const [userClassifications, setUserClassifications] = useState<boolean | null>(false);
  
  const [planetData, setPlanetData] = useState<any | null>(null);
  const [zoodexCount, setZoodexCount] = useState<number | null>(null);
  const biomass = zoodexCount !== null ? 0.831 * 0.001 * zoodexCount : null;

  useEffect(() => {
    if (!session) return;

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
      }
    };

    const checkClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("author", session.user.id);

        if (error) setUserClassifications(false);
        if (data) setUserClassifications(true);
      } catch (error: any) {
        console.error(error);
      }
    };

    checkClassifications();
    checkInventory();
  }, [session, supabase]);

  useEffect(() => {
    if (!activePlanet) return;

    async function fetchPlanetData() {
      try {
        const { data, error } = await supabase
          .from("anomalies")
          .select("*")
          .eq("id", activePlanet.id);

        if (error) {
          console.error("Error fetching planet data: ", error);
        } else {
          setPlanetData(data[0]);
        }
      } catch (error: any) {
        console.error("Error fetching planet data: ", error);
      };
    };

    fetchPlanetData();
  }, [activePlanet, supabase]);

  useEffect(() => {
    const fetchZoodexCount = async () => {
      try {
        const { count, error } = await supabase
          .from("classifications")
          .select("id", { count: "exact" })
          .like("classificationtype", "%zoodex%");

        if (error) throw error;
        setZoodexCount(count);
      } catch (err: any) {
        console.error("Error fetching Zoodex classifications:", err.message);
        setZoodexCount(0);
      }
    };

    fetchZoodexCount();
  }, [supabase]);

  if (!session) {
    return <LandingSS />;
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
        {/* <Navbar /> */}
        <GameNavbar />
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-6 my-10 px-6">
            <p className="text-[#2C4F65]">Temperature:</p>
            <p className="text-blue-200">{planetData?.temperatureEq} K</p>
            {planetData?.id === 30 && (
              <>
                <p className="text-[#2C4F65]">Biomass:</p>
                <p className="text-blue-200">{biomass !== null ? biomass.toFixed(6) : "Loading..."}</p>
              </>
            )}
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