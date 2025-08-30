"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "@/src/components/research/projects/(classifications)/PostForm";

interface SelectedAnomalyProps {
    anomalyid: number;
};

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
                    </div>
                )}
                {part === 2 && (
                    <>
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

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

export function StarterSunspot({ anomalyId }: { anomalyId?: string }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [linkedRow, setLinkedRow] = useState<any | null>(null);
    const [unlocking, setUnlocking] = useState(false);
    const [now, setNow] = useState<Date>(new Date());

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const automatonType = "TelescopeSolar";

    useEffect(() => {
        async function fetchData() {
            if (!session) {
                setLoading(false);
                return;
            }
            try {
                // If anomalyId is provided, fetch that anomaly directly
                if (anomalyId) {
                    const { data: anomalyData, error: anomalyError } = await supabase
                        .from("anomalies")
                        .select("*")
                        .eq("id", anomalyId)
                        .limit(1);
                    if (anomalyError) throw anomalyError;
                    const anomalyObj = anomalyData && anomalyData.length > 0 ? anomalyData[0] : null;
                    setAnomaly(anomalyObj);
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyId}.png`);
                    setLinkedRow(null); // No linked row context for direct anomaly
                } else {
                    // Get linked anomaly row for user
                    const { data: linkedData, error: linkedError } = await supabase
                        .from("linked_anomalies")
                        .select("*")
                        .eq("author", session.user.id)
                        .eq("automaton", automatonType)
                        .order("date", { ascending: false })
                        .limit(1);
                    if (linkedError) throw linkedError;
                    const row = linkedData && linkedData.length > 0 ? linkedData[0] : null;
                    setLinkedRow(row);

                    // If row exists, get anomaly
                    if (row) {
                        const { data: anomalyData, error: anomalyError } = await supabase
                            .from("anomalies")
                            .select("*")
                            .eq("id", row.anomaly_id)
                            .limit(1);
                        if (anomalyError) throw anomalyError;
                        const anomalyObj = anomalyData && anomalyData.length > 0 ? anomalyData[0] : null;
                        setAnomaly(anomalyObj);
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${row.anomaly_id}.png`);
                    } else {
                        setAnomaly(null);
                        setImageUrl("");
                    }
                }
            } catch (error: any) {
                setError("Unable to load anomaly.");
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, [session, anomalyId]);

    // Helper: is unlocked
    function isUnlocked(row: any) {
        if (!row?.date) return false;
        const unlockTime = new Date(row.date);
        unlockTime.setDate(unlockTime.getDate() + 1);
        return now >= unlockTime || row.unlocked;
    }
    // Helper: time until unlock
    function timeUntilUnlock(row: any) {
        if (!row?.date) return 0;
        const unlockTime = new Date(row.date);
        unlockTime.setDate(unlockTime.getDate() + 1);
        return Math.max(0, unlockTime.getTime() - now.getTime());
    }

    // Unlock handler
    async function handleUnlock() {
        if (!linkedRow) return;
        setUnlocking(true);
        await supabase
            .from("linked_anomalies")
            .update({ unlocked: true })
            .eq("id", linkedRow.id);
        setUnlocking(false);
        // Refresh
        const { data: updated, error } = await supabase
            .from("linked_anomalies")
            .select("*")
            .eq("id", linkedRow.id)
            .limit(1);
        setLinkedRow(updated && updated.length > 0 ? updated[0] : linkedRow);
    }

    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (loading) return <div className="text-white p-4">Loading...</div>;

    return (
        <div className="w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col gap-2 px-4">
            {/* Top Button Bar */}
            <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-2 flex justify-center items-center flex-shrink-0 gap-2">
                <button
                    className="px-4 py-2 bg-[#D689E3] text-white rounded"
                    onClick={() => setShowTutorial(true)}
                >
                    Want a walkthrough? Start the tutorial
                </button>
                {/* Count sunspots button logic */}
                {!anomalyId && linkedRow && anomaly ? (
                    isUnlocked(linkedRow) ? (
                        <button
                            className="px-4 py-2 bg-[#85DDA2] text-black rounded font-bold"
                            onClick={() => window.location.href = `/structures/telescope/sunspot/db-${linkedRow.anomaly_id}/count`}
                        >
                            Count Sunspots
                        </button>
                    ) : (
                        timeUntilUnlock(linkedRow) > 0 ? (
                            <button
                                className="px-4 py-2 bg-[#FFD700] text-black rounded font-bold"
                                disabled
                            >
                                Unlocks in {Math.ceil(timeUntilUnlock(linkedRow) / 3600000)} hours
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 bg-[#FFD700] text-black rounded font-bold"
                                onClick={handleUnlock}
                                disabled={unlocking}
                            >
                                {unlocking ? "Unlocking..." : "Unlock Sunspot"}
                            </button>
                        )
                    )
                ) : null}
            </div>
            {/* Main content area */}
            <div className="flex-1 w-full rounded-xl bg-white/10 backdrop-blur-md shadow-md p-2 overflow-hidden flex min-h-0">
                {showTutorial && anomaly ? (
                    <div className="flex-1 overflow-y-auto">
                        <SunspotDetectorTutorial anomalyId={anomaly.id.toString()} />
                    </div>
                ) : (
                    anomaly && imageUrl ? (
                        <div className="flex-1 overflow-y-auto">
                            <ImageAnnotator
                                initialImageUrl={imageUrl}
                                anomalyId={anomaly.id.toString()}
                                anomalyType="sunspot"
                                assetMentioned={imageUrl}
                                structureItemId={3103}
                                missionNumber={5055655555}
                                annotationType="Sunspots"
                            />
                        </div>
                    ) : (
                        <div className="text-white p-4">No sunspots available now</div>
                    )
                )}
            </div>
        </div>
    );
}