"use client";

import { BasicPopupModal } from "@/components/Layout/Modal";
import PlanetTempCalculator from "@/components/Structures/Missions/Astronomers/PlanetHunters/TemperatureCalc";

export default function TestPage() {

    return (
        // <StarnetLayout>
          <>
            <BasicPopupModal />
            <PlanetTempCalculator />
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