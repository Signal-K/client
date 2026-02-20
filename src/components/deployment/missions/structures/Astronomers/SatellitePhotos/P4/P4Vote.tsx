'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/src/components/social/posts/PostSingle";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { incrementClassificationVote } from "@/src/lib/gameplay/classification-vote";
import { fetchClassificationsForVoting } from "@/src/lib/gameplay/classification-list";

export default function VoteP4Classifications() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClassifications = async () => {
        if (!session?.user) {
          setError("User session not found.");
          setLoading(false);
          return;
        };
      
        setLoading(true);
        setError(null);
        try {
          const processedData = await fetchClassificationsForVoting({
            supabase,
            classificationType: "satellite-planetFour",
            getImages: (media) => {
              if (Array.isArray(media)) {
                return media
                  .map((item: any) => item?.url)
                  .filter((url: unknown): url is string => typeof url === "string");
              }
              if (media && typeof media === "object" && "url" in media && typeof (media as any).url === "string") {
                return [(media as any).url];
              }
              return [];
            },
          });          
      
          setClassifications(processedData);
        } catch (error) {
          console.error("Error fetching classifications:", error);
          setError("Failed to load classifications.");
        } finally {
          setLoading(false);
        };
    };  

    useEffect(() => {
        fetchClassifications();
    }, [session]);

    const handleVote = async (classificationId: number, currentConfig: any) => {
        const updatedVotes = await incrementClassificationVote(
          classificationId,
          currentConfig?.votes || 0
        );

        if (updatedVotes === null) {
          return;
        }

        setClassifications((prevClassifications) =>
          prevClassifications.map((classification) =>
            classification.id === classificationId
              ? { ...classification, votes: updatedVotes }
              : classification
          )
        );
    };

    return (
          <div className="space-y-8">
            {loading ? (
              <p>Loading classifications...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              classifications.map((classification) => (
<PostCardSingle
  key={classification.id}
  classificationId={classification.id}
  title={classification.title || "Untitled"}
  author={classification.author || "Anonymous"}
  content={classification.content || ""}
  votes={classification.votes || 0}
  category="Satellite"
  anomalyId={classification.anomaly?.toString() || ""}
  images={classification.images || []}
  classificationType={classification.classificationtype || ""}
  classificationConfig={classification.classificationConfiguration}
  // enableNewCommentingMethod
/>
              ))
            )}
          </div>
    );
};
