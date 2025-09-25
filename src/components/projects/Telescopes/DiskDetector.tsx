"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

type Anomaly = {
  id: string;
  name: string;
  content?: string;
  details?: string;
};

interface TelescopeProps {
  anomalyId: string;
};

export const DiskDetectorTutorial: React.FC<TelescopeProps> = ({
  anomalyId,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrls = Array.from(
    { length: 10 },
    (_, index) =>
      `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyId}/${
        index + 1
      }.png`
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showClassification, setShowClassification] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  // Tutorial slides for Disk Detective
  const tutorialSlides = createTutorialSlides([
    {
      title: "Disk Detective Classification",
      text: "Hello, and welcome to the Disk Detective Classification",
    },
    {
      title: "Finding Hidden Disks",
      text: "Find stars with hidden disks of dust around them. These stars show us where to look for new planetary systems and teach us about how planets form",
      image: "/assets/Docs/Telescopes/DiskDetector/Step1.png"
    },
    {
      title: "Ideal Disk Candidates",
      text: "The ideal disk candidate is a single, round source, contained mostly within in the outer circle in all of the images. It may move a bit from image to image, but it does not move beyond the inner circle.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step2.png"
    },
    {
      title: "Survey Labels",
      text: "As you go through the images, pay attention to the label in the upper right hand corner. This label indicates what survey the image is from, i.e., which telescope took the image.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step3.png"
    },
    {
      title: "Different Survey Features",
      text: "You'll be looking for different features in the images from different surveys. For example, images from the Pan-STARRS survey are especially good at revealing objects like galaxies that are not round. The last image (unWISE w3), from the WISE telescope, is especially good at revealing interstellar dust clouds.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step4.png"
    },
    {
      title: "Ready to Start!",
      text: "Let's get started with classifying disk candidates!",
    }
  ]);

  const handleTutorialComplete = () => {
    setShowClassification(true);
  };

  return (
    <div className="rounded-lg">
      {/* Tutorial Component */}
      <TutorialContentBlock
        classificationtype="DiskDetective"
        slides={tutorialSlides}
        onComplete={handleTutorialComplete}
        title="Disk Detective Training"
        description="Learn to identify stars with dust disks"
      />

      {/* Classification Interface - shown after tutorial or for returning users */}
      {showClassification && (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <img
              src={imageUrls[currentImageIndex]}
              alt={`Disk candidate ${currentImageIndex + 1}`}
              className="w-full max-w-md h-64 object-contain bg-white rounded"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={prevImage}
                className="bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
              >
                Previous Image
              </button>
              <span className="flex items-center text-sm text-gray-600">
                {currentImageIndex + 1} / {imageUrls.length}
              </span>
              <button
                onClick={nextImage}
                className="bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
              >
                Next Image
              </button>
            </div>
          </div>
          <ClassificationForm
            anomalyId={anomalyId}
            anomalyType="DiskDetective"
            missionNumber={3000009}
            assetMentioned={imageUrls[currentImageIndex]}
          />
        </div>
      )}
    </div>
  );
};

export function TelescopeDiskDetector() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMission3000009, setHasMission3000009] = useState<boolean | null>(null);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);

  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: anomalyData, error: anomalyError } = await supabase
          .from("anomalies")
          .select("*")
          .eq("author", session.user.id)
          .eq("anomalySet", "telescope-diskDetective")
          .limit(1)
          .maybeSingle();

        if (anomalyError) {
          throw anomalyError;
        }

        if (anomalyData) {
          setAnomaly(anomalyData);
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyData.id}/1.png`);
        } else {
          setAnomaly(null);
          setImageUrl(null);
        }
      } catch (error: any) {
        console.error("Error fetching anomaly:", error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session, supabase]);

  useEffect(() => {
    const checkMission = async () => {
      if (!session) {
        setMissionLoading(false);
        return;
      }

      try {
        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select("*")
          .eq("user", session.user.id)
          .eq("mission", 3000009)
          .maybeSingle();

        if (missionError) {
          console.error("Error checking mission:", missionError.message);
          setHasMission3000009(false);
        } else {
          setHasMission3000009(!!missionData);
        }
      } catch (error: any) {
        console.error("Error in mission check:", error.message);
        setHasMission3000009(false);
      } finally {
        setMissionLoading(false);
      }
    };

    checkMission();
  }, [session, supabase]);

  if (loading || missionLoading) {
    return <div>Loading...</div>;
  }

  if (!hasMission3000009) {
    return (
      <div className="text-center p-4">
        <p>You need to unlock this mission first. Complete the required tasks to access the Disk Detective classification.</p>
      </div>
    );
  }

  if (!anomaly) {
    return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>;
  }

  const startTutorial = () => setShowTutorial(true);

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
      <Button onClick={startTutorial} variant="outline">
        Show Tutorial
      </Button>

      {showTutorial && <DiskDetectorTutorial anomalyId={anomaly.id} />}

      {imageUrl && !showTutorial && (
        <div className="flex flex-col items-center w-full">
          <ClassificationForm
            anomalyId={anomaly.id}
            anomalyType="DiskDetective"
            missionNumber={3000009}
            assetMentioned={imageUrl}
          />
        </div>
      )}
    </div>
  );
};