'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

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

export default function VotePPClassifications() {
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
          const { data, error } = await supabase
            .from("classifications")
            .select('*')
            .eq('classificationtype', 'zoodex-planktonPortal')
            .order('created_at', { ascending: false }) as { data: Classification[]; error: any };
      
          if (error) throw error;
      
          const processedData = data.map((classification) => {
            const media = classification.media;
            let images: string[] = [];
      
            if (Array.isArray(media) && media.length === 2 && typeof media[1] === "string") {
              images.push(media[1]);
            } else if (media && media.uploadUrl) {
              images.push(media.uploadUrl);
            };
      
            const votes = classification.classificationConfiguration?.votes || 0;
      
            return { ...classification, images, votes };
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
                  title={classification.title}
                  author={classification.author}
                  content={classification.content}
                  votes={classification.votes || 0}
                  category={classification.category}
                  tags={classification.tags || []}
                  images={classification.images || []}
                  anomalyId={classification.anomaly}
                  classificationConfig={classification.classificationConfiguration}
                  classificationType={classification.classificationtype}
                  onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
                />
              ))
            )}
          </div>
    );
};