"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { Button } from "@/components/ui/button";
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
  name: string;
  details?: string;
};

interface DailyMinorPlanetProps {
  anomalyid: string;
}

export function DailyMinorPlanetWithId({ anomalyid }: DailyMinorPlanetProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnomaly = async () => {
    try {
      const { data: anomalyData, error: anomalyError } = await supabase
        .from('anomalies')
        .select('*')
        .eq('anomalySet', 'telescope-minorPlanet')
        .eq('id', anomalyid);

      if (anomalyError) throw anomalyError;

      setAnomaly(anomalyData[0]);

      const images = [1, 2, 3, 4].map(
        (i) =>
          `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}/${i}.png`
      );

      setImageUrls(images);
    } catch (error: any) {
      console.error('Error fetching anomaly:', error.message);
      setAnomaly(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomaly();
  }, [session]);

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) return <p>Loading...</p>;

  if (!anomaly) return <p>No anomaly found.</p>;

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
      <div className="p-4 rounded-md relative w-full">
        {imageUrls.length > 0 && (
          <div className="relative">
            <img
              src={imageUrls[currentImageIndex]}
              alt={`Anomaly ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            <button onClick={handlePrevious} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full">
              ❮
            </button>
            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full">
              ❯
            </button>
            <div className="flex justify-center mt-2">
              {imageUrls.map((_, index) => (
                <span key={index} className={`h-2 w-2 rounded-full mx-1 ${index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
      {imageUrls.length > 0 && (
        <div className="flex w-full gap-2 mt-4">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-1 h-16 object-cover cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'}`}
            />
          ))}
        </div>
      )}

      {imageUrls.length > 0 && (
        <ClassificationForm
          anomalyId={anomaly?.id || '90670192'}
          anomalyType="telescope-minorPlanet"
          missionNumber={20000003}
          assetMentioned={imageUrls}
          structureItemId={3103}
        />
      )}
    </div>
  );
};


export function DailyMinorPlanet() {
    const supabase = useSupabaseClient(); 
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const fetchAnomaly = async () => {
            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "telescope-minorPlanet");

                if (anomalyError) {
                    throw anomalyError;
                }

                if (!anomalyData || anomalyData.length === 0) {
                    console.warn("No anomalies found for telescope-minorPlanet");
                    setAnomaly(null);
                    return;
                }

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);

                const imageUrls = [
                    `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${randomAnomaly.id}/1.png`,
                    `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${randomAnomaly.id}/2.png`,
                    `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${randomAnomaly.id}/3.png`,
                    `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${randomAnomaly.id}/4.png`
                ];

                setImageUrls(imageUrls);

                console.log("Anomaly ID:", randomAnomaly.id);
                console.log("Image URLs:", imageUrls);
            } catch (error: any) {
                console.error("Error fetching anomaly", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnomaly();
    }, [session, supabase]);

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!anomaly) {
        return (
            <div>
                <p>No anomaly found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrls.length > 0 && (
                    <div className="relative">
                        <img
                            src={imageUrls[currentImageIndex]}
                            alt={`Anomaly ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={handlePrevious}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full"
                        >
                            ❮
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full"
                        >
                            ❯
                        </button>
                        <div className="flex justify-center mt-2">
                            {imageUrls.map((_, index) => (
                                <span
                                    key={index}
                                    className={`h-2 w-2 rounded-full mx-1 ${index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {imageUrls.length > 0 && (
                <div className="flex w-full gap-2 mt-4">
                    {imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-1 h-16 object-cover cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'}`}
                        />
                    ))}
                </div>
            )}

            <Button className='mt-4' onClick={() => setShowTutorial(true)}>Show Tutorial</Button>

            {imageUrls.length > 0 && (
                <ClassificationForm
                    anomalyId={anomaly?.id.toString() || "90670192"}
                    anomalyType='telescope-minorPlanet'
                    missionNumber={20000003}
                    assetMentioned={imageUrls}
                    structureItemId={3103}
                />
            )}
        </div>
    );
};