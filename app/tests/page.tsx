"use client";

import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { MiningComponentComponent } from "@/components/(scenes)/mining/mining-component";
import Greenhouse from "@/page.test";
import BigMap from "@/components/(scenes)/planetScene/bigMap";
import DiscoveriesPage from "@/content/Classifications/minimalDiscoveries";
import DailyMinorPlanetMissions from "@/components/Structures/Missions/Astronomers/DailyMinorPlanet";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
          <DailyMinorPlanetMissions />
              {/* <Greenhouse /> */}
              {/* <BigMap /> */}
              {/* <DiscoveriesPage /> */}
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