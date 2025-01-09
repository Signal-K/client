"use client";

import PlanetFour from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/PlanetFour";
import React, { useState } from "react";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
            <PlanetFour />
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