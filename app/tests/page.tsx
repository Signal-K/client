"use client";

import { PlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import WeatherEventStatus from "@/components/Data/Generator/Weather/EventsCounter";
import AlertComponent from "@/components/Structures/Missions/Milestones/Alerts/Alerts";
import MilestoneTotalCompleted from "@/components/Structures/Missions/Milestones/Completed";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import MySettlementsLocations from "@/content/Classifications/UserLocations";

export default function TestPage() {
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