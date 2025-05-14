'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import StarnetLayout from "@/components/Layout/Starnet";
import PostCard from "@/content/Posts/TestPostCard";

interface Classification {
    id: number;
    created_at: string;
    content: string | null; 
    author: string | null;
    anomaly: number | null; 
    media: any | null; 
    classificationtype: string | null;
    classificationConfiguration: any | null; 
};

export default function VotePlanetClassifications() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const fetchClassifications = async () => {
        if (!session?.user) {
          setError("User session not found.");
          setLoading(false);
          return; 
        };

        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('classifications')
            .select('*')
            .eq('classificationtype', 'planet')
            .order('created_at', { ascending: false }) as { data: Classification[]; error: any };

          if (error) throw error;

          const processedData = data.map((classification) => {
            const media = classification.media;
            let image: string | null = null;

            if (Array.isArray(media)) {
                for (const subArray of media) {
                    if (Array.isArray(subArray) && subArray.length > 0) {
                        image = subArray[0];
                        break;
                    }
                }
            } else if (media && typeof media.uploadUrl === "string") {
                image = media.uploadUrl;
            }

            const votes = classification.classificationConfiguration?.votes || 0;

            return { ...classification, image, votes };
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
            setClassifications((prevClassifications) =>
              prevClassifications.map((classification) =>
                classification.id === classificationId
                  ? { ...classification, votes: updatedConfig.votes }
                  : classification
              )
            );
          }
        } catch (error) {
          console.error("Error voting:", error);
        };
    };

    const nextPost = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, classifications.length - 1));
    };

    const prevPost = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-gray-400">Loading classifications...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : classifications.length === 0 ? (
          <p className="text-center text-gray-400">No classifications available.</p>
        ) : (
          classifications.map((classification) => (
            <PostCard
              key={classification.id}
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
              onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
            />
                              /* <PostCardSingle
                    classificationId={classification.id}
                    title={classification.title}
                    author={classification.author}
                    content={classification.content}
                    votes={classification.votes || 0}
                    category={classification.category}
                    tags={classification.tags || []}
                    images={classification.image ? [classification.image] : []}
                    anomalyId={classification.anomaly}
                    classificationConfig={classification.classificationConfiguration}
                    classificationType={classification.classificationtype}
                    onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
                  /> */
          ))
        )}
      </div>
        
        {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
            <button
                onClick={prevPost}
                className="bg-gray-800 text-white p-2 rounded-l-md hover:bg-gray-600"
                disabled={currentIndex === 0}
            >
                Prev
            </button>
        </div>

        <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
            <button
                onClick={nextPost}
                className="bg-gray-800 text-white p-2 rounded-r-md hover:bg-gray-600"
                disabled={currentIndex === classifications.length - 1}
            >
                Next
            </button>
        </div> */}
      </div>
    );
};