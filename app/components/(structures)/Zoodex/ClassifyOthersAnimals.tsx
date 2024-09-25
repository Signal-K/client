"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from '../../(create)/(classifications)/PostForm';
import { zoodexDataSources } from "../Data/ZoodexDataSources";
import { StructureInfo } from "../structureInfo";

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
    const [anomalyType, setAnomalyType] = useState<string | null>(null);

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

                    // Set anomalyType based on the selected userChoice
                    const selectedMission = zoodexDataSources
                        .flatMap(category => category.items)
                        .find(item => item.identifier === userChoice);

                    if (selectedMission) {
                        setAnomalyType(selectedMission.identifier);
                    }
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

    const handleChoice = (choice: string) => {
        setUserChoice(choice);
        setAnomalyType(null); // Reset anomalyType when a new choice is made
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
                <StructureInfo structureName="Zoodex" />
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
            <StructureInfo structureName="Zoodex" />
            <div className="p-4 rounded-md relative w-full">
                <h3>{anomaly.content}</h3>
                {anomaly.avatar_url && (
                    <img src={anomaly.avatar_url} alt="Anomaly Avatar" className='w-24 h-24' />
                )}
                {imageUrl && (
                    <img src={imageUrl} alt="Binned Anomaly" />
                )}
            </div>
            {imageUrl && anomalyType && (
                <ClassificationForm 
                    anomalyId={anomaly.id.toString()}
                    anomalyType={anomalyType}
                    missionNumber={1370202}     
                    assetMentioned={imageUrl} 
                    structureItemId={3104}
                />
            )}
        </div>
    );
};

export function StarterZoodexGallery() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [userChoice, setUserChoice] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [configuration, setConfiguration] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [anomalyType, setAnomalyType] = useState<string | null>(null);
    const [folderPath, setFolderPath] = useState<string | null>(null);

    // Fetch structure configuration from the `inventory` table
    useEffect(() => {
        async function fetchStructureConfiguration() {
            if (!session) return;

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

                if (inventoryError) throw inventoryError;

                if (inventoryData && inventoryData.configuration) {
                    setConfiguration(inventoryData.configuration);
                } else {
                    setConfiguration(null);
                }
            } catch (error: any) {
                console.error('Error fetching structure config:', error.message || error);
                setError('Error fetching structure configuration: ' + (error.message || JSON.stringify(error)));
                setConfiguration(null);
            }
        }

        fetchStructureConfiguration();
    }, [session, supabase]);

    useEffect(() => {
        async function fetchAnomalyAndImages() {
            if (!session || !userChoice) {
                setLoading(false);
                return;
            }

            try {
                // Fetch anomaly based on user choice
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalytype", 'zoodexOthers')
                    .eq("anomalySet", userChoice)
                    .limit(1)
                    .single();

                if (anomalyError) throw anomalyError;

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                }

                setAnomaly(anomalyData as Anomaly);

                // Construct the folder path correctly
                const baseFolder = `zoodex`;
                const folder = `${baseFolder}/${userChoice}`; // Ensure this matches your folder structure
                const { data: files, error: storageError } = await supabase
                    .storage
                    .from('public')
                    .list(folder, { limit: 100 }); // Add limit if necessary to control response size

                if (storageError) throw storageError;

                console.log('Fetched files:', files); // Log the files fetched

                if (files && files.length > 0) {
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    // Construct the URLs correctly
                    const urls = files.map(file => `${supabaseUrl}/storage/v1/object/public/${folder}/${file.name}`);
                    setImageUrls(urls);
                    setFolderPath(folder); // Set the complete folder path
                } else {
                    setImageUrls([]);
                }

                // Set anomalyType based on the selected userChoice
                const selectedMission = zoodexDataSources
                    .flatMap(category => category.items)
                    .find(item => item.identifier === userChoice);

                if (selectedMission) {
                    setAnomalyType(selectedMission.identifier);
                }
            } catch (error: any) {
                console.error('Error fetching anomaly or images: ', error.message);
                setAnomaly(null);
                setImageUrls([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAnomalyAndImages();
    }, [session, supabase, userChoice, activePlanet]);

    const handleChoice = (choice: string) => {
        setUserChoice(choice);
        setAnomalyType(null);
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
                <StructureInfo structureName="Zoodex" />
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
                <p>{userChoice}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <StructureInfo structureName="Zoodex" />
            <div className="p-4 rounded-md relative w-full">
                {anomaly.avatar_url && (
                    <img src={anomaly.avatar_url} alt="Anomaly Avatar" className='w-24 h-24' />
                )}
            </div>

            {/* Display all the images from the directory */}
            <div className="grid grid-cols-3 gap-4">
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Anomaly ${index}`} className="w-32 h-32 object-cover" />
                    ))
                ) : (
                    <>
                        <p>No images found in the directory.</p>
                        <p>{userChoice}</p>
                    </>
                )}
            </div>

            {/* Show classification form if images are available */}
            {imageUrls.length > 0 && anomalyType && (
                <ClassificationForm 
                    anomalyId={anomaly.id.toString()}
                    anomalyType={anomalyType}
                    missionNumber={1370202}     
                    assetMentioned={imageUrls[0]}
                    structureItemId={3104}
                />
            )}
        </div>
    );
};