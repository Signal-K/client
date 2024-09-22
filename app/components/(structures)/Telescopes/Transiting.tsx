"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet'; 
import ClassificationForm from '../../(create)/(classifications)/PostForm';

export interface Anomaly {
    id: bigint;
    content: string;
    avatar_url?: string;
};

export function StarterTelescope() {
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
                    .eq('item', 3103) // Replace with the correct item ID for Telescope
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
    }, [session, supabase, activePlanet]);

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
                    .eq("anomalySet", userChoice) // Use the user choice to filter anomalies
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

                setAnomaly(anomalyData as Anomaly);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyData.id}/Binned.png`);
            } catch (error: any) {
                console.error('Error fetching anomaly: ', error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly(); 
    }, [session, supabase, userChoice, activePlanet]);

    const handleChoice = (choice: string) => {
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
                <p className="text-sm font-bold">Choose a target to observe using your Telescope:</p>
                {configuration["missions unlocked"] && Array.isArray(configuration["missions unlocked"]) && configuration["missions unlocked"].length > 0 ? (
                    configuration["missions unlocked"].map((missionId: string) => (
                        <button
                            key={missionId}
                            onClick={() => handleChoice(missionId)}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700"
                        >
                            {missionId} {/* Replace with actual mission names if available */}
                        </button>
                    ))
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
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
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
                    anomalyType='telescope'  
                    missionNumber={1372001} 
                    assetMentioned={imageUrl} 
                    structureItemId={3103} // Replace with correct structure item ID
                />
            )}
        </div>
    );
};


interface TelescopeProps {
    anomalyid: string;
};

export const FirstTelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid || activePlanet?.id}/Binned.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine(prevLine => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1); 
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="flex items-center">
                <img
                    src="/assets/Captn.jpg"
                    alt="Cosmos Avatar"
                    className="w-12 h-12 rounded-full bg-[#303F51]"
                />
                <h3 className="text-xl font-bold text-[#85DDA2] mt-2 ml-4">Cosmos</h3>
            </div>
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">Hello there! To start your journey, you'll need to discover your first planet.</p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">To determine if a planet is real, you'll need to examine a lightcurve and identify patterns in dips and variations.</p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">Look for regular dips—these often signal a planet passing in front of its star and can confirm its orbit.</p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">Pay attention to the shape of these dips: a sharp, symmetrical dip usually indicates a genuine planet transit...</p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">...While asymmetrical or irregular shapes might suggest something else.</p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">Let's give it a try! Identify the dips in this lightcurve:</p>
                            )}
                            {line < 6 && (
                                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">Next</button>
                            )}
                            {line === 6 && (
                                <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">Continue</button>
                            )}
                            {line < 6 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 1 && <img src="/assets/Template.png" alt="Step 1" className="max-w-full max-h-full object-contain" />}
                                    {line === 2 && <img src="/assets/Docs/Curves/Step2.png" alt="Step 2" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 3 && <img src="/assets/Docs/Curves/Step1.png" alt="Step 3" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 4 && <img src="/assets/Docs/Curves/Step3.png" alt="Step 4" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 5 && <img src="/assets/Docs/Curves/Step4.png" alt="Step 5" className="max-w-full max-h-full object-contain bg-white" />}
                                </div>
                            )}
                        </>
                    )}
                    {part === 2 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">Great job! Once you've identified your planet, you can share your findings with the rest of the space sailors community.</p>
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
                        {/* {tutorialContent} */}
                        <div className="mb-2">
                            <img
                                src='https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true'
                                alt='telescope'
                                className="w-24 h-24 mb-2"
                            />
                        </div>
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className='relative'>
                                <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                                <div className='bg-white bg-opacity-90'><img
                                    src={imageUrl}
                                    alt={`Active Planet ${activePlanet?.id}`}
                                    className="relative z-10 w-128 h-128 object-contain"
                                /></div>
                            </div>
                            <ClassificationForm anomalyId={anomalyid} anomalyType='planet' missionNumber={1370103} assetMentioned={imageUrl} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};