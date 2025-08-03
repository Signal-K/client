"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";
import { useRouter } from "next/navigation";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

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
    const [line, setLine] = useState(1);
    const nextLine = () => setLine(prevLine => prevLine + 1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Welcome to the Asteroid Hunters project. In this project, you will be identifying minor planet candidates, like asteroids, around your local star.
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    We use the apparent movement of asteroids from image to image to find them, so if you don't see movement, click through the different images to see if the circled object moves
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    Find the green circle in the subject clip. Within the green circle is one object (light spot) that moves from frame to frame. We call this light spot inside the green circle a detection.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    That's it! Get ready to explore the skies. Click "Continue" to start classifying. 
                                </p>
                            )}

                            {line < 4 && (
                                <button
                                    onClick={nextLine}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Next
                                </button>
                            )}
                            {line === 4 && (
                                <button
                                    onClick={nextPart}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Continue
                                </button>
                            )}
                            {line < 5 && (
                                <div className="flex justify-center mt-4 w-full h-128">
                                    {line === 1 && <img src="/assets/Docs/Telescopes/DailyMinorPlanet/Step1.png" alt="Step 1" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 2 && <img src="/assets/Docs/Telescopes/DailyMinorPlanet/Step2.png" alt="Step 2" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 3 && <img src="/assets/Docs/Telescopes/DailyMinorPlanet/Step3.png" alt="Step 3" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 4 && <img src="/assets/Docs/Telescopes/DailyMinorPlanet/Step4.png" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                </div>
                            )}
                        </>
                    )}

                    {part === 2 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    
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
                    <div className="mb-2">
                        {tutorialContent}
                    </div>
                )}

                {part === 2 && (
                    <>
                        <div className="mb-2">
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
                                    {imageUrls.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`h-2 w-2 rounded-full mx-1 ${index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                    </div>
                                    </div>
                                </div>
                                <ClassificationForm anomalyId={anomalyid.toString()} anomalyType='telescope-minorPlanet' missionNumber={20000003} assetMentioned={imageUrls} />
                            </div>
                        </div>
                    </>
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
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/1.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine(prevLine => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1); 
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && <p className="text-[#EEEAD1]">Welcome to the Asteroid Hunters project! You'll be identifying minor planet candidates like asteroids.</p>}
                            {line === 2 && <p className="text-[#EEEAD1]">Look for the green circle in the images. Within it is an object that moves from frame to frame.</p>}
                            {line === 3 && <p className="text-[#EEEAD1]">Your task is to mark the moving object in each frame. This helps confirm if it's a real asteroid.</p>}
                            {line === 4 && <p className="text-[#EEEAD1]">Use the annotation tools to mark the object's location. Ready to start?</p>}

                            {line < 4 && (
                                <button
                                    onClick={nextLine}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Next
                                </button>
                            )}
                            {line === 4 && (
                                <button
                                    onClick={nextPart}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Start Annotating
                                </button>
                            )}
                        </>
                    )}
                    {part === 2 && (
                        <>
                            {line === 1 && (
                                <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                                    <ImageAnnotator
                                        anomalyType="telescope-minorPlanet"
                                        missionNumber={20000003}
                                        structureItemId={3103}
                                        assetMentioned={anomalyid}
                                        annotationType="AA"
                                        initialImageUrl={imageUrl}
                                        anomalyId={anomalyid}
                                        className="h-full w-full"
                                    />
                                </div>
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
                    <div className="mb-2">{tutorialContent}</div>
                )}
                {part === 2 && (
                    <>
                        <div className="mb-2">
                            <img
                                src='https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true'
                                alt='telescope'
                                className="w-24 h-24 mb-2"
                            />
                        </div>
                        <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            {tutorialContent}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};