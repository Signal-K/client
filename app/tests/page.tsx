"use client";

import WeatherEventsOverview from "@/components/Data/Generator/Weather/EventsAcrossMyLocations";
import WeatherEventStatus from "@/components/Data/Generator/Weather/EventsCounter";
import MilestoneTotalCompleted from "@/components/Structures/Missions/Milestones/Completed";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import MyLocationIds from "@/content/Classifications/UserLocationPK";
import MySettlementsLocations from "@/content/Classifications/UserLocations";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
// import { PlanetGenerator } from "starsailors-planet-generator";

export default function TestPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [locationIds, setLocationIds] = useState<{ id: number; biome: string; biomass: number; density: number; anomaly_id: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLocationIds() {
      if (!session) return;
      const { data, error } = await supabase
        .from("classifications")
        .select("id, anomaly")
        .eq("author", session.user.id)
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (!error && data) {
        const parsedData = data.map((item) => ({
          id: item.id,
          biome: "RockyHighlands",// biome: item.biome ?? "Unknown",
          biomass: 0.01, //item.biomass ?? 0,
          density: 3.5, // item.density ?? 1,
          anomaly_id: item.anomaly,
        }));
        setLocationIds(parsedData);
      }
      setLoading(false);
    }

    fetchLocationIds();
  }, [session]);

  return (
    <div className="min-h-screen  p-4 space-y-8">
      {/* <MySettlementsLocations /> */}
      {/* <MilestoneTotalCompleted />
      <TotalPoints />
                  <WeatherEventStatus
                    classificationId={40} 
                    biome={'RockyHighlands'}
                    biomass={0.01}
                    density={3.5}
                  />
                  <MyLocationIds /> */}
      {/* <WeatherEventsOverview /> */}

      {/* <PlanetGenerator classificationId={1} biome={'RockyHighlands'} biomass={0.01} density={3.5} /> */}
    </div>
  );
};


/*
<ImageAnnotation src={imageUrls[currentImageIndex]} onUpload={uploadAnnotatedImage} />
  anomalies = {[
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ]}  />

*/