"use client";

import PlanetGenerator2 from "@/components/Data/Generator/Astronomers/PlanetHunters/V2/PlanetGenerator2";
import MySettlementsLocations from "@/content/Classifications/UserLocations";

export default function TestPage() {

    return (
        // <StarnetLayout>
          <>
            <MySettlementsLocations />
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