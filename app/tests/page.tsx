"use client";

import PlanetFour from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/PlanetFour";
import React, { useEffect, useState } from "react";

interface Props {
  author: string;
}

export const AvatarGenerator: React.FC<Props> = ({ author }) => {
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const generateAvatar = () => {
      const apiUrl = `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(author)}`;
      setAvatarUrl(apiUrl);
    };

    generateAvatar();
  }, [author]);

  return (
    <div>
      {avatarUrl && (
        <div className="mt-6">
          <img src={avatarUrl} alt="Generated Avatar" className="w-16 h-16 rounded-md shadow-md" />
        </div>
      )}
    </div>
  );
};

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
            {/* <PlanetFour /> */}
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