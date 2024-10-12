"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { ClassificationOutput } from "./ClassificationResults";
import IntroduceUserToResearch from "../../(scenes)/chapters/(onboarding)/initialiseResearch";

import { zoodexSouthCoastFaunaRecovery, 
    cloudClassificationOptions, 
    initialCloudClassificationOptions, 
    roverImgClassificationOptions, 
    lidarEarthCloudsReadClassificationOptions, 
    lidarEarthCloudsUploadClassificationOptions, 
    planetClassificationOptions, 
    planktonPortalClassificationOptions, 
    penguinWatchClassificationOptions, 
    diskDetectorClassificationOptions, 
    zoodexIguanasFromAboveClassificationOptions, 
    zoodexBurrowingOwlClassificationOptions, 
    sunspotsConfigurationTemporary 
} from '@/content/Classifications/Options';
// import UserAvatar, { UserAvatarNullUpload } from "@/components/Profile/Avatar";

interface ClassificationFormProps {
    anomalyType: string;
    anomalyId: string; 
    missionNumber: number;
    assetMentioned: string;
    originatingStructure?: number;
    structureItemId?: number;
};

const ClassificationForm: React.FC<ClassificationFormProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned, originatingStructure, structureItemId }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const { activePlanet } = useActivePlanet();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: boolean }>({});
    const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
    const [classificationOutput, setClassificationOutput] = useState<any | null>(null);
    const [uses, setUses] = useState<number | null>(null);
    const [postSubmitted, setPostSubmitted] = useState<boolean>(false);

    const { userProfile } = useProfileContext();
    const [loading, setIsLoading] = useState(true);

    const placeholder = (() => {
        switch (anomalyType) {
            case "planet":
                return "Describe the planetary dips you see...";
            case "roverImg":
                return "Describe the terrain or objects found in the image...";
            case "cloud":
                return "Describe the cloud formations & locations...";
            case "zoodex-burrowingOwl":
                return "Describe the behavior or condition of the owls...";
            case 'zoodex-iguanasFromAbove':
                return "Describe the iguana sightings...";
            case 'DiskDetective':
                return "Describe the object seen in the disk...";
            case 'sunspot':
                return "Describe the sunspots you see and how many...";
            case 'zoodex-penguinWatch':
                return 'Describe the number and behaviour of the penguins...'
            case 'zoodex-planktonPortal':
                return 'Describe the plankton you see and their behaviour...'
            case 'lidar-earthCloudRead':
                return 'Describe the type of cloud you see...'
            default:
                return "Enter your classification details...";
        };
    })();

    const classificationOptions = (() => {
        switch (anomalyType) {
            case "planet":
                return planetClassificationOptions;
            case "roverImg":
                return roverImgClassificationOptions;
            case "cloud":
                return initialCloudClassificationOptions;
            case "zoodex-burrowingOwl":
                return zoodexBurrowingOwlClassificationOptions;
            case 'zoodex-iguanasFromAbove':
                return zoodexIguanasFromAboveClassificationOptions;
            case 'zoodex-southCoastFaunaRecovery':
                return zoodexSouthCoastFaunaRecovery;
            case 'zoodex-penguinWatch':
                return penguinWatchClassificationOptions;
            case 'DiskDetective':
                return diskDetectorClassificationOptions;
            case 'zoodex-planktonPortal':
                return planktonPortalClassificationOptions;
            case 'lidar-earthCloudRead':
                return lidarEarthCloudsReadClassificationOptions;
            case 'sunspot':
                // return sunspotsConfigurationTemporary;
                return [];
            case 'zoodex-nestQuestGo':
                return [];
            default:
                return [];
          };    
    })();    

    const showTextArea = classificationOptions.length === 0;

    const [hasClassified, setHasClassified] = useState<boolean>(false);
    const [showResearch, setShowResearch] = useState<boolean>(false);

    useEffect(() => {
        const checkUserClassification = async () => {
          if (!session?.user?.id || !anomalyId) return;
    
          const { data, error } = await supabase
            .from("classifications")
            .select("id")
            .eq("author", session.user.id)
            .eq("anomaly", anomalyId)
            .single();
    
          if (data) {
            setHasClassified(true);
          }
          if (error) {
            console.error("Error checking classification:", error.message);
          }
        };
    
        checkUserClassification();
    }, [session?.user?.id, anomalyId, supabase]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, avatar_url")
                    .eq("id", session?.user?.id)
                    .single();

                if (data) {
                    setAvatarUrl(data.avatar_url);
                };

                if (error) {
                    console.error("Error fetching profile: ", error.message);
                };
            } catch (error: any) {
                console.error("Unexpected error: ", error);
            };
        };
        
        fetchUserProfile();
    }, [session, supabase]);

    useEffect(() => {
        const fetchInventoryItemId = async () => {
            if (!session?.user?.id || !activePlanet?.id || !structureItemId) return;

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('id, configuration')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .eq('item', structureItemId)
                    .order('id', { ascending: true })
                    .limit(1)
                    .single();

                if (inventoryError) throw inventoryError;

                if (inventoryData) {
                    setInventoryItemId(inventoryData.id);
                    setUses(inventoryData.configuration?.Uses || 0);
                };
            } catch (error: any) {
                console.error("Error fetching inventory item ID:", error.message);
            };
        };

        fetchInventoryItemId();
    }, [session?.user?.id, activePlanet?.id, structureItemId, supabase]);

    const handleOptionClick = (optionId: number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: !prev[optionId],
        }));
    };

    const handleMissionComplete = async () => {
        try {
            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: missionNumber,
                configuration: null, 
            };
            await supabase.from("missions").insert([missionData]);
            const newAnomalyData = {
                user_id: session?.user?.id,
                anomaly_id: activePlanet?.id,
            };
            await supabase.from("user_anomalies").insert([newAnomalyData]);
        } catch (error: any) {
            console.error(error);
        }
    };

    const createPost = async () => {
        const classificationOptionsObj = Object.fromEntries(
            Object.entries(selectedOptions).map(([key, value]) => [
                classificationOptions.find(option => option.id === parseInt(key))?.text || '',
                value
            ])
        );
    
        const classificationConfiguration = {
            classificationOptions: classificationOptionsObj, 
            activePlanet: activePlanet?.id,
            structureId: originatingStructure ?? null,
            createdBy: inventoryItemId ?? null,
        };
    
        try {
            let currentConfig: any = {};
            if (inventoryItemId) {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('configuration')
                    .eq('id', inventoryItemId)
                    .single();
                    
                if (inventoryError) throw inventoryError;
    
                currentConfig = inventoryData?.configuration || {};
                if (currentConfig.Uses) {
                    currentConfig.Uses = Math.max(0, currentConfig.Uses - 1);
                };
            };
    
            if (inventoryItemId) {
                const { error: updateError } = await supabase
                    .from('inventory')
                    .update({ configuration: currentConfig })
                    .eq('id', inventoryItemId);
    
                if (updateError) {
                    throw updateError;
                };
            };
    
            const { data: classificationData, error: classificationError } = await supabase
                .from("classifications")
                .insert({
                    author: session?.user?.id,
                    content,
                    media: [uploads, assetMentioned],
                    anomaly: anomalyId,  
                    classificationtype: anomalyType,
                    classificationConfiguration,
                })
                .single();
    
            if (classificationError) {
                console.error("Error creating classification: ", classificationError.message);
                alert("Failed to create classification. Please try again.");
                return;
            } else {
                setClassificationOutput(classificationConfiguration);
                setContent('');
                setSelectedOptions({});
                setUploads([]);
                setPostSubmitted(true);
    
                setTimeout(() => {
                    setShowResearch(true);
                }, 1200);
            };
    
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('classificationPoints')
                .eq('id', session?.user?.id)
                .single();
    
            if (profileError) throw profileError;
    
            const newClassificationPoints = (profileData?.classificationPoints || 0) + 1;
    
            const { error: updatePointsError } = await supabase
                .from('profiles')
                .update({ classificationPoints: newClassificationPoints })
                .eq('id', session?.user?.id);
    
            if (updatePointsError) throw updatePointsError;
    
            await handleMissionComplete();
        } catch (error: any) {
            console.error("Unexpected error:", error);
        };
    };

    const [showModal, setShowModal] = useState(true);

    const closeModal = () => {
        setShowModal(false);
    };

    if (postSubmitted && showResearch) {
        return (
            <>
                {showModal && <IntroduceUserToResearch closeModal={closeModal} />}
            </>
        );
    };
     
    const addMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && session) {
            setIsUploading(true);
            try {
                const fileArray = Array.from(files);
                for (const file of fileArray) {
                    const fileName = `${Date.now()}-${session.user.id}-${file.name}`;
                    const { data, error } = await supabase.storage
                        .from("media")
                        .upload(fileName, file);

                    if (error) {
                        console.error("Upload error:", error.message);
                    } else if (data) {
                        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
                        setUploads(prevUploads => [...prevUploads, url]);
                    }
                }
            } catch (err) {
                console.error("Unexpected error during file upload:", err);
            } finally {
                setIsUploading(false);
            };
        };
    };

    if (postSubmitted) {
        return <ClassificationOutput configuration={classificationOutput} />;
    };    

    return (
        <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full w-full bg-[#2C4F64]/30 text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            {uses !== null && uses <= 0 ? (
                <div className="text-red-500 font-bold">
                    You need to repair the structure's durability before you can use it.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {classificationOptions.length > 0 ? (
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 w-1/3">
                                {classificationOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionClick(option.id)}
                                        className={`p-2 rounded-md ${selectedOptions[option.id] ? 'bg-[#FFD580] text-[#ffffff]' : 'bg-[#FF695D]'} hover:bg-[#81A1C1]`}
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 w-2/3">
                                <div className="flex gap-4 mb-4">
                                    {/* <UserAvatarNullUpload
                                        url={avatar_url}
                                        size={64}
                                        onUpload={(filePath: string) => {
                                            setAvatarUrl(filePath);
                                        }}
                                    /> */}
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="flex-grow p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                        placeholder={placeholder}
                                    />
                                </div>
                                <div className="flex items-center mb-4">
                                    <label className="flex gap-1 items-center cursor-pointer text-[#88C0D0] hover:text-white">
                                        <input type="file" className="hidden" onChange={addMedia} />
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-6.5 6.5" />
                                        </svg>
                                        <span>Upload Media</span>
                                    </label>
                                    {isUploading && <span className="text-[#88C0D0]">Uploading...</span>}
                                </div>
                                <button
                                    onClick={createPost}
                                    className="py-2 px-4 bg-[#5FCBC3] text-[#2E3440] rounded-md hover:bg-[#85DDA2]"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            <div className="flex gap-4 mb-4">
                                {/* <UserAvatarNullUpload
                                    url={avatar_url}
                                    size={64}
                                    onUpload={(filePath: string) => {
                                        setAvatarUrl(filePath);
                                    }}
                                /> */}
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="flex-grow p-3 h-40 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                    placeholder={placeholder}
                                />
                            </div>
                            <div className="flex items-center mb-4">
                                <label className="flex gap-1 items-center cursor-pointer text-[#88C0D0] hover:text-white">
                                    <input type="file" className="hidden" onChange={addMedia} />
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-6.5 6.5" />
                                    </svg>
                                    <span>Upload Media</span>
                                </label>
                                {isUploading && <span className="text-[#88C0D0]">Uploading...</span>}
                            </div>
                            <button
                                onClick={createPost}
                                className="py-2 px-4 bg-[#5FCBC3] text-[#2E3440] rounded-md hover:bg-[#85DDA2]"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );     
};

export default ClassificationForm;