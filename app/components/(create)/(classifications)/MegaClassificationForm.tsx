"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { ClassificationOutput } from "@/app/components/(create)/(classifications)/ClassificationResults";
import { UserAvatarNullUpload } from "@/app/components/(settings)/profile/Avatar";

export interface ClassificationOption {
  id: number;
  text?: string;
  subOptions?: ClassificationOption[];
};

export interface FormConfig {
  title?: string; 
  richTextFields: number;
  options?: ClassificationOption[];
  richTextTitles?: (string | undefined)[];
};

interface ClassificationFormProps {
  config?: FormConfig;
  onSubmit: (data: any) => void;
  anomalyType: string;
  anomalyId: string;
  missionNumber: number;
  assetMentioned: string;
  originatingStructure?: number;
  structureItemId?: number;
};

const defaultConfig: FormConfig = {
  title: "Classification Form",
  richTextFields: 1,
  options: [],
};

export function ClassificationFormComponentT({
  config = defaultConfig,
  structureItemId,
  missionNumber,
  originatingStructure,
  anomalyId,
  anomalyType,
  assetMentioned,
  onSubmit,
}: ClassificationFormProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();
  const { title, richTextFields, richTextTitles, options } = { ...defaultConfig, ...config };
  const [richTextValues, setRichTextValues] = useState<string[]>(Array(richTextFields).fill(""));
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({}); // Updated to support multiple selections

  // User profile info
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const { userProfile } = useProfileContext();

  const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
  const [classificationOutput, setClassificationOutput] = useState<any | null>(null);
  const [uses, setUses] = useState<number | null>(null);
  const [postSubmitted, setPostSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const handleRichTextChange = (index: number, value: string) => {
    const newValues = [...richTextValues];
    newValues[index] = value;
    setRichTextValues(newValues);
  };

  const handleOptionSelect = (event: React.MouseEvent<HTMLButtonElement>, groupId: number, optionId: number) => {
    event.preventDefault(); // Prevent the form submission
    setSelectedOptions((prev) => {
        const currentSelections = prev[groupId] || [];
        if (currentSelections.includes(optionId)) {
            return { ...prev, [groupId]: currentSelections.filter(id => id !== optionId) };
        } else {
            return { ...prev, [groupId]: [...currentSelections, optionId] };
        }
    });
};


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
          console.error("Error fetching profile: ", error.message);
        }
      } catch (error: any) {
        console.error("Unexpected error: ", error);
      }
    };

    fetchUserProfile();
  }, [session, supabase]);

  useEffect(() => {
    const fetchInventoryItemId = async () => {
      if (!session?.user?.id || !activePlanet?.id || !structureItemId) return;

      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select("id, configuration")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", structureItemId)
          .order("id", { ascending: true })
          .limit(1)
          .single();

        if (inventoryError) throw inventoryError;

        if (inventoryData) {
          setInventoryItemId(inventoryData.id);
          setUses(inventoryData.configuration?.Uses || 0);
        }
      } catch (error: any) {
        console.error("Error fetching inventory item ID:", error.message);
      }
    };

    fetchInventoryItemId();
  }, [session?.user?.id, activePlanet?.id, structureItemId, supabase]);

  const createPost = async () => {
    // Constructing classification configuration with selected options
    const classificationConfiguration = {
      selectedOptions: Object.entries(selectedOptions).map(([key, value]) => {
        const option = options?.find((opt) => opt.id === parseInt(key));
        return {
          optionId: option?.id,
          optionText: option?.text,
          selectedSubOptionIds: value,
        };
      }),
      activePlanet: activePlanet?.id,
      structureId: originatingStructure ?? null,
      createdBy: inventoryItemId ?? null,
    };

    try {
      // Fetch current configuration to update "Uses"
      let currentConfig: any = {};
      if (inventoryItemId) {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select("configuration")
          .eq("id", inventoryItemId)
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
          .from("inventory")
          .update({ configuration: currentConfig })
          .eq("id", inventoryItemId);

        if (updateError) throw updateError;
      }

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

      // Create classification post
      const { data: classificationData, error: classificationError } =
        await supabase
          .from("classifications")
          .insert({
            author: session?.user?.id,
            content: richTextValues,
            media: [assetMentioned],
            anomaly: anomalyId,
            classificationtype: anomalyType,
            classificationConfiguration,
          })
          .single();

      if (classificationError) {
        console.error(
          "Error creating classification:",
          classificationError.message
        );
        alert("Failed to create classification. Please try again.");
        return;
      } else {
        setClassificationOutput(classificationConfiguration);
        setRichTextValues(Array(richTextFields).fill(""));
        setSelectedOptions({});
        setPostSubmitted(true);
      };

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("classificationPoints")
        .eq("id", session?.user?.id)
        .single();

      if (profileError) throw profileError;

      const newClassificationPoints =
        (profileData?.classificationPoints || 0) + 1;

      const { error: updatePointsError } = await supabase
        .from("profiles")
        .update({ classificationPoints: newClassificationPoints })
        .eq("id", session?.user?.id);

      if (updatePointsError) throw updatePointsError;

      // Reset user's active mission to null after classification is created
      const { error: resetMissionError } = await supabase
        .from("profiles")
        .update({ activemission: null })
        .eq("id", session?.user?.id);

      if (resetMissionError) {
        console.error(
          "Error resetting active mission:",
          resetMissionError.message
        );
      }

      await handleMissionComplete();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

    function handleOptionClick(id: number): void {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full bg-[#2C4F64]/30 text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
          {uses !== null && uses <= 0 ? (
            <div className="text-red-500 font-bold">
              No uses remaining for this structure.
            </div>
          ) : (
            <form className="p-6">
              <h2 className="text-2xl font-bold mb-4">{title}</h2>
              <div className="flex flex-wrap mb-4">
                {options?.map((option) => (
                  <p key={option.id}>{option.text}</p>
                ))}
              </div>
              <div className="flex flex-wrap mb-4">
                {options?.map((option) => (
                  option.subOptions?.map((subOption) => (
                    <button
                      key={subOption.id}
                      type="button" // Set type to button
                      onClick={(event) => handleOptionSelect(event, option.id, subOption.id)}
                      className={`p-2 rounded-md m-1 ${selectedOptions[option.id]?.includes(subOption.id) ? 'bg-[#FFD580] text-[#ffffff]' : 'bg-[#FF695D]'} hover:bg-[#81A1C1]`}
                    >
                      {subOption.text}
                    </button>
                  ))
                ))}
              </div>
              {richTextValues.map((richTextValue, index) => (
                <div key={index}>
                  {richTextTitles?.[index] && <h2>{richTextTitles[index]}</h2>}
                  <textarea
                    key={index}
                    value={richTextValue}
                    onChange={(e) => handleRichTextChange(index, e.target.value)}
                    className="w-full mb-4 p-3 text-white rounded-xl border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                    placeholder={`Details for rich text field ${index + 1}`}
                    rows={3}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="py-2 px-4 bg-[#5FCBC3] text-[#2E3440] rounded-md hover:bg-[#85DDA2]"
                onClick={createPost}
              >
                Submit Classification
              </button>
            </form>
          )}
          {/* {classificationOutput && (
            <ClassificationOutput
              classificationOutput={classificationOutput}
              postSubmitted={postSubmitted}
            />
          )}
          {avatar_url && <UserAvatarNullUpload avatar_url={avatar_url} />} */}
        </div>
      );      
};