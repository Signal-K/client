"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";

export default function ClassificationForm(anomalyType: string) {
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

    async function createPost() {
        if (!activePlanet.id) {
            console.error("No active planet selected/undefined");
            return;
        };

        const { data: classification, error } = await supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: uploads,
                anomaly: activePlanet.id,
                classificationtype: '', // lightcurve if anomalyType = planet
            })
            .single();

        if (error) {
            console.error('Error creating classification: ', error.message);
            return;
        };

        supabase.from("user_anomalies").insert([newAnomalyData]);
        alert(`Post created!`);
        setContent('');
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
        <div className="w-6/6 mx-auto">
            <div className="flex gap-2 mx-5 mt-5 pb-3">
                <div>
                    <img src={userProfile?.avatar_url || ''} width='60px' height='60px' />
                </div>
                <div className=""
            </div>
        </div>
    );
};