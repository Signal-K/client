'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PostCard from "@/content/Posts/TestPostCard";

interface VotePlanetClassificationsProps { 
  classificationId: string | number;
};

export default function VotePlanetClassifications({ classificationId }: VotePlanetClassificationsProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassification = async () => {
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    };

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
        .eq("id", classificationId)
        .single(); 

      if (error) throw error;

      let image: string | null = null;
      const media = data.media;

      if (Array.isArray(media)) {
        for (const subArray of media) {
          if (Array.isArray(subArray) && subArray.length > 0) {
            image = subArray[0];
            break;
          };
        };
      } else if (media && typeof media.uploadUrl === "string") {
        image = media.uploadUrl;
      };

      const votes = data.classificationConfiguration?.votes || 0;

      setClassification({ ...data, image, votes });
    } catch (error) {
      console.error("Error fetching classification:", error);
      setError("Failed to load classification.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchClassification();
  }, [session, classificationId]);

  const handleVote = async (classificationId: number, currentConfig: any) => {
    try {
      const currentVotes = currentConfig?.votes || 0;

      const updatedConfig = {
        ...currentConfig,
        votes: currentVotes + 1,
      };

      const { error } = await supabase
        .from("classifications")
        .update({ classificationConfiguration: updatedConfig })
        .eq("id", classificationId);

      if (error) {
        console.error("Error updating classificationConfiguration:", error);
      } else {
        setClassification((prev: any) =>
          prev ? { ...prev, votes: updatedConfig.votes } : prev
        );
      };
    } catch (error) {
      console.error("Error voting:", error);
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg">
      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-gray-400">Loading classification...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : classification ? (
          <PostCard
            classificationId={classification.id}
            title={classification.title}
            author={classification.author}
            content={classification.content}
            votes={classification.votes}
            category={classification.category}
            tags={classification.tags || []}
            images={classification.image ? [classification.image] : []}
            anomalyId={classification.anomaly}
            classificationConfig={classification.classificationConfiguration}
            classificationType={classification.classificationtype}
            onVote={() =>
              handleVote(
                classification.id,
                classification.classificationConfiguration
              )
            }
          />
        ) : (
          <p className="text-center text-gray-400">Classification not found.</p>
        )}
      </div>
    </div>
  );
};