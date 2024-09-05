"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from '../../(create)/(classifications)/PostForm';

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
    const [loading, setLoading] = useState<boolean>(true);

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

    if (!userChoice) {
        return (
            <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
                <h2 className="text-lg font-bold">Choose Anomaly Set:</h2>
                <button
                    onClick={() => handleChoice('burrowingOwls')}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700"
                >
                    Burrowing Owls
                </button>
                <button
                    onClick={() => handleChoice('burrowingOwl')}
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-green-700"
                >
                    Burrowing Owl
                </button>
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
                    anomalyType='zoodex-burrowingOwl' 
                    missionNumber={1370103} 
                    assetMentioned={imageUrl} 
                />
            )}
        </div>
    );
};