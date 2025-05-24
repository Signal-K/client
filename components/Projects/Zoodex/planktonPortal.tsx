"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";
import { Button } from "@/components/ui/button";

interface ZoodexProps {
    anomalyId: string; 
};

export const PlanktonPortalTutorial: React.FC<ZoodexProps> = ({ anomalyId }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-planktonPortal/${anomalyId}.jpeg`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine((prevLine) => prevLine + 1);
    const nextPart = () => setPart((prevPart) => prevPart + 1);

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && <p className="text-[#EEEAD1]">Hello, and welcome to Plankton Portal!</p>}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    In this project, you'll be marking images of plankton—tiny oceanic organisms—taken by an underwater imaging system. Because plankton are an important food source and a strong indicator of the health of a marine biome, they can teach us many things about our planet's oceans.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    You'll be given a series of images to collect and identify the type of plankton that are visible. You can use the text box to add more comments and ask questions
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    Don't worry too much if you aren't 100% sure—we just want your best guess, no matter what! Many people will see each image, and everyone's classifications will be combined to produce a result. The wisdom of crowds tends to give the right answer.
                                </p>
                            )}
                            {line === 5 && <p className="text-[#EEEAD1]">Let's get started!</p>}

                            {line < 6 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-PlanktonPortal/Step1.png"
                                            alt="Step 2"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 3 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-PlanktonPortal/Step2.png"
                                            alt="Step 3"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 4 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-PlanktonPortal/Step3.png"
                                            alt="Step 4"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 5 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-PlanktonPortal/Step4.png"
                                            alt="Step 5"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                </div>
                            )}

                            {line < 5 && (
                                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Next
                                </button>
                            )}
                            {line === 5 && (
                                <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Continue
                                </button>
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
                    <div className="mb-1">{tutorialContent}</div>
                )}
                {part === 2 && (
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="relative">
                            <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0">
                                <div className="bg-white bg-opacity-60">
                                    <img
                                        src={imageUrl}
                                        alt="Plankton image"
                                        className="w-full h-96 object-cover rounded-t-md"
                                    />
                                </div>
                            </div>
                            <ClassificationForm
                                anomalyId={anomalyId}
                                anomalyType="zoodex-planktonPortal"
                                missionNumber={200000012}
                                assetMentioned={imageUrl}
                                structureItemId={3104}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export function PlanktonPortalFrame() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [hasMission200000012, setHasMission200000012] = useState<boolean | null>(null);
    const [missionLoading, setMissionLoading] = useState<boolean>(true);

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
                    .eq("anomalySet", "zoodex-planktonPortal");
    
                if (anomalyError) throw anomalyError;
                if (!anomalyData || anomalyData.length === 0) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };
    
                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
    
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-planktonPortal/${randomAnomaly.id}.jpeg`;
                setImageUrl(imageUrl);
            } catch (error: any) {
                console.error("Error fetching plankton anomaly: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };
    
        fetchAnomaly();
    }, [session, supabase, activePlanet]);
    

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", "200000010");

                if (missionError) throw missionError;

                setHasMission200000012(missionData.length > 0);
            } catch (error: any) {
                console.error("Error checking user mission: ", error.message || error);
                setHasMission200000012(false);
            } finally {
                setMissionLoading(false);
            };
        };

        checkTutorialMission();
    }, [session, supabase]);

    if (missionLoading) {
        return (
            <div>
                Loading mission status...
            </div>
        );
    };

    // if (!hasMission200000012) {
    //     return anomaly ? (
    //         <PlanktonPortalTutorial anomalyId={anomaly.id.toString()} />
    //     ) : (
    //         <div>
    //             Loading tutorial...
    //         </div>
    //     );
    // };    

    if (loading) {
        return (
            <div className="mb-1">
                <p>
                    Loading...
                </p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>The plankton are hiding, try again later</p>
            </div>
        );
    };

    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    if (showTutorial) {
        return (
            <PlanktonPortalTutorial anomalyId={anomaly.id.toString()} />
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="pb-4 rounded-md relative w-full">
                <Button variant="default" onClick={() => setShowTutorial(!showTutorial)}>Show tutorial</Button>
                {imageUrl && (
                    <img src={imageUrl} alt={anomaly?.content} className="w-full h-64 object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly?.id.toString() || ""}
                    anomalyType="zoodex-planktonPortal"
                    missionNumber={200000012}
                    assetMentioned={imageUrl || ""}
                    structureItemId={3104}
                />
            </div>
        </div>
    );
};

interface PlanktonPortalPass {
    anomalyid: string;
};

export function PlanktonPortalPass ( { anomalyid }: PlanktonPortalPass ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-planktonPortal/${anomalyid}.jpeg`;

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="pb-4 rounded-md relative w-full">
                <ClassificationForm
                    anomalyId={anomalyid || ""}
                    anomalyType="zoodex-planktonPortal"
                    missionNumber={200000012}
                    assetMentioned={imageUrl || ""}
                    structureItemId={3104}
                />
            </div>
        </div>
    );
};