"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/Structures/structureInfo";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";

interface ZoodexProps {
    anomalyId: string; 
};

export const BurrowingOwlTutorial: React.FC<ZoodexProps> = ({ 
    anomalyId
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-burrowingOwl/${anomalyId}.jpeg`;

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
                                    Hello, and welcome to the Burrowing Owl Classification
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    In this project, you will be reviewing a series of photos from motion-activated field cameras directed at burrowing owl nest entrances located in San Diego County. By identifying the owls and their approximate ages (juvenile or adult), behaviors, and other animal “visitors”, you will help researchers get a clearer picture of what burrowing owls are really up to.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    You will be identifying how many burrowing owls you see in each photo event. In each photo, select from the list of animals you see.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    Once you have found burrowing owls in the photos, choose how many you see and their approximate age. Do your best to select the behavior. <br /> 
                                    You may come across photos without any animals (or people) in them, or shadows of burrowing owls. Just choose “Nothing Here” and move on. If you see an animal but it is blurry or dark, or you can only see a part of it, please give your best guess as to what it is.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    <strong>Are there prey deliveries present?​</strong> <br />
                                    You should select “Yes” if you see an adult bird with prey in its beak, eating prey, or feeding something to chicks. Prey can include invertebrates, small birds, snakes, and small mammals.​ <br />
                                    <strong>Do you see one of these behaviors?​</strong> <br />
                                    Select the “Feeding” button if you are able to see beak-to-beak contact (indicating prey was exchanged), but you are not able to see a prey item. Feeding can be between adults, between adults and juveniles, and between juveniles.​
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    <strong>Is there evidence of a predation or mortality event?​</strong>
                                    Unfortunately, you might catch a predation event of a burrowing owl. This photo is an example of a Cooper's Hawk depredating a juvenile burrowing owl. Predators can include raptors, ravens, and coyotes.​ <br />
                                    Mortality events will include images of feather piles and carcasses of burrowing owls.
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    A male may hop on top of a female for breeding purposes. If you see this, select "Mating".
                                </p>
                            )}
                            {line === 8 && (
                                <p className="text-[#EEEAD1]">
                                    Occasionally if food resources are limited, parent birds will kill their offspring (infanticide). Remaining owls may eat the carcass (cannibalism). Siblings may also kill and eat weaker chicks (siblicide).​ If you see any of these behaviors, select "Infanticide".​
                                </p>
                            )}
                            {line === 9 && (
                                <p className="text-[#EEEAD1]">
                                    Let's get started!
                                </p>
                            )}

                            {line < 9 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step1.jpeg"
                                            alt="Step 2"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 3 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step2.png"
                                            alt="Step 3"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 4 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step3.png"
                                            alt="Step 4"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 5 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step4.jpeg"
                                            alt="Step 5"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 6 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step5.jpeg"
                                            alt="Step 6"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 7 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step6.png"
                                            alt="Step 6"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 8 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-burrowingOwl/Step7.jpeg"
                                            alt="Step 6"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                </div>
                            )}

                            {line < 9 && (
                                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Next
                                </button>
                            )}
                            {line === 9 && (
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
                    <div className="mb-2">
                        {tutorialContent}
                    </div>
                )}
                {part === 2 && (
                    <>
                        <div className="mb-2">
                            <StructureInfo
                                structureName="Zoodex"
                            />
                        </div>
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                                <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                                <div className="bg-white bg-opacity-90">
                                    <img
                                        src={imageUrl}
                                        alt="Burrowing Owl"
                                        className="w-full h-96 object-cover rounded-t-md"
                                    />
                                </div>
                            </div>
                            <ClassificationForm
                                anomalyId={anomalyId}
                                anomalyType="zoodex-burrowingOwl"
                                missionNumber={3000002}
                                assetMentioned={imageUrl}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export function BurrowingOwl() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check tutorial mission
    const [hasMission3000002, setHasMission3000002] = useState<boolean | null>(null);
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
                    .eq("anomalySet", "zoodex-burrowingOwl")

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-burrowingOwl/${randomAnomaly.id}.jpeg`);
            } catch (error: any) {
                console.error("Error fetching burrowing owl: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session, supabase, activePlanet]);

    // Check tutorial mission
    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", "3000002");

                if (missionError) throw missionError;

                setHasMission3000002(missionData.length > 0);
            } catch (error: any) {
                console.error("Error checking user mission: ", error.message || error);
                setHasMission3000002(false);
            } finally {
                setMissionLoading(false);
            };
        };

        checkTutorialMission();
    }, [session, supabase]);

    if (missionLoading) {
        return <div>Loading mission status...</div>;
    };

    if (!hasMission3000002) {
        return (
            <BurrowingOwlTutorial anomalyId={anomaly?.id.toString() || "4567867"} />
        );
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
                <p>The owls are sleeping, try again later</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="pb-4 rounded-md relative w-full">
                {imageUrl && (
                    <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="zoodex-burrowingOwl"
                    missionNumber={100000035}
                    assetMentioned={imageUrl || ""}
                    originatingStructure={3104}
                />
            </div>
        </div>
    );
};