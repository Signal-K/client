"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

import {
  zoodexSouthCoastFaunaRecovery,
  roverImgClassificationOptions,
  lidarEarthCloudsReadClassificationOptions,
  planetClassificationOptions,
  planktonPortalClassificationOptions,
  diskDetectorClassificationOptions,
  zoodexIguanasFromAboveClassificationOptions,
  zoodexBurrowingOwlClassificationOptions,
  cloudClassificationOptionsOne, cloudClassificationOptionsTwo, cloudClassificationOptionsThree,
  automatonaiForMarsOptions,
  DailyMinorPlanetOptions,
  PlanetFourOptions,
  jvhOptions,
  initialCloudClassificationOptions,
  cloudSpottingOnMarsShapesOptions,
} from "@/content/Classifications/Options";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import Link from "next/link";
// import UserAvatar, { UserAvatarNullUpload } from "@/components/Profile/Avatar";
import { ClassificationFormProps } from "./FormConfigurations";
import { SciFiButton } from "@/components/ui/styles/sci-fi/button";

const ClassificationForm: React.FC<ClassificationFormProps> = ({
  anomalyType,
  anomalyId,
  missionNumber,
  assetMentioned,
  parentPlanetLocation,
  structureItemId,
  parentClassificationId,
  annotationOptions,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [content, setContent] = useState<string>("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupIndex: number]: { [optionId: number]: boolean };
  }>({});
  const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
  const [classificationOutput, setClassificationOutput] = useState<any | null>(
    null
  );
  const [uses, setUses] = useState<number | null>(null);
  const [postSubmitted, setPostSubmitted] = useState<boolean>(false);

  const router = useRouter();

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
      case "zoodex-iguanasFromAbove":
        return "Describe the iguana sightings...";
      case "DiskDetective":
        return "Describe the object seen in the disk...";
      case "sunspot":
        return "Describe the sunspots you see and how many...";
      case "zoodex-penguinWatch":
        return "Describe the number and behaviour of the penguins...";
      case "zoodex-planktonPortal":
        return "Describe the plankton you see and their behaviour...";
      case 'zoodex-clickACoral':
        return 'Describe the coral you see...';
      case "satellite-planetFour":
        return 'Describe any additional details you notice about the terrain. How could these features impact future construction or exploration efforts?';
      case "lidar-earthCloudRead":
        return "Describe the type of cloud you see...";
      case "automaton-aiForMars":
        return "What surface types do you see from your rover?";
      case 'lidar-jovianVortexHunter':
        return "Describe the patterns in the clouds you see...";
    case "telescope-minorPlanet":
        return "Does the highlighted object move smoothly through the images? What do you see...?"
      default:
        return "Enter your classification details...";
    }
  })();
 
  const classificationOptions = (() => {
    switch (anomalyType) {
      case "planet":
        return [planetClassificationOptions];
      case "roverImg":
        return [roverImgClassificationOptions];
      case "cloud":
        return [
          // cloudClassificationOptionsOne,
          // cloudClassificationOptionsTwo,
          // cloudClassificationOptionsThree,
          initialCloudClassificationOptions,
          cloudSpottingOnMarsShapesOptions,
        ];
      case "zoodex-burrowingOwl":
        return [zoodexBurrowingOwlClassificationOptions];
      case "zoodex-iguanasFromAbove":
        return [zoodexIguanasFromAboveClassificationOptions];
      case 'lidar-jovianVortexHunter':
        return [jvhOptions];
      case "zoodex-southCoastFaunaRecovery":
        return [zoodexSouthCoastFaunaRecovery];
      case "DiskDetective":
        return [diskDetectorClassificationOptions];
      case "zoodex-planktonPortal":
        return [planktonPortalClassificationOptions];
      case "lidar-earthCloudRead":
        return [lidarEarthCloudsReadClassificationOptions];
      case "sunspot":
        return [];
      case "satellite-planetFour":
        return [PlanetFourOptions];
      case "telescope-minorPlanet":
        return [DailyMinorPlanetOptions];
      case "automaton-aiForMars":
        return [automatonaiForMarsOptions];
      case "zoodex-nestQuestGo":
        return [];
      default:
        return [];
    }
  })();

  const showTextArea = classificationOptions.length === 0;

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

  const handleOptionClick = (groupIndex: number, optionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupIndex]: {
        ...prev[groupIndex],
        [optionId]: !prev[groupIndex]?.[optionId],
      },
    }));
  };

  // const handleMissionComplete = async () => {
  //   try {
  //     const missionData = {
  //       user: session?.user?.id,
  //       time_of_completion: new Date().toISOString(),
  //       mission: missionNumber,
  //       configuration: null,
  //     };
  //     await supabase.from("missions").insert([missionData]);
  //     // const newAnomalyData = {
  //     //   user_id: session?.user?.id,
  //     //   anomaly_id: activePlanet?.id,
  //     // };
  //     // await supabase.from("user_anomalies").insert([newAnomalyData]);
  //   } catch (error: any) {
  //     console.error(error);
  //   };
  // };

  const createPost = async () => {
    const flattenedOptions = classificationOptions.flat();

    const classificationOptionsObj = Object.fromEntries(
      Object.entries(selectedOptions).map(([key, value]) => [
        flattenedOptions.find((option) => option.id === parseInt(key))?.text ||
          "",
        value,
      ])
    );

    const classificationConfiguration = {
      classificationOptions: classificationOptionsObj,
      additionalFields,
      parentPlanetLocation: parentPlanetLocation || null,
      activePlanet: activePlanet?.id,
      createdBy: inventoryItemId ?? null,
      classificationParent: parentClassificationId ?? null,
      annotationOptions: annotationOptions,
    };

    try {
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
          currentConfig.Uses = Math.max(0, currentConfig.Uses - 1);
        };
      };

      if (inventoryItemId) {
        const { error: updateError } = await supabase
          .from("inventory")
          .update({ configuration: currentConfig })
          .eq("id", inventoryItemId);

        if (updateError) {
          throw updateError;
        };
      };

      const { data: classificationData, error: classificationError } =
        await supabase
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
        console.error(
          "Error creating classification: ",
          classificationError.message
        );
        alert("Failed to create classification. Please try again.");
        return;
      } else {
        setClassificationOutput(classificationConfiguration);
        setContent("");
        setSelectedOptions({});
        setUploads([]);
        setPostSubmitted(true);
      };

      // await handleMissionComplete();

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
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      console.error("Unexpected error:", error);
    };

    router.refresh();
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
            setUploads((prevUploads) => [...prevUploads, url]);
          };
        };
      } catch (err) {
        console.error("Unexpected error during file upload:", err);
      } finally {
        setIsUploading(false);
      };
    };
  };

  const [additionalFields, setAdditionalFields] = useState<{
    [key: string]: string;
  }>({});

  const additionalTextAreaConfig = (() => {
    switch (anomalyType) {
      case "planet":
        return { count: 1, placeholders: ["Enter details about the planet"] };
      case "roverImg":
        return {
          count: 2,
          placeholders: ["Describe the rover", "Enter camera details"],
        };
      case "cloud":
        return {
          count: 1, // 3,
          placeholders: [
            "Cloud type",
            // "Weather conditions",
            // "Time of observation",
          ],
        };
      case "DiskDetective":
        return { count: 1, placeholders: ["Details about the disk detection"] };
        case "zoodex-nestQuestGo":
            return {
                count: 4,
                placeholders: [
                    "Month of visit (separated by comma e.g. 5/4/3/2)",
                    "Day of visit (separated by comma)",
                    "Number of eggs for each visit (separated by comma)",
                    "Number of young for each visit (separated by comma)",
                ],
            };
        case "zoodex-penguinWatch":
            return {
                count: 4,
                placeholders: [
                    "Number of adults",
                    "Number of chicks",
                    "Number of eggs",
                    "Other (describe)"
                ],
            };
      default:
        return { count: 0, placeholders: [] };
    }
  })();

  const handleAdditionalFieldChange = (index: number, value: string) => {
    setAdditionalFields((prev) => ({
      ...prev,
      [`field_${index}`]: value,
    }));
  };

  return (
    <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full bg-[#2C4F64]/30 text-white bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
      {/* {uses !== null && uses <= 0 ? (
        <div className="text-red-500 font-bold">
          You need to repair the structure's durability before you can use it.
        </div>
      ) : ( */}
        <div className="flex flex-col gap-6">
          {classificationOptions.length > 0 ? (
            <>
              <div className="flex flex-col gap-2">
                {classificationOptions.map((optionSet, setIndex) => (
                  <div key={setIndex} className="flex flex-col gap-4">
                    <h3 className="font-bold text-sm">Option Set {setIndex + 1}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {optionSet.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(setIndex, option.id)}
                          className={`p-2 rounded text-xs ${
                            selectedOptions[setIndex]?.[option.id]
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
  
              <div className="flex flex-col gap-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="p-3 h-24 text-sm text-white rounded-md border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                  placeholder={placeholder}
                />
  
                {[...Array(additionalTextAreaConfig.count)].map((_, index) => (
                  <textarea
                    key={index}
                    value={additionalFields[`field_${index}`] || ""}
                    onChange={(e) => handleAdditionalFieldChange(index, e.target.value)}
                    className="p-3 h-24 text-sm text-white rounded-md border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                    placeholder={
                      additionalTextAreaConfig.placeholders[index] ||
                      `Additional detail ${index + 1}`
                    }
                  />
                ))}
  
                <div className="flex items-center justify-between">
                  <label className="flex gap-1 items-center cursor-pointer text-[#88C0D0] hover:text-white">
                    <input type="file" className="hidden" onChange={addMedia} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-6.5 6.5"
                      />
                    </svg>
                    <span>Upload Media</span>
                  </label>
                  {isUploading && <span className="text-[#88C0D0]">Uploading...</span>}
                  <SciFiButton
                    onClick={createPost}
                    className="py-2 px-4 bg-[#5FCBC3] text-[#2E3440] rounded-md hover:bg-[#85DDA2]"
                  >
                    Submit
                  </SciFiButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="p-3 h-40 text-sm text-white rounded-md border border-[#3B4252] bg-[#3B4252] focus:border-[#88C0D0] focus:ring focus:ring-[#88C0D0] outline-none"
                placeholder={placeholder}
              />
              <div className="flex items-center justify-between">
                <label className="flex gap-1 items-center cursor-pointer text-[#88C0D0] hover:text-white">
                  <input type="file" className="hidden" onChange={addMedia} />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-6.5 6.5"
                    />
                  </svg>
                  <span>Upload Media</span>
                </label>
                {isUploading && <span className="text-[#88C0D0]">Uploading...</span>}
                <SciFiButton
                  onClick={createPost}
                  className="flex items-center justify-center gap-2"
                >
                  Submit
                </SciFiButton>
              </div>
            </div>
          )}
        </div>
      {/* )} */}
    </div>
  );  
};

export default ClassificationForm;