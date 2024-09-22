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

export function StarterZoodex() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [userChoice, setUserChoice] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>('');
    const [configuration, setConfiguration] = useState<any | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch structure configuration from the `inventory` table
    useEffect(() => {
        async function fetchStructureConfiguration() {
            if (!session) {
                return;
            };

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('configuration')
                    .eq('item', 3104)
                    .eq('anomaly', activePlanet.id)
                    .eq('owner', session.user.id)
                    .order('id', { ascending: true })
                    .limit(1)
                    .single();

                if (inventoryError) {
                    throw inventoryError;
                };

                if (inventoryData && inventoryData.configuration) {
                    console.log("Raw configuration data:", inventoryData.configuration);
                    setConfiguration(inventoryData.configuration);
                } else {
                    setConfiguration(null);
                };
            } catch (error: any) {
                console.error('Error fetching structure config:', error.message || error);
                setError('Error fetching structure configuration: ' + (error.message || JSON.stringify(error)));
                setConfiguration(null);
            };
        };

        fetchStructureConfiguration();
    }, [session, supabase]);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session || !userChoice) {
                setLoading(false);
                return;
            };

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
                };

                if (!anomalyData) {
                    setAnomaly(null); 
                    setLoading(false);
                    return;
                };

                const { data: classificationData, error: classificationError } = await supabase
                    .from('classifications')
                    .select('*')
                    .eq('anomaly', anomalyData.id)
                    .eq('author', session.user.id)
                    .maybeSingle();

                if (classificationError) {
                    throw classificationError;
                };

                if (classificationData) {
                    setAnomaly(null);
                } else {
                    setAnomaly(anomalyData as Anomaly);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/${userChoice}/${anomalyData.id}.jpeg`);
                };
            } catch (error: any) {
                console.error('Error fetching anomaly: ', error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly(); 
    }, [session, supabase, userChoice, activePlanet]);

    const handleChoice = ( choice: string ) => {
        setUserChoice(choice);
    };

    if (error) {
        return (
            <div>
                <p>{error}</p>
            </div>
        );
    }

    if (!configuration) {
        return (
            <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
                <p className="text-sm font-bold">Fetching structure configuration...</p>
            </div>
        );
    }

    if (!userChoice) {
        return (
            <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
                <p className="text-sm font-bold">You've been given some animals to observe and compare to their mannerisms on Earth. As you progress, more species will become available.</p>
                <h2 className="text-lg font-bold">Choose a data source: </h2>
                {configuration["missions unlocked"] && Array.isArray(configuration["missions unlocked"]) && configuration["missions unlocked"].length > 0 ? (
                    configuration["missions unlocked"].map((missionId: string) => {
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
                <p>No anomaly found.</p>
                <p>{userChoice}</p>
            </div>
        );
    };

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
                    anomalyType='zoodex-burrowingOwl' 
                    missionNumber={1370202}     
                    assetMentioned={imageUrl} 
                    structureItemId={3104}
                />
            )}
        </div>
    );
};