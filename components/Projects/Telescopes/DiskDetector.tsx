"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/Structures/structureInfo";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
import { Anomaly } from "./Transiting";

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

  const firstImageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyId}/1.png`;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const [part, setPart] = useState(1);
  const [line, setLine] = useState(1);
  const nextLine = () => setLine((prevLine) => prevLine + 1);
  const nextPart = () => {
    setPart(2);
    setLine(1);
  };

  const tutorialContent = (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
      {/* <div className="flex items-center">
        <img
          src="/assets/Captn.jpg"
          alt="Captain Cosmos Avatar"
          className="w-12 h-12 rounded-full bg-[#303F51]"
        />
        <h3 className="text-xl font-bold text-[#85DDA2] mt-2 ml-4">
          Capt'n Cosmos
        </h3>
      </div> */}
      <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
        <div className="relative">
          <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
          {part === 1 && (
            <>
              {line === 1 && (
                <p className="text-[#EEEAD1]">
                  Hello, and welcome to the Disk Detective Classification
                </p>
              )}
              {line === 2 && (
                <p className="text-[#EEEAD1]">
                  Find stars with hidden disks of dust around them. These stars
                  show us where to look for new planetary systems and teach us
                  about how planets form
                </p>
              )}
              {line === 3 && (
                <p className="text-[#EEEAD1]">
                  The ideal disk candidate is a 
                  <strong>
                    single, round source, contained mostly within in the outer
                    circle in all of the images.
                  </strong>
                   It may move a bit from image to image, but it does not move
                  beyond the inner circle.
                </p>
              )}
              {line == 4 && (
                <p className="text-[#EEEAD1]">
                  As you go through the images, pay attention to the label in
                  the upper right hand corner. This label indicates what survey
                  the image is from, i.e., which telescope took the image.
                </p>
              )}
              {line == 5 && (
                <p className="text-[#EEEAD1]">
                  You'll be looking for different features in the images from
                  different surveys. For example, images from the Pan-STARRS
                  survey are especially good at revealing objects like galaxies
                  that are not round. The last image (unWISE w3), from the WISE
                  telescope, is especially good at revealing interstellar dust
                  clouds.
                </p>
              )}
              {line == 6 && (
                <p className="text-[#EEEAD1]">Let's get started!</p>
              )}
              {line < 6 && (
                <button
                  onClick={nextLine}
                  className="mt-4 bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
                >
                  Next
                </button>
              )}
              {line === 6 && (
                <button
                  onClick={nextPart}
                  className="mt-4 bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
                >
                  Continue
                </button>
              )}
              {line < 6 && (
                <div className="flex justify-center mt-4 w-full h-64">
                  {line === 2 && (
                    <img
                      src="/assets/Docs/Telescopes/DiskDetector/Step1.png"
                      alt="Step 1"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {line === 3 && (
                    <img
                      src="/assets/Docs/Telescopes/DiskDetector/Step2.png"
                      alt="Step 2"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {line === 4 && (
                    <img
                      src="/assets/Docs/Telescopes/DiskDetector/Step3.png"
                      alt="Step 3"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {line === 2 && (
                    <img
                      src="/assets/Docs/Telescopes/DiskDetector/Step4.png"
                      alt="Step 4"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}
            </>
          )}
          {part === 2 && (
            <>
              {line === 1 && (
                <p className="text-[#EEEAD1]">
                  Great job! Feel free to classify another disk candidate, if
                  you'd like
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg">
      <div className="flex flex-col items-center">
        {part === 1 && (
          <div className="flex flex-col items-center">{tutorialContent}</div>
        )}
        {part === 2 && (
          <>
            {/* <div className="mb-2"> */}
              {/* <StructureInfo structureName="Telescope" /> */}
              {/* <img
                src="https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true"
                alt="telescope"
                className="w-24 h-24 mb-2"
              /> */}
            {/* </div> */}
            <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
              <div className="relative">
                <div className=" absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                <img
                  src={firstImageUrl}
                  alt="First Image"
                  className="w-full max-w-lg h-auto object-contain"
                />
                {/* <div className="flex justify-between mt-4">
                  <button
                    onClick={prevImage}
                    className="bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
                  >
                    Previous Image
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-[#85DDA2] text-[#2C3A4A] px-4 py-2 rounded-md"
                  >
                    Next Image
                  </button>
                </div> */}
              </div>
              <ClassificationForm
                anomalyId={anomalyId}
                anomalyType="DiskDetective"
                missionNumber={3000009}
                assetMentioned={imageUrls[currentImageIndex]}
              />
            </div>
          </>
        )}
      </div>
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
          .eq("anomalySet", "diskdetective")
          .single();

        if (anomalyError) throw anomalyError;
        if (!anomalyData) {
          setAnomaly(null);
          setLoading(false);
          return;
        }

        setAnomaly(anomalyData as Anomaly);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        setImageUrl(
          `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyData.id}/1.png`
        );
      } catch (error: any) {
        console.error("Error fetching disk cloud: ", error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session, supabase]);

  useEffect(() => {
    const checkTutorialMission = async () => {
      if (!session) return;

      try {
        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select("id")
          .eq("user", session.user.id)
          .eq("mission", "3000009")
          .single();

        if (missionError) throw missionError;
        setHasMission3000009(!!missionData);
      } catch (error: any) {
        console.error("Error checking user mission:", error.message || error);
        setHasMission3000009(false);
      } finally {
        setMissionLoading(false);
      }
    };

    checkTutorialMission();
  }, [session, supabase]);

  // Loading state
  if (loading || missionLoading) {
    return <div><p>Loading...</p></div>;
  }

  // No anomaly case
  if (!anomaly) {
    return <div><p>No disk clouds available</p></div>;
  }

  // Check if the user has the mission
  if (hasMission3000009 === null) {
    // If the mission check is still loading, you can add a loading state here if necessary.
    return null; // Optionally return a loading state
  }

  // Render the tutorial or the main content based on the mission status
  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
      {hasMission3000009 ? (
        <div className="p-4 rounded-md relative w-full">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={anomaly.content}
              className="w-full h-64 object-cover"
            />
          )}
          <p>{anomaly.id.toString()}</p>
          <ClassificationForm
            anomalyId={anomaly.id.toString()}
            anomalyType="DiskDetective"
            missionNumber={100000033}
            assetMentioned={imageUrl || ""}
            originatingStructure={3103}
          />
        </div>
      ) : (
        <DiskDetectorTutorial anomalyId={anomaly.id.toString()} />
      )}
    </div>
  );
};