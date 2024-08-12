"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";

interface ClassificationOption {
    id: number;
    text: string;
};
  
const classificationOptions: ClassificationOption[] = [
    { id: 1, text: 'No dips at all' },
    { id: 2, text: 'Repeating dips' },
    { id: 3, text: 'Dips with similar size' },
    { id: 4, text: 'Dips aligned to one side' },
];

interface ClassificationFormProps {
    anomalyType: string;
    missionNumber: number;
};

const ClassificationForm: React.FC<ClassificationFormProps> = ({ anomalyType, missionNumber }) => {
    // Take `anomalytype` into account
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);

    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext();
    const [userAnomalies, setUserAnomalies] = useState<number[]>([]);
    const [classificationType, setClassificationType] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<{ [ key: number ]: boolean }>({});

    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [userProfileContent, setUserProfile] = useState(null);
    const fetchProfileData = async () => {
        if (!session) {
            return null;
        };

        try {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("id", session?.user?.id)
        } catch (error: any) {
            console.error("Error fetching data from user profile via context: ", error);
        }
    };

    useEffect(() => {
        const fetchUserAnomalies = async () => {
            if (!session) {
                return;
            };

            try {
                const { data, error } = await supabase
                    .from("user_anomalies")
                    .select("anomaly_id")
                    .eq("user_id", session.user.id);

                if (error) {
                    throw error;
                };

                setUserAnomalies(data.map((anomaly: any) => anomaly.anomaly_id))
            } catch (error: any) {
                console.error("Error fetching user anomalies:", error.message);
            };
        };

        // fetchUserAnomalies();
    }, [session]);

    const newAnomalyData = {
        user_id: session?.user?.id,
        anomaly_id: activePlanet?.id,
    };

    const handleOptionClick = ( optionId: number ) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionId]: !prev[optionId],
        }));
    };

    const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: missionNumber,
        configuration: null,
    };

    const handleMissionComplete = async () => {
        try {
            if (missionNumber != null) {
                await supabase.from("missions").insert([missionData]);
            };
            await supabase.from("user_anomalies").insert([newAnomalyData]);
        } catch (error: any) {
            console.error(error);
        };
    };

    const createPost = async () => {
        const classificationConfiguration = Object.fromEntries(
            Object.entries(selectedOptions).map(([key, value]) => [classificationOptions.find(option => option.id === parseInt(key))?.text || '', value])
        );

        const { error } = await supabase
        .from("classifications")
        .insert({
          author: session?.user?.id,
          content,
          media: [uploads,], // assetMentioned?
          anomaly: activePlanet?.id,
          classificationtype: 'lightcurve',
          classificationConfiguration,
        });
  
        if (error) {
            console.error("Error creating classification:", error.message);
            alert("Failed to create classification. Please try again.");
        } else {
            alert(`Post created`);
            setContent('');
            setSelectedOptions({});
            setUploads([]);
        };
  
        await handleMissionComplete();
    };

    async function addMedia(e: any) {
        const files = e.target.files;
        if (files.length > 0 && session) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + session.user.id + file.name;
                const result = await supabase.storage
                    .from("media")
                    .upload(fileName, file);

                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media/' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                };
            };
            setIsUploading(false);
        };
    };

    return (
        <div className="p-4 w-full max-w-md mx-auto bg-white rounded-lg">
            <div className="flex gap-2 mx-5 mt-5 pb-3">
                <div>
                    <img src={userProfile?.avatar_url || ''} width='60px' height='60px' />
                </div>
                <div className="flex flex-col gap-2 mb-4">
                    {classificationOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            className={`p-2 rounded-md ${selectedOptions[option.id] ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClassificationForm;