"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";

interface LidarProps { 
    anomalyId: string;
};

export const CloudspottingOnMarsTutorial: React.FC<LidarProps> = ({
    anomalyId
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/clouds/${anomalyId}.png`;

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
                <h3 className="text-xl font-bold text-[#85DDA2] mt-2 ml-4">Capt'n Cosmos</h3> 
            </div> */}
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Hello, and welcome to <strong>Cloudspotting on Mars!</strong>
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    <strong>We need your help finding clouds in Mars's atmosphere.</strong> <br />
                                    The Mars Climate Sounder (MCS) on NASA's Mars Reconnaissance Orbiter observes the atmosphere in the infrared to determine the temperature and ice and dust content.  <br />
                                    Its measurements point to water-ice clouds and carbon-dioxide clouds at very high altitudes.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    Clouds have been observed at Mars by various instruments on several orbiters (and rovers!). But there are so many clouds, a single individual cannot find them all on their own. <br />
                                    With help from you and other citizen scientists, we think tens of thousands of these clouds can be identified!
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    As your spacecraft moves through its orbit, clouds appear to rise from behind the atmosphere to a higher altitude and then fall again. This leads to an arch-like shape in the data. The peak of the arch is the real location of the cloud.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    You'll be presented with images that span four hours worth of MCS observations. From left to right, time moves forward as the spacecraft moves through its orbit. The vertical axis represents altitude (from 0 to 100 km) -- you'll see the brighter lower atmosphere on the bottom fading out higher in the atmosphere above. But sometimes high-altitude clouds appear as arches! Your goal is to search for arches like this. <br />
                                    <strong>To decide if something is an arch, look for two distinct legs and a peak </strong><br />
                                    Tell us what shape you see, how many clouds, and then the rough location in the text box
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Remember, you're looking for an arch with <strong>two legs and a peak</strong>. There are several bright streaks in the zoomed-in image below, but only the one on the left has two legs with a clear gap in between and a peak at the top.
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    Most images have about 2-3 arches. Here's an example with just 1-2:
                                </p>
                            )}
                            {line === 8 && (
                                <p className="text-[#EEEAD1]">
                                    Many have several arches throughout (sometimes more than 10):
                                </p>
                            )}
                            {line === 9 && (
                                <p className="text-[#EEEAD1]">
                                    Others have none at all:
                                </p>
                            )}
                            {line === 10 && (
                                <p className="text-[#EEEAD1]">
                                    You're ready to begin cloudspotting on Mars!
                                </p>
                            )}

                            {line > 1 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step1.jpeg"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 3 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step2.png"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 4 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step3.jpeg"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 5 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step4.png"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 6 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step5.png"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 7 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step6.jpeg"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 8 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step7.png"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 9 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step8.png"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 10 && (
                                        <img
                                            src="/assets/Docs/LIDAR/lidar-martianClouds/Step9.jpeg"
                                            alt="Tutorial step"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {line < 10 && (
                        <button
                            onClick={nextLine}
                            className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                        >
                            Next
                        </button>
                    )}
                    {line === 10 && (
                        <button
                            onClick={nextPart}
                            className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                        >
                            Continue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <div className="mb-2">
                        {tutorialContent}
                    </div>
                )}
                {part === 2 && (
                    <>
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                                <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                                <div className="bg-white bg-opacity-90">
                                    <img
                                        src={imageUrl}
                                        alt="LIDAR image - Cloud(s) from Mars"
                                        className="w-full h-96 object-cover rounded-t-md"
                                    />
                                </div>
                            </div>
                            <ClassificationForm
                                anomalyId={anomalyId}
                                anomalyType="cloud"
                                missionNumber={3000010}
                                assetMentioned={imageUrl}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};