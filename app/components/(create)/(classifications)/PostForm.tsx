"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import UserAvatar, { UserAvatarNullUpload } from "@/app/components/(settings)/profile/Avatar";

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

const initialCloudClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "White colour",
    },
    {
        id: 2,
        text: "Blue colour",
    },
    {
        id: 3,
        text: "Bright clouds",
    },
    {
        id: 4, text: "Large clouds",
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
    }, // Expand for choosing numbers, pointers, and predators etc.
];

interface ClassificationFormProps {
    anomalyType: string;
    anomalyId: string; 
    missionNumber: number;
    assetMentioned: string;
};

const ClassificationForm: React.FC<ClassificationFormProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: boolean }>({});

    const { userProfile } = useProfileContext();

    // Determine classification options based on anomalyType
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
            default:
                return [];
        }
    })();

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
                }
                if (error) {
                    console.error("Error fetching profile:", error.message);
                }
            } catch (error) {
                console.error("Unexpected error:", error);
            }
        };
        fetchUserProfile();
    }, [session, supabase]);

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
            activePlanet: activePlanet?.id // Add activePlanet ID to classificationConfiguration
        };

        try {
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
                alert(`Post created`);
                setContent('');
                setSelectedOptions({});
                setUploads([]);
            }

            if (!activePlanet?.id) {
                const { error: profileUpdateError } = await supabase
                    .from("profiles")
                    .update({ location: anomalyId })
                    .eq("id", session?.user?.id);

                if (profileUpdateError) {
                    console.error("Error updating profile with active planet:", profileUpdateError.message);
                    alert("Failed to update active planet. Please try again.");
                    return;
                }
            }

            await handleMissionComplete();
        } catch (error) {
            console.error("Unexpected error:", error);
        }
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
            }
        }
    };

    return (
        <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full w-full bg-[#2E3440] text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/3">
                    {classificationOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            className={`p-2 rounded-md ${selectedOptions[option.id] ? 'bg-[#88C0D0] text-[#2E3440]' : 'bg-[#4C566A]'} hover:bg-[#81A1C1]`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-2 w-2/3">
                    {Object.keys(selectedOptions).length > 0 && (
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
                                    placeholder={`What do you think about this ${anomalyType === "planet" ? "planet" : "rover image"}?`}
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
                                className="py-2 px-4 bg-[#88C0D0] text-[#2E3440] rounded-md hover:bg-[#81A1C1]"
                            >
                                Submit
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassificationForm;