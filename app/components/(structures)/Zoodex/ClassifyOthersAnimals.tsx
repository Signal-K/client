"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from '../../(create)/(classifications)/PostForm';
import { zoodexDataSources } from "../Data/ZoodexDataSources";

export interface Anomaly {
    id: bigint;
    content: string;
    avatar_url?: string;
};

interface Configuration {
    Uses: number;
    missions_unlocked: string[];
};

export function StarterZoodex() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [userChoice, setUserChoice] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [configuration, setConfiguration] = useState<Configuration | null>(null);

    useEffect(() => {
        async function fetchStructureConfig() {
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("item", 3104)  // Replace with the correct item value if needed
                    .eq("owner", session.user.id)
                    .order("id", { ascending: true })
                    .limit(1)
                    .single();

                if (error) throw error;

                if (data) {
                    // Parse the configuration field if it's a valid JSON
                    const parsedConfig = data.configuration ? JSON.parse(data.configuration) : null;
                    setConfiguration(parsedConfig);
                }
            } catch (error: any) {
                console.error("Error fetching structure config:", error.message);
                setConfiguration(null);
            }
        }

        fetchStructureConfig();
    }, [session, supabase]);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session || !userChoice) {
                setLoading(false);
                return;
            }

            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalytype", 'zoodexOthers')
                    .eq("anomalySet", userChoice)
                    .limit(1)
                    .single();

                if (anomalyError) {
                    throw anomalyError;
                }

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                }

                const { data: classificationData, error: classificationError } = await supabase
                    .from('classifications')
                    .select('*')
                    .eq('anomaly', anomalyData.id)
                    .eq('author', session.user.id)
                    .maybeSingle();

                if (classificationError) {
                    throw classificationError;
                }

                if (classificationData) {
                    setAnomaly(null);
                } else {
                    setAnomaly(anomalyData as Anomaly);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/${userChoice}/${anomalyData.id}.jpeg`);
                }
            } catch (error: any) {
                console.error('Error fetching anomaly: ', error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }

        fetchAnomaly();
    }, [session, supabase, userChoice, activePlanet]);

    const handleChoice = (choice: string) => {
        setUserChoice(choice);
    };

    if (!configuration) {
        return (
            <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
                <p className="text-sm font-bold">
                    Fetching configuration data...
                </p>
            </div>
        );
    }

    if (!userChoice) {
        return (
            <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
                <p className="text-sm font-bold">You've been given some animals to observe the behaviour of and compare to their mannerisms on Earth. As you progress, more species will become available</p>
                <h2 className="text-lg font-bold">Choose a data source:</h2>

                {configuration?.missions_unlocked && Array.isArray(configuration.missions_unlocked) && configuration.missions_unlocked.length > 0 ? (
                    configuration.missions_unlocked.map((missionId) => {
                        const mission = zoodexDataSources
                            .flatMap((category) => category.items)
                            .find((item) => item.identifier === missionId);

                        if (!mission) return null;

                        return (
                            <button
                                key={mission.identifier}
                                onClick={() => handleChoice(mission.identifier)}
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700"
                            >
                                {mission.name}
                            </button>
                        );
                    })
                ) : (
                    <p>No missions unlocked.</p>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!anomaly) {
        return (
            <div>
                <p>No anomaly found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
                <h3>{anomaly.content}</h3>
                {anomaly.avatar_url && (
                    <img src={anomaly.avatar_url} alt="Anomaly Avatar" className='w-24 h-24' />
                )}
                {imageUrl && (
                    <img src={imageUrl} alt="Binned Anomaly" />
                )}
            </div>
            {imageUrl && (
                <ClassificationForm 
                    anomalyId={anomaly.id.toString()}
                    anomalyType={userChoice}  // Use userChoice as anomalyType
                    missionNumber={1370202}     // Adjust missionNumber if needed
                    assetMentioned={imageUrl} 
                    structureItemId={3104}
                />
            )}
        </div>
    );
};