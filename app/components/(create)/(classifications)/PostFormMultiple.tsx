"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import UserAvatar, {
  UserAvatarNullUpload,
} from "@/app/components/(settings)/profile/Avatar";

interface ClassificationOption {
  id: number;
  text: string;
  subOptions?: ClassificationOption[];
}

const planetClassificationOptions: ClassificationOption[] = [
  { id: 1, text: "No dips at all" },
  { id: 2, text: "Repeating dips" },
  { id: 3, text: "Dips with similar size" },
  { id: 4, text: "Dips aligned to one side" },
];

const roverImgClassificationOptions: ClassificationOption[] = [
  { id: 1, text: "Dried-up water channels" },
  { id: 2, text: "Pebbles/medium-sized rocks" },
  { id: 3, text: "Hills/mountain formations" },
  { id: 4, text: "Volcano (dormant/extinct)" },
  { id: 5, text: "Mineral deposits" },
  { id: 6, text: "Sandy/rocky terrain" },
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

interface ClassificationFormProps {
  anomalyType: string;
  anomalyId: string;
  missionNumber: number;
  assetMentioned: string;
}

const ClassificationForm: React.FC<ClassificationFormProps> = ({
  anomalyType,
  anomalyId,
  missionNumber,
  assetMentioned,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [content, setContent] = useState<string>("");
  const [uploads, setUploads] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedOptions, setExpandedOptions] = useState<{
    [key: number]: boolean;
  }>({});

  const { activePlanet } = useActivePlanet();
  const { userProfile } = useProfileContext();

  const classificationOptions =
    anomalyType === "cloud"
      ? cloudClassificationOptions
      : anomalyType === "planet"
      ? planetClassificationOptions
      : roverImgClassificationOptions;

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
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const handleSubOptionClick = (optionId: number, subOptionId: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [`${optionId}-${subOptionId}`]: !prev[`${optionId}-${subOptionId}`],
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
      Object.entries(selectedOptions).map(([key, value]) => [key, value])
    );

    try {
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
          "Error creating classification:",
          classificationError.message
        );
        alert("Failed to create classification. Please try again.");
        return;
      } else {
        alert(`Post created`);
        setContent("");
        setSelectedOptions({});
        setUploads([]);
      }

      if (!activePlanet?.id) {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ location: anomalyId })
          .eq("id", session?.user?.id);

        if (profileUpdateError) {
          console.error(
            "Error updating profile with active planet:",
            profileUpdateError.message
          );
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
            setUploads((prevUploads) => [...prevUploads, url]);
          }
        }
      } catch (error) {
        console.error("Unexpected upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleOptionChange = (optionId: number) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const renderOptions = (
    options: ClassificationOption[],
    level: number = 0
  ) => {
    return options.map((option) => (
      <div key={option.id} style={{ marginLeft: `${level * 20}px` }}>
        <label>
          <input
            type="checkbox"
            checked={selectedOptions[option.id] || false}
            onChange={() => handleOptionClick(option.id)}
          />
          {option.text}
        </label>
        {option.subOptions && expandedOptions[option.id] && (
          <div>{renderOptions(option.subOptions, level + 1)}</div>
        )}
        {option.subOptions && (
          <button onClick={() => handleOptionChange(option.id)}>
            {expandedOptions[option.id] ? "Collapse" : "Expand"}
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="classification-form">
      <h2>Classification Form</h2>
      <UserAvatarNullUpload
        url={avatar_url}
        size={64}
        onUpload={(filePath: string) => {
          setAvatarUrl(filePath);
        }}
      />
      <textarea
        placeholder="Enter your content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="file" multiple onChange={addMedia} disabled={isUploading} />
      <div>
        <h3>Classification Options</h3>
        {renderOptions(classificationOptions)}
      </div>
      <button onClick={createPost}>Submit</button>
    </div>
  );
};

export default ClassificationForm;