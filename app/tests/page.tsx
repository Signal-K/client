"use client";

import { PlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import WeatherEventsOverview from "@/components/Data/Generator/Weather/EventsAcrossMyLocations";
import WeatherEventStatus from "@/components/Data/Generator/Weather/EventsCounter";
import AlertComponent from "@/components/Structures/Missions/Milestones/Alerts/Alerts";
import MilestoneTotalCompleted from "@/components/Structures/Missions/Milestones/Completed";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import MyLocationIds from "@/content/Classifications/UserLocationPK";
import MySettlementsLocations from "@/content/Classifications/UserLocations";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function TestPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [locationIds, setLocationIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      async function fetchLocationIds() {
        if (!session) return;
        const { data, error } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", session.user.id)
          .in("classificationtype", ["planet", "telescope-minorPlanet"]);
  
        if (!error && data) {
          setLocationIds(data.map((item) => item.id));
        }
        setLoading(false);
      }
  
      fetchLocationIds();
    }, [session]);

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-8">
      {/* <AlertComponent /> */}
      {/* <MySettlementsLocations /> */}
      <MilestoneTotalCompleted />
      <TotalPoints />
                  <WeatherEventStatus
                    classificationId={40} 
                    biome={'RockyHighlands'}
                    biomass={0.01}
                    density={3.5}
                  />
                  <MyLocationIds />
                  {/* <WeatherEventsOverview classificationInfo={locationIds} /> */}
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