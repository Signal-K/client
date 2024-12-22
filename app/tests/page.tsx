"use client";

import React, { useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import DailyMinorPlanetMissions from "@/components/Structures/Missions/Astronomers/DailyMinorPlanet/DailyMinorPlanet";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
          <DailyMinorPlanetMissions />
          <TotalPoints />
              {/* <Greenhouse /> */}
              {/* <MiningComponent /> */}
          </>
        // {/* </StarnetLayout> */}
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