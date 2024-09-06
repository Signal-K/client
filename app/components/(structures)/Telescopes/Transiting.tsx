"use client";

import React, { useEffect, useState } from 'react';
// import { CreateFirstBaseClassification } from '../../_[archive]/Classifications/ClassificationForm';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet'; 

import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ClassificationForm from '../../(create)/(classifications)/PostForm';
import { Classification } from '@/types/Anomalies';

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

interface AnomalyClassificationProps {
    onAnomalyFetch: ( anomaly: Anomaly | null ) => void;
};

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
    const [imageUrl, setImageUrl] = useState<string>('');

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
                    .eq('anomalySet', 'planets2')
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

                // const { data: classificationData, error: classificationError } = await supabase
                //     .from('classifications')
                //     .select('*')
                //     .eq('anomaly', anomalyData.id)
                //     .eq('author', session.user.id)
                //     .maybeSingle();

                // if (classificationError) {
                //     throw classificationError;
                // };

                // if (classificationData) {
                //     setAnomaly(null);
                // } else {
                //     setAnomaly(anomalyData as Anomaly);
                //     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                //     setImageUrl(`${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyData.id}/Binned.png`);
                // };
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
    }, [session, supabase, activePlanet]); 

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
                <h3>{anomaly.content}</h3>
                {anomaly.avatar_url && (
                    <img src={anomaly.avatar_url} alt="Anomaly Avatar" className='w-24 h-24' />
                )}
                {imageUrl && (
                    <img src={imageUrl} alt="Binned Anomaly" />
                )}
            </div>
            <ClassificationForm 
                anomalyId={anomaly.id.toString()}
                anomalyType='planet' 
                missionNumber={1370103} 
                assetMentioned={imageUrl} 
                structureItemId={3103}
            />
        </div>
    );
};





// Define the `TransitingTelescopeClassifyPlanet` component
export const TransitingTelescopeClassifyPlanet: React.FC = () => {
    const { activePlanet } = useActivePlanet();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${activePlanet?.id}/phased.png`;

    return (
        <div className="flex flex-col items-center">
            <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} className="w-32 h-32 mb-4" />
            <p>Your mission is to analyze the phase-folded lightcurve of your home planet. Look closely at the pattern of dips and variations in brightness. This information helps determine if the planet is real.</p>
            <p>Here are some tips for classifying:</p>
            <ul className="list-disc pl-5 mb-4">
                <li>Look for Regular Dips: These dips often indicate a planet passing in front of its star. The regularity can confirm its orbit.</li>
                <li>Assess the Shape: A sharp, symmetrical dip is typical of a planet transit. Asymmetrical or irregular shapes might suggest other phenomena.</li>
            </ul>
            <p>Use these criteria to decide if the lightcurve reveals a legitimate planet. Write a post and click share when you're ready to submit your findings. Happy exploring!</p>
            {/* <CreateFirstBaseClassification assetMentioned={imageUrl} /> */}
        </div>
    );
};

// Define the `TransitingTelescopeSpecialisedGraphs` component
export const TransitingTelescopeSpecialisedGraphs: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Access advanced graphs and analytics for your lightcurves, adding more data and content to your new planet.</p>
            {/* Replace with actual specialized graphs content */}
        </div>
    );
};

// Define the `TransitingTelescopeExplorePlanets` component
export const TransitingTelescopeExplorePlanets: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Use your telescope to find other planet candidates and begin classifying them.</p>
            {/* Replace with actual exploration content */}
        </div>
    );
};

// Define the `TransitingTelescopeMyDiscoveries` component
export const TransitingTelescopeMyDiscoveries: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>View all your discoveries and classified lightcurves.</p>
            {/* Replace with actual discoveries content */}
        </div>
    );
};

// Define the `TransitingTelescopeTutorial` component
export const TransitingTelescopeTutorial: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Learn how to use the telescope and classify lightcurves.</p>
            {/* Replace with actual tutorial content */}
        </div>
    );
};

interface TelescopeProps {
    anomalyid: string;
};

// For the onboarding mission - please re-asses after
interface TelescopeProps {
    anomalyid: string;
};