"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import ImageAnnotation from "@/components/Projects/(classifications)/Annotation";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import TelescopeComponent from "@/constants/Structures/Telescope";
import ZoodexComponent from "@/constants/Structures/Zoodex";
import { CreateStructure } from "@/components/Structures/Build/CreateDedicatedStructure";
import AllClassifications from "@/content/Starnet/YourClassifications";

export default function TestPage() {
    return (
        <StarnetLayout>
          <>
            <AllClassifications initialType="planet" />
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