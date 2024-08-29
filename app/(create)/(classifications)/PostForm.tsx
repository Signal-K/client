"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import UserAvatar, { UserAvatarNullUpload } from "@/app/(settings)/profile/Avatar";

interface ClassificationOption {
    id: number;
    text: string;
}

const planetClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'No dips at all' },
    { id: 2, text: 'Repeating dips' },
    { id: 3, text: 'Dips with similar size' },
    { id: 4, text: 'Dips aligned to one side' },
    { id: 5, text: 'Inconsistent/irregular dips' },
];

const roverImgClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'Dried-up water channels' },
    { id: 2, text: 'Pebbles/medium-sized rocks' },
    { id: 3, text: 'Hills/mountain formations' },
    { id: 4, text: 'Volcano (dormant/extinct)' },
    { id: 5, text: 'Mineral deposits' },
    { id: 6, text: 'Sandy/rocky terrain' },
];

interface ClassificationFormProps {
    anomalyType: string;
    anomalyId: string;
    missionNumber: number;
    assetMentioned: string;
}

const ClassificationForm: React.FC<ClassificationFormProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: boolean }>({});
    const [classificationSubmitted, setClassificationSubmitted] = useState<boolean>(false);

    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext();

    const classificationOptions = anomalyType === "planet" ? planetClassificationOptions : roverImgClassificationOptions;

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
        const classificationConfiguration = Object.fromEntries(
            Object.entries(selectedOptions).map(([key, value]) => [
                classificationOptions.find(option => option.id === parseInt(key))?.text || '',
                value
            ])
        );
    
        if (activePlanet?.id) {
            classificationConfiguration.activePlanet = activePlanet.id;
        }
    
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
            }
    
            setClassificationSubmitted(true);
            setContent('');
            setSelectedOptions({});
            setUploads([]);
    
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
        <div className="relative p-2 w-full max-w-4xl mx-auto rounded-lg h-full w-full bg-[#2E3440] text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            {classificationSubmitted && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#2E3440] bg-opacity-90 rounded-lg text-center">
                    <div className="p-2">
                        <p className="text-lg font-semibold">Great job!</p>
                        <p className="mt-2">Now that you've identified a potential planet, you can share your findings with the rest of the space sailors community.</p>
                    </div>
                </div>
            )}
            <div className={`transition-opacity duration-500 ${classificationSubmitted ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex gap-2">
                    <div className="relative flex flex-col gap-2 w-1/3 h-48 overflow-y-auto">
                        {classificationOptions.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.id)}
                                className={`p-2 rounded-md ${selectedOptions[option.id] ? 'bg-[#88C0D0] text-[#2E3440]' : 'bg-[#4C566A]'} hover:bg-[#81A1C1]`}
                            >
                                {option.text}
                            </button>
                        ))}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81A1C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
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
                                        placeholder="Describe your classification..."
                                        className="w-full h-32 p-2 rounded-md bg-[#4C566A] focus:outline-none focus:ring-2 focus:ring-[#88C0D0]"
                                    />
                                </div>
                                <label className="flex flex-col items-center p-2 rounded-md bg-[#4C566A] cursor-pointer hover:bg-[#88C0D0]">
                                    <span>Upload media</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={addMedia}
                                        multiple
                                    />
                                </label>
                                <button
                                    onClick={createPost}
                                    disabled={content.trim() === ""}
                                    className="p-2 mt-4 rounded-md bg-[#88C0D0] text-[#2E3440] hover:bg-[#81A1C1] disabled:opacity-50"
                                >
                                    Submit Classification
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassificationForm;