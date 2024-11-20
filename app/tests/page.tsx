"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        <StarnetLayout>
          <>
            <div style={{ width: "100vw", height: "100vh" }}>
            </div>
          </>
        </StarnetLayout>
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