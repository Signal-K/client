"use client";

import React, { useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import FreeformUploadData from "@/components/Projects/(classifications)/FreeForm";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
              {/* <Greenhouse /> */}
              {/* <MiningComponent /> */}
              <FreeformUploadData />
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