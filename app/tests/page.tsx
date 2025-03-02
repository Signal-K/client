"use client";

import { FullPlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/V2/full-planet-generator";
import { SimplePlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/Simple/simple-planet-generator";
import FileOrWebcamUpload from "@/components/Projects/Zoodex/Upload/GptClassification";
import { ClickACoral } from "@/components/Projects/Zoodex/click-a-coral";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-8">
      <ClickACoral />
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