"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import ClassificationForm from "../(classifications)/PostForm";
import { useRouter } from "next/navigation";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";
import TutorialContentBlock from "../TutorialContentBlock";

import { Button } from "@/src/components/ui/button";
interface Props {
    anomalyid: number | bigint; 
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterDailyMinorPlanet({
    anomalyid
}: Props) {
    const imageUrls = [
        `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/1.png`,
        `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/2.png`,
        `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/3.png`,
        `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/4.png`
    ];

    const [part, setPart] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const nextPart = () => setPart(2);

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    };

    const tutorialSlides = [
        {
            title: "Welcome to Asteroid Hunters",
            text: "Welcome to the Asteroid Hunters project. In this project, you will be identifying minor planet candidates, like asteroids, around your local star.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step1.png"
        },
        {
            title: "Finding Moving Objects",
            text: "We use the apparent movement of asteroids from image to image to find them, so if you don't see movement, click through the different images to see if the circled object moves",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step2.png"
        },
        {
            title: "Identify the Detection",
            text: "Find the green circle in the subject clip. Within the green circle is one object (light spot) that moves from frame to frame. We call this light spot inside the green circle a detection.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step3.png"
        },
        {
            title: "Ready to Explore",
            text: "That's it! Get ready to explore the skies. Click 'Continue' to start classifying.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step4.png"
        }
    ];

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <TutorialContentBlock
                        slides={tutorialSlides}
                        classificationtype="telescope-minorPlanet"
                        onComplete={nextPart}
                    />
                )}

                {part === 2 && (
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="relative">
                            <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                            <div className="bg-white bg-opacity-90">
                                <div className="relative">
                                    <img
                                        src={imageUrls[currentImageIndex]}
                                        alt={`Anomaly ${currentImageIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {imageUrls.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`h-3 w-3 rounded-full ${index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ClassificationForm anomalyId={anomalyid.toString()} anomalyType='telescope-minorPlanet' missionNumber={20000003} assetMentioned={imageUrls} />
                    </div>
                )}
            </div>
        </div>
    );
};

type Anomaly = {
  id: string;
  content: string;
  anomalySet: string;
  anomalytype?: string;
}; 

