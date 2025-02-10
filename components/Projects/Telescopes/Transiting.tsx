"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet'; 
import ClassificationForm from '@/components/Projects/(classifications)/PostForm';
import { planetClassificationConfig } from '@/components/Projects/(classifications)/FormConfigurations';
import PreferredTerrestrialClassifications from '@/components/Structures/Missions/PickPlanet';
import ImageAnnotator from '../(classifications)/Annotating/Annotator';

export interface Anomaly {
    id: bigint;
    content: string;
    avatar_url?: string; 
};

interface SelectedAnomProps {
    anomalyid?: number;
}; 

export function StarterTelescopeTess({ anomalyid }: SelectedAnomProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMission3000001, setHasMission3000001] = useState<boolean | null>(null);
    const [missionLoading, setMissionLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;
            try {
                const { data: missionData, error: missionError } = await supabase
                    .from('missions')
                    .select('id')
                    .eq('user', session.user.id)
                    .eq('mission', 3000001);
                if (missionError) throw missionError;
                setHasMission3000001(missionData && missionData.length > 0);
            } catch (error: any) {
                console.error('Error checking user mission: ', error.message || error);
                setHasMission3000001(false);
            } finally {
                setMissionLoading(false);
            };
        };
        checkTutorialMission();
    }, [session, supabase]);

    useEffect(() => {
        const fetchAnomalies = async () => {
            if (!session) {
                setLoading(false);
                return;
            }
            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "telescope-tess");
                if (anomalyError) throw anomalyError;

                setAnomalies(anomalyData || []);
                if (anomalyData?.length > 0) {
                    const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)];
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-default-supabase-url.com';
                    const imageList = [];

                    if (randomAnomaly?.avatar_url) {
                        imageList.push(randomAnomaly.avatar_url);
                    };

                    if (randomAnomaly?.id) {
                        const binnedUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${randomAnomaly.id}/Binned.png`;
                        const sectorUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${randomAnomaly.id}/Sector1.png`;
                        imageList.push(binnedUrl, sectorUrl); 
                    };

                    setImageUrls(imageList);
                    setSelectedAnomaly(randomAnomaly);
                }
            } catch (error: any) {
                console.error("Error fetching anomalies:", error.message || error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnomalies();
    }, [session, supabase]);

    if (error) return <div><p>{error}</p></div>;
    if (missionLoading || hasMission3000001 === null) return <div>Loading...</div>;
    if (!hasMission3000001) {
        return (
            <div>
                <FirstTelescopeClassification anomalyid={"6"} />
            </div>
        );
    }
    if (loading) return <div><p>Loading...</p></div>;
    if (!anomalies.length) return <div><p>No anomaly found.</p></div>;

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 rounded-md relative w-full">
                {/* {imageUrls.length > 0 && (
                    <div className="relative w-full">
                        <div className="carousel relative">
                            {imageUrls.map((url, index) => (
                                <div
                                    key={index}
                                    id={`slide-${index}`}
                                    className="carousel-item relative w-full h-64 flex-shrink-0"
                                >
                                    <img src={url} alt={`Anomaly Image ${index + 1}`} className="w-full h-full object-contain rounded-lg" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center space-x-2 mt-4">
                            {imageUrls.map((_, index) => (
                                <a
                                    key={index}
                                    href={`#slide-${index}`}
                                    className="w-3 h-3 rounded-full bg-gray-400 hover:bg-blue-500 transition"
                                ></a>
                            ))}
                        </div>
                    </div>
                )} */}
                {selectedAnomaly && (
                    <ImageAnnotator
                        // otherAssets={imageUrls}
                        anomalyType='planet'
                        missionNumber={1372001}
                        structureItemId={3103}
                        assetMentioned={selectedAnomaly.id.toString()}
                        annotationType='PH'
                        initialImageUrl={imageUrls[1]}
                        anomalyId={selectedAnomaly.id.toString()}
                        //parentPlanetLocation...
                    />
                    // <ClassificationForm
                    //     anomalyId={selectedAnomaly.id.toString()}
                    //     anomalyType="planet"
                    //     missionNumber={1372001}
                    //     assetMentioned={selectedAnomaly?.id.toString()}
                    //     structureItemId={3103}
                    // />
                )}
            </div>
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
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            {/* <div className="flex items-center">
                <img
                    src="/assets/Captn.jpg"
                    alt="Cosmos Avatar"
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
                            <ClassificationForm anomalyId={anomalyid} anomalyType='planet' missionNumber={3000001} assetMentioned={imageUrl} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};