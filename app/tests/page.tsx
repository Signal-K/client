"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import ImageAnnotation from "@/components/Projects/(classifications)/Annotation";
import InventoryPage from "@/components/Inventory/Grid/Grid";

export default function TestPage() {
    return (
        <StarnetLayout>
          <InventoryPage />
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