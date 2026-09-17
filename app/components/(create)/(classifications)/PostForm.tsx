"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import UserAvatar, { UserAvatarNullUpload } from "@/app/components/(settings)/profile/Avatar";
import { ClassificationOutput } from "./ClassificationResults";
import IntroduceUserToResearch from "../../(scenes)/chapters/(onboarding)/initialiseResearch";

interface ClassificationOption {
    id: number;
    text: string;
    subOptions?: ClassificationOption[];
};

const planetClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'No dips at all' },
    { id: 2, text: 'Repeating dips' },
    { id: 3, text: 'Dips with similar size' },
    { id: 4, text: 'Dips aligned to one side' },
];

const diskDetectorClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Object moves away from crosshairs",
    },
    {
        id: 2,
        text: "Object is extended beyond the outer circle",
    },
    {
        id: 3,
        text: "Multiple objects inside inner circle",
    },
    {
        id: 4,
        text: "Objects between inner and outer circles",
    },
    {
        id: 5,
        text: "Object is not round",
    },
    {
        id: 6,
        text: "None of the above",
    },
];

const roverImgClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'Dried-up water channels' },
    { id: 2, text: 'Pebbles/medium-sized rocks' },
    { id: 3, text: 'Hills/mountain formations' },
    { id: 4, text: 'Volcano (dormant/extinct)' },
    { id: 5, text: 'Mineral deposits' },
    { id: 6, text: 'Sandy/rocky terrain' },
];

const cloudClassificationOptions: ClassificationOption[] = [
    {
      id: 1,
      text: "Colour",
      subOptions: [
        { id: 1, text: "White colour" },
        { id: 2, text: "Blue colour" },
      ],
    },
    {
      id: 2,
      text: "Intensity",
      subOptions: [
        { id: 1, text: "Bright clouds" },
        { id: 2, text: "Faint clouds" },
        { id: 3, text: "Medium clouds" },
      ],
    },
    {
      id: 3,
      text: "Coverage",
      subOptions: [
        { id: 1, text: "Clouds cover most of the height" },
        { id: 2, text: "Clouds are smaller" },
      ],
    },
];

// const initialCloudClassificationOptions: ClassificationOption[] = [
//     {
//         id: 1,
//         text: "White colour",
//     },
//     {
//         id: 2,
//         text: "Blue colour",
//     },
//     {
//         id: 3,
//         text: "Bright clouds",
//     },
//     {
//         id: 4, text: "Large clouds",
//     },
// ];

const initialCloudClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Narrow arch",
    },
    {
        id: 2,
        text: "Wide arch",
    },
    {
        id: 3,
        text: "1 cloud",
    },
    {
        id: 4, text: "2 clouds",
    },
    {
        id: 5, text: "3 clouds",
    },
    {
        id: 6, text: "4+ clouds",
    },
];

const zoodexBurrowingOwlClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Adult owl",
    },
    {
        id: 2,
        text: "Baby owl",
    },
    {
        id: 3,
        text: 'Mortality event',
    },
    {
        id: 4,
        text: "Infanticide",
    },
    {
        id: 5,
        text: "Prey delivery",
    },
    {
        id: 6,
        text: "Mating",
    },
    {
        id: 7,
        text: "Feeding",
    },
    {
        id: 8,
        text: "Owls have bands",
    },// Expand for choosing numbers, pointers, and predators etc.
];

const zoodexIguanasFromAboveClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Adult Male not in a Lek",
    },
    {
        id: 2,
        text: "Adult male with a Lek",
    },
    {
        id: 3,
        text: "Juvenile/Female",
    },
    {
        id: 4,
        text: "Partial iguana",
    },
];

const sunspotsConfigurationTemporary: ClassificationOption[] = [
    {
        id: 1,
        text: "No sunspots",
    },
    {
        id: 2,
        text: "1 sunspot",
    },
    {
        id: 3,
        text: "Multiple sunspots",
    },
];

