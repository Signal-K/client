"use client";

import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { MiningComponentComponent } from "@/components/mining-component";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
              <MiningComponentComponent />
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