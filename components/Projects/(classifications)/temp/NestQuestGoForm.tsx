"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
// import { UserAvatarNullUpload } from "@/components/Profile/Avatar";
import IntroduceUserToResearch from "@/components/(scenes)/chapters/(onboarding)/initialiseResearch";

interface ClassificationFormProps {
    anomalyType: string;
    anomalyId: string; 
    missionNumber: number;
    assetMentioned: string;
    originatingStructure?: number;
    structureItemId?: number;
};

export const NestQuestGoClassificationForm: React.FC<ClassificationFormProps> = ({
    anomalyType,
    anomalyId,
    missionNumber,
    assetMentioned,
    originatingStructure,
    structureItemId
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [content, setContent] = useState<string>("");
    const [avatar_url, setAvatarUrl] = useState<string>("");
    const [inventoryItemId, setInventoryItemId] = useState<number[]>([]);
    const [uses, setUses] = useState<number>(0);
    const [postSubmitted, setPostSubmitted] = useState<boolean>(false);

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
            if (!session) {
                return null;
            };

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, avatar_url")
                    .eq("id", session.user.id)
                    .single();

                if (data) {
                    setAvatarUrl(data.avatar_url);
                };

                if (error) {
                    console.error("Error fetching user profile:", error.message);
                };
            } catch (error: any) {
                console.error("Error fetching user profile: ", error.message);
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
            activePlanet: activePlanet?.id,
            structureItemId: structureItemId ?? null,
            createdBy: inventoryItemId ?? null,
            form1: textAreaOne ?? null,
            form2: textAreaTwo ?? null,
            form3: textAreaThree ?? null,
        };

        try {
            let currentConfig: any = {};
            if (inventoryItemId) {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from("inventory")
                    .select("configuration")
                    .eq("id", inventoryItemId)
                    .single();

                if (inventoryError) {
                    throw inventoryError;
                };

                currentConfig = inventoryData.configuration || {};
                if (currentConfig.Uses) {
                    currentConfig.Uses -= 1;
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
                    content: content,
                    anomaly: anomalyId,
                    classificationtype: anomalyType,
                    classificationConfiguration,
                })
                .single();

            if (classificationError) {
                console.error("Error creating classification: ", classificationError.message);
                alert("Error creating classification. Please try again.");
                return;
            } else {
                setContent('');
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
            console.error("Error creating classification:", error.message);
            alert("Error creating classification. Please try again.");
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

    const [currentTextArea, setCurrentTextArea] = useState<number>(1);
    const [textAreaOne, setTextAreaOne] = useState<string>("");
    const [textAreaTwo, setTextAreaTwo] = useState<string>("");
    const [textAreaThree, setTextAreaThree] = useState<string>("");

    const handleNextTextArea = () => {
        if (currentTextArea < 3) {
            setCurrentTextArea(currentTextArea + 1);
        }
    };

    return (
        <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full w-full bg-[#2C4F64]/30 text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            {uses !== null && uses <= 0 ? (
                <div className="text-red-500 font-bold">
                    You need to repair this structure's durability before you can use it.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 w-2/3">
                            <div className="flex gap-4 mb-4">
                                {/* <UserAvatarNullUpload
                                    url={avatar_url}
                                    size={64}
                                    onUpload={(filePath: string) => {
                                        setAvatarUrl(filePath);
                                    }}
                                /> */}
                            </div>
                            
                            {currentTextArea >= 1 && (
                                <textarea
                                    value={textAreaOne}
                                    onChange={e => setTextAreaOne(e.target.value)}
                                    className="flex-grow p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                    placeholder="Enter your first classification here..."
                                    onBlur={handleNextTextArea} 
                                />
                            )}
                            
                            {currentTextArea >= 2 && (
                                <textarea
                                    value={textAreaTwo}
                                    onChange={e => setTextAreaTwo(e.target.value)}
                                    className="flex-grow p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                    placeholder="Enter your second classification here..."
                                    onBlur={handleNextTextArea}
                                />
                            )}
                            
                            {currentTextArea >= 3 && (
                                <textarea
                                    value={textAreaThree}
                                    onChange={e => setTextAreaThree(e.target.value)}
                                    className="flex-grow p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                                    placeholder="Enter your third classification here..."
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-4 p-3 h-24 text-white rounded-xl border border-[#3B4252] bg-[#FF6347] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none">
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Enter additional content here..."
                            className="w-full h-full bg-transparent outline-none"
                        />
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
    );
};