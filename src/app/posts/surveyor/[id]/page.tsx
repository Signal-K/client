'use client';

import React, { useEffect, useState } from "react";
import PostCard from "@/src/components/social/posts/TestPostCard";
import StructuresOnPlanet from "@/src/components/deployment/structures/Structures";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

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
      const [classification, setClassification] = useState<Classification | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const { isDark, toggleDarkMode } = UseDarkMode();
    
      useEffect(() => {
        const fetchClassification = async () => {
          const id = parseInt(params.id, 10);
          if (isNaN(id)) {
            setError("Invalid classification ID.");
            setLoading(false);
            return;
          };
    
          try {
            const response = await fetch(`/api/gameplay/classifications/${id}`, { cache: "no-store" });
            const result = await response.json().catch(() => ({}));
            const data = result?.classification;
    
            if (!response.ok || !data) {
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
      }, [params.id]);
    
      if (loading)
        return (
          <div className="relative min-h-screen w-full flex flex-col">
            <div className="fixed inset-0 -z-10">
              <TelescopeBackground
                sectorX={0}
                sectorY={0}
                showAllAnomalies={false}
                isDarkTheme={isDark}
                variant="stars-only"
                onAnomalyClick={() => {}}
              />
            </div>
            <MainHeader
              isDark={isDark}
              onThemeToggle={toggleDarkMode}
              notificationsOpen={false}
              onToggleNotifications={() => {}}
              activityFeed={[]}
              otherClassifications={[]}
            />
            <div className="relative min-h-screen container mx-auto pt-24 py-8 text-white">
              <p>Loading classification...</p>
            </div>
          </div>
        );
    
      if (error) return <p>{error}</p>;
      if (!classification) return <p>No classification found.</p>;
    
      return (
        <div className="relative min-h-screen w-full flex flex-col">
          <div className="fixed inset-0 -z-10">
            <TelescopeBackground
              sectorX={0}
              sectorY={0}
              showAllAnomalies={false}
              isDarkTheme={isDark}
              variant="stars-only"
              onAnomalyClick={() => {}}
            />
          </div>
          <MainHeader
            isDark={isDark}
            onThemeToggle={toggleDarkMode}
            notificationsOpen={false}
            onToggleNotifications={() => {}}
            activityFeed={[]}
            otherClassifications={[]}
          />
          <div className="relative flex items-center justify-center min-h-screen container mx-auto pt-24 px-4">
            {classification.author && (
              <div className="w-full max-w-4xl">
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
