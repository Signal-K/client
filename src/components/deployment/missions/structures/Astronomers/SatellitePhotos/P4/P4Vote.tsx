'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/src/components/social/posts/PostSingle";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";

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
          const { data, error } = await supabase
            .from("classifications")
            .select('*')
            .eq('classificationtype', 'satellite-planetFour')
            .order('created_at', { ascending: false }) as { data: Classification[]; error: any };
      
          if (error) throw error;
      
          const processedData = data.map((classification) => {
            const media = classification.media;
            console.log(classification.media);
            let images: string[] = [];
          
            if (Array.isArray(media)) {
              images = media.map((item) => item.url); 
            } else if (media?.url) {
              images = [media.url]; 
            }
          
            return {
              ...classification,
              images, 
            };
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
          const response = await fetch("/api/gameplay/classifications/configuration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              classificationId,
              action: "increment_vote",
            }),
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            console.error("Error updating classificationConfiguration:", result?.error);
          } else {
            const updatedVotes = result?.classificationConfiguration?.votes ?? (currentConfig?.votes || 0) + 1;
            setClassifications((prevClassifications) =>
              prevClassifications.map((classification) =>
                classification.id === classificationId
                  ? { ...classification, votes: updatedVotes }
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