'use client';

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PostCard from "@/src/components/social/posts/TestPostCard";
import GameNavbar from "@/src/components/layout/Tes";
import StructuresOnPlanet from "@/src/components/deployment/structures/Structures";

interface Classification {
    id: number;
    created_at: string;
    content: string | null;
    author: string | null;
    anomaly: number | null;
    media: string[] | null;
    classificationtype: string | null;
    classificationConfig?: any | null;
};

export default function SurveyorPostPage({ params }: { params: { id: string } }) {
    const supabase = useSupabaseClient();

      const [classification, setClassification] = useState<Classification | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
    
      useEffect(() => {
        const fetchClassification = async () => {
          const id = parseInt(params.id, 10);
          if (isNaN(id)) {
            setError("Invalid classification ID.");
            setLoading(false);
            return;
          };
    
          try {
            const { data, error } = await supabase
              .from("classifications")
              .select("*")
              .eq("id", id)
              .single();
    
            if (error || !data) {
              setError("Classification not found.");
            } else {
              const flattenedMedia = (data.media || [])
                .flat()
                .filter(
                  (url: string) => typeof url === "string" && url.startsWith("http")
                );
    
              setClassification({
                ...data,
                media: flattenedMedia,
              });
            }
          } catch (err) {
            console.error(err);
            setError("An error occurred while fetching the classification.");
          } finally {
            setLoading(false);
          }
        };
    
        fetchClassification();
      }, [params.id, supabase]);
    
      if (loading)
        return (
          <div className="min-h-screen w-full flex flex-col">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/Backdrops/Earth.png"
              alt="Backdrop"
            />
            <div className="relative min-h-screen container mx-auto py-8">
              <p>Loading classification...</p>
            </div>
          </div>
        );
    
      if (error) return <p>{error}</p>;
      if (!classification) return <p>No classification found.</p>;
    
      return (
        <div className="min-h-screen w-full flex flex-col">
          <GameNavbar />
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/Backdrops/Earth.png"
            alt="Backdrop"
          />
          <div className="relative flex items-center justify-center min-h-screen container mx-auto">
            {classification.author && (
              <div className="w-1/2">
                <PostCard
                  
                              title={`Classification #${classification.id}`}
                              author={classification.author || "Unknown"}
                              content={classification.content || "No content available"}
                              category={classification.classificationtype || "Unknown"}
                              images={classification.media || []} classificationId={0} anomalyId={classification.id.toString()} votes={0} classificationType={classification.classificationtype || ''}                />
                {/* <StructuresOnPlanet author={classification.author} /> */}
              </div>
            )}
          </div>
        </div>
      );
}