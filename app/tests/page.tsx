"use client";

import { PlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import AlertComponent from "@/components/Structures/Missions/Milestones/Alerts/Alerts";
import MilestoneTotalCompleted from "@/components/Structures/Missions/Milestones/Completed";
import MySettlementsLocations from "@/content/Classifications/UserLocations";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-8">
      {/* <AlertComponent /> */}
      {/* <MySettlementsLocations /> */}
      <MilestoneTotalCompleted />
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