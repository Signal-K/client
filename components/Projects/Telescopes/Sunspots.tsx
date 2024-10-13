"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/Structures/structureInfo";
import { ClassificationFormComponentT } from "@/components/Projects/(classifications)/MegaClassificationForm";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";

interface TelescopeProps {
    anomalyId: string;
};

const SunspotDetectorTutorial: React.FC<TelescopeProps> = ({
    anomalyId,
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyId}.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);
    const nextLine = () => setLine(prevLine => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
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
                                    Hello, and welcome to the Sunspot Classification
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    You will be shown small subsets of the sunspot drawings and you would have to input the number of spots you see in the text box below
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    For this exercise, as spots we refer to all dark markings made by the observer to represent a solar feature. That includes small dots, like the ones shown on the right side of this image, but also bigger structures like the one on the left. In this example one should count 6 spots as marked on the right panel.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    The image sizes vary significantly because each includes only a single group of sunspots. You do not need to zoom in the images to search for smaller features, as these would only be smudges.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    Pay attention to not count as spots the various lines, writings, and smudges that these images have
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Let's get started!
                                </p>
                            )}
                            {line < 6 && (
                                <button 
                                    onClick={nextLine} 
                                    className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                >
                                    Next
                                </button>
                            )}
                            {line === 6 && (
                                <button 
                                    onClick={nextPart}
                                    className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                >
                                    Continue
                                </button>
                            )}
                            {line < 6 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && <img 
                                        src="/assets/Docs/Telescopes/Sunspots/Step1.png" 
                                        alt="Step 2" 
                                        className="max-w-full max-h-full object-contain bg-white" 
                                    />}
                                    {line === 3 && <img 
                                        src="/assets/Docs/Telescopes/Sunspots/Step2.png" 
                                        alt="Step 3" 
                                        className="max-w-full max-h-full object-contain bg-white" 
                                    />}
                                    {line === 4 && <img 
                                        src="/assets/Docs/Telescopes/Sunspots/Step3.png" 
                                        alt="Step 4" 
                                        className="max-w-full max-h-full object-contain bg-white" 
                                    />}
                                    {line === 5 && <img 
                                        src="/assets/Docs/Telescopes/Sunspots/Step4.png" 
                                        alt="Step 5" 
                                        className="max-w-full max-h-full object-contain bg-white"   
                                    />}
                                </div>
                            )}
                        </>
                    )}
                    {part === 2 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Great job! Feel free to classify another sunspot, if you'd like
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
                        <div></div>
                    </div>
                )}
                {part === 2 && (
                    <>
                        {/* <div className="mb-2">
                            <StructureInfo structureName="Telescope" />
                            <img
                                src='https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true'
                                alt='telescope'
                                className="w-24 h-24 mb-2"
                            />
                        </div> */}
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                                <div className=" absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                                <div className="bg-white bg-opacity-90">
                                    <img
                                        src={imageUrl}
                                        alt="Sunspot"
                                        className="relative z-10 w-128 h-128 object-contain"
                                    />
                                </div>
                            </div>
                            {/* <ClassificationFormComponentT anomalyId={anomalyId} anomalyType='sunspot' missionNumber={3000003} assetMentioned={imageUrl} onSubmit={function (data: any): void {
                                throw new Error("Function not implemented.");
                            } } /> */}
                            <ClassificationForm anomalyId={anomalyId} anomalyType='sunspot' missionNumber={3000003} assetMentioned={imageUrl} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

import { Anomaly } from "./Transiting";

export function TelescopeSunspotDetector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };
    
            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "sunspot")
                    .limit(1)
                    .maybeSingle();
    
                if (anomalyError) {
                    throw anomalyError;
                };
    
                if (!anomalyData) {
                    setLoading(false);
                    setAnomaly(null);
                    return;
                };
    
                const fetchedAnomaly = anomalyData as Anomaly;
                setAnomaly(fetchedAnomaly);
    
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${fetchedAnomaly.id}.png`);
            } catch (error: any) {
                console.error("Error fetching sunspot: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };
    
        fetchAnomaly();
    }, [session, supabase, activePlanet]);
    

    const [hasMission3000003, setHasMission3000003] = useState<boolean>(false);
    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) {
                return;
            };

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", "3000003")
                    .single();
                
                if (missionError) {
                    throw missionError;
                };

                if (missionData) {
                    setHasMission3000003(true);
                };
            } catch (error: any) {
                console.error("Error checking tutorial mission: ", error.message);
                setHasMission3000003(false);
            };
        };

        checkTutorialMission();
    }, [session, supabase]);

    if (!hasMission3000003) {
        return <SunspotDetectorTutorial anomalyId={anomaly?.id?.toString() || "101266259"} />;
    };

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>Looks like the sun's inactive at the moment. Check back when we have more data!</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    <img src={imageUrl} alt="Sunspot" className="w-full h-full object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="sunspot"
                    missionNumber={100000032}
                    assetMentioned={imageUrl || ""}
                    originatingStructure={3103}
                />
            </div>
        </div>
    );
};