export function DailyMinorPlanetWithId({ anomalyId }: { anomalyId: string }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const handleImageChange = (index: number) => {
    if (imageUrls[index]) {
      setCurrentImageIndex(index);
      setCurrentImageUrl(imageUrls[index]);
    }
  };

  useEffect(() => {
    const fetchAnomalyById = async () => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching anomaly with ID:", anomalyId);
        
        if (anomalyId === "random" || !anomalyId) {
          // Fetch a random anomaly from linked_anomalies for backward compatibility
          const { data: linkedAnomalies, error: linkedError } = await supabase
            .from("linked_anomalies")
            .select(`
              id,
              anomaly_id,
              anomalies!inner (
                id,
                content,
                anomalySet,
                anomalytype
              )
            `)
            .eq("author", session.user.id)
            .eq("anomalies.anomalySet", "telescope-minorPlanet");

          if (linkedError) throw linkedError;

          if (!linkedAnomalies || linkedAnomalies.length === 0) {
            console.log("No linked anomalies found for user");
            setError("No anomalies available for classification.");
            return;
          }

          // Pick a random anomaly from the list
          const randomIndex = Math.floor(Math.random() * linkedAnomalies.length);
          const linkedAnomaly = linkedAnomalies[randomIndex];
          const anomaly = linkedAnomaly?.anomalies as unknown as Anomaly;

          if (!anomaly || !anomaly.id) {
            console.error("Selected anomaly is invalid:", anomaly);
            setError("Invalid anomaly data.");
            return;
          }

          setSelectedAnomaly(anomaly);

          // Set up image URLs for all frames (1-4)
          const urls = [1, 2, 3, 4].map(i => 
            `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomaly.id}/${i}.png`
          );
          setImageUrls(urls);
          
          // Set the initial current image URL to the first frame
          setCurrentImageUrl(urls[0]);
        } else {
          // Fetch specific anomaly by ID
          const { data: anomalies, error: anomalyError } = await supabase
            .from("anomalies")
            .select("id, content, anomalySet, anomalytype")
            .eq("id", anomalyId)
            .eq("anomalySet", "telescope-minorPlanet");

          if (anomalyError) {
            console.error("Database error:", anomalyError);
            throw anomalyError;
          }

          console.log("Query returned:", anomalies);

          if (!anomalies || anomalies.length === 0) {
            console.log("No anomaly found with ID:", anomalyId);
            setError("Anomaly not found.");
            return;
          }

          if (anomalies.length > 1) {
            console.warn("Multiple anomalies found with same ID:", anomalies);
          }

          const anomaly = anomalies[0];
          setSelectedAnomaly(anomaly);

          // Set up image URLs for all frames (1-4)
          const urls = [1, 2, 3, 4].map(i => 
            `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomaly.id}/${i}.png`
          );
          setImageUrls(urls);
          
          // Set the initial current image URL to the first frame
          setCurrentImageUrl(urls[0]);
        }

      } catch (err: any) {
        console.error("Error fetching anomaly:", err.message || err);
        setError("Unable to load anomaly.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalyById();
  }, [session, anomalyId, supabase, supabaseUrl]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!selectedAnomaly || !currentImageUrl)
    return <div className="text-white p-4">No anomaly found.</div>;

  return (
    <div className="w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col gap-2 px-4">
      {/* Button Bar */}
      <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-1 flex justify-between items-center flex-shrink-0">
        <Button variant="outline" onClick={() => setShowTutorial(true)}>
          Want a walkthrough? Start the tutorial
        </Button>
      </div>

      {/* Tutorial OR Annotator */}
      <div className="flex-1 w-full rounded-xl bg-white/10 backdrop-blur-md shadow-md p-2 overflow-hidden flex min-h-0">
        {/* Image frame buttons on the left (for larger screens) */}
        {imageUrls.length > 1 && !showTutorial && (
          <div className="hidden sm:flex flex-col gap-2 mr-2 pt-4 flex-shrink-0">
            <span className="text-xs text-white/70 text-center mb-1">Frames</span>
            {imageUrls.map((_, index) => (
              <Button
                key={index}
                variant={currentImageIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleImageChange(index)}
                className={`w-10 h-10 p-0 text-sm ${
                  currentImageIndex === index 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {showTutorial ? (
            <div className="w-full h-full overflow-auto">
              <FirstMinorPlanetClassification anomalyid={selectedAnomaly.id} />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden">
              <ImageAnnotator
                key={`${selectedAnomaly.id}-frame-${currentImageIndex}`}
                anomalyType="telescope-minorPlanet"
                missionNumber={20000003}
                structureItemId={3103}
                assetMentioned={selectedAnomaly.id.toString()}
                annotationType="AA"
                initialImageUrl={currentImageUrl}
                otherAssets={imageUrls.slice(1)}
                anomalyId={selectedAnomaly.id.toString()}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MinorPlanetProps {
    anomalyid: string;
};

const FirstMinorPlanetClassification: React.FC<MinorPlanetProps> = ({ anomalyid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrls = [1, 2, 3, 4].map(i => 
        `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/${i}.png`
    );

    const [part, setPart] = useState(1);
    const nextPart = () => setPart(2);

    const tutorialSlides = [
        {
            title: "Welcome to Asteroid Hunters",
            text: "Welcome to the Asteroid Hunters project. In this project, you will be identifying minor planet candidates, like asteroids, around your local star.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step1.png"
        },
        {
            title: "Finding Moving Objects",
            text: "We use the apparent movement of asteroids from image to image to find them, so if you don't see movement, click through the different images to see if the circled object moves",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step2.png"
        },
        {
            title: "Identify the Detection",
            text: "Find the green circle in the subject clip. Within the green circle is one object (light spot) that moves from frame to frame. We call this light spot inside the green circle a detection.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step3.png"
        },
        {
            title: "Ready to Explore",
            text: "That's it! Get ready to explore the skies. Click 'Continue' to start classifying.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/Step4.png"
        }
    ];

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <TutorialContentBlock
                        slides={tutorialSlides}
                        classificationtype="telescope-minorPlanet"
                        onComplete={nextPart}
                    />
                )}
                
                {part === 2 && (
                    <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <ImageAnnotator
                            anomalyType="telescope-minorPlanet"
                            missionNumber={20000003}
                            structureItemId={3103}
                            assetMentioned={anomalyid}
                            annotationType="AA"
                            initialImageUrl={imageUrls[0]}
                            otherAssets={imageUrls.slice(1)}
                            anomalyId={anomalyid}
                            className="h-full w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};