const zoodexSouthCoastFaunaRecovery: ClassificationOption[] = [
    { id: 1, text: "Australian raven" },
    { id: 2, text: "Red-winged fairy-wren" },
    { id: 3, text: "Cat" },
    { id: 4, text: "Brown falcon" },
    { id: 5, text: "Silvereye" },
    { id: 6, text: "Echidna" },
    { id: 7, text: "Brown quail" },
    { id: 8, text: "Southern emu-wren" },
    { id: 9, text: "Fox" },
    { id: 10, text: "Brush bronzewing" },
    { id: 11, text: "Splendid fairy-wren" },
    { id: 12, text: "Mouse or smaller?" },
    { id: 13, text: "Carnaby's black cockatoo" },
    { id: 14, text: "Spotted nightjar" },
    { id: 15, text: "Quenda" },
    { id: 16, text: "Common bronzewing" },
    { id: 17, text: "Tawny frogmouth" },
    { id: 18, text: "Quokka" },
    { id: 19, text: "Emu" },
    { id: 20, text: "Tawny-crowned honeyeater" },
    { id: 21, text: "Rabbit" },
    { id: 22, text: "Galah" },
    { id: 23, text: "Wedge-tailed eagle" },
    { id: 24, text: "Western brush wallaby" },
    { id: 25, text: "Grey butcherbird" },
    { id: 26, text: "Welcome swallow" },
    { id: 27, text: "Western grey kangaroo" },
    { id: 28, text: "Grey currawong" },
    { id: 29, text: "Western bristlebird" },
    { id: 30, text: "Western ringtail possum" },
    { id: 31, text: "Grey fantail" },
    { id: 32, text: "Western fieldwren" },
    { id: 33, text: "Faulty" },
    { id: 34, text: "Laughing kookaburra" },
    { id: 35, text: "Human" },
    { id: 36, text: "Magpie" },
    { id: 37, text: "Western rosella" },
    { id: 38, text: "Nothing" },
    { id: 39, text: "Malleefowl" },
    { id: 40, text: "Western spinebill" },
    { id: 41, text: "Small mammal" },
    { id: 42, text: "Nankeen kestrel" },
    { id: 43, text: "Western wattlebird" },
    { id: 44, text: "Bird" },
    { id: 45, text: "New holland honeyeater" },
    { id: 46, text: "Western whipbird" },
    { id: 47, text: "Mammal" },
    { id: 48, text: "Noisy scrub-bird" },
    { id: 49, text: "Western whistler" },
    { id: 50, text: "Reptile" },
    { id: 51, text: "Painted button-quail" },
    { id: 52, text: "White-browed scrubwren" },
    { id: 53, text: "Bobtail skink" },
    { id: 54, text: "Purple swamphen" },
    { id: 55, text: "White-cheeked honeyeater" },
    { id: 56, text: "Heath monitor" },
    { id: 57, text: "Red wattlebird" },
    { id: 58, text: "Willie wagtail" },
    { id: 59, text: "King skink" },
    { id: 60, text: "Red-capped parrot" },
    { id: 61, text: "Brushtail possum" },
    { id: 62, text: "Western blue-tongued skink" },
    { id: 63, text: "Red-eared firetail" },
    { id: 64, text: "Bush rat" },
];

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
                return "Describe the sunspots you see...";
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
            case 'DiskDetective':
                return diskDetectorClassificationOptions;
            case 'sunspot':
                return sunspotsConfigurationTemporary;
            default:
                return [];
          };    
    })();    

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
        const classificationConfiguration = {
            ...Object.fromEntries(
                Object.entries(selectedOptions).map(([key, value]) => [
                    classificationOptions.find(option => option.id === parseInt(key))?.text || '',
                    value
                ])
            ),
            activePlanet: activePlanet?.id,
            structureId: originatingStructure ?? null,
            createdBy: inventoryItemId ?? null,
        };
    
        try {
            // Fetch current configuration to update "Uses"
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
                    currentConfig.Uses = Math.max(0, currentConfig.Uses - 1); // Decrement "Uses" value
                }
            }
    
            // Update the inventory item with the new configuration
            if (inventoryItemId) {
                const { error: updateError } = await supabase
                    .from('inventory')
                    .update({ configuration: currentConfig })
                    .eq('id', inventoryItemId);
    
                if (updateError) throw updateError;
            }
    
            // Create classification post
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
                console.error("Error creating classification:", classificationError.message);
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
    
            // Update user's classification points
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
    
            // Reset user's active mission to null after classification is created
            const { error: resetMissionError } = await supabase
                .from('profiles')
                .update({ activemission: null })
                .eq('id', session?.user?.id);
    
            if (resetMissionError) {
                console.error("Error resetting active mission:", resetMissionError.message);
            };
    
            await handleMissionComplete();
        } catch (error) {
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
            {/* Conditional rendering for "Uses" value */}
            {uses !== null && uses <= 0 ? (
                <div className="text-red-500 font-bold">
                    You need to repair the structure's durability before you can use it.
                </div>
            ) : (
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
                            <>
                                <div className="flex gap-4 mb-4">
                                    <UserAvatarNullUpload
                                        url={avatar_url}
                                        size={64}
                                        onUpload={(filePath: string) => {
                                            setAvatarUrl(filePath);
                                        }}
                                    />
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="flex-grow p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                        // placeholder={`What do you think about this ${anomalyType === "planet" ? "planet" : "rover image"}?`}
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
                            </>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassificationForm;