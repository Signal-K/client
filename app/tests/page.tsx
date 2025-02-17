"use client";

import { FullPlanetGenerator } from "@/components/full-planet-generator"
import { SimplePlanetGenerator } from "@/components/simple-planet-generator"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-8">Planet Generator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#FF4B39]">Advanced Generator</h2>
          <FullPlanetGenerator />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#2A9D8F]">Simple Generator</h2>
          <SimplePlanetGenerator />
        </div>
      </div>
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