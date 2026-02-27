"use client";

import React, { useEffect, useState } from "react";
import { SimplePostSingle } from "@/src/components/social/posts/SimplePostSingle";
import { useRouter } from "next/navigation";
import { SourceClassificationCallout } from "@/src/components/classifications/SourceClassificationCallout";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

interface Classification {
  id: number;
  created_at: string;
  content: string | null;
  author: string | null;
  anomaly: number | null;
  media: string[] | null;
  classificationtype: string | null;
  classificationConfiguration?: any | null;
};

export default function SinglePostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isDark, toggleDarkMode } = UseDarkMode();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceClassificationMedia, setSourceClassificationMedia] = useState<string[]>([]);

  useEffect(() => {
    const fetchClassification = async () => {
      const id = parseInt(params.id, 10);
      if (isNaN(id)) {
        setError("Invalid classification ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/gameplay/classifications/${id}`, { cache: "no-store" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result?.classification) {
          setError("Classification not found.");
        } else {
          const data = result.classification;
          const flattenedMedia = (data.media || [])
            .flat()
            .filter((url: string) => typeof url === "string" && url.startsWith("http"));

          setClassification({
            ...data,
            media: flattenedMedia,
          });

          const extractedMedia: string[] = [];
          const sourceMedia = Array.isArray(result?.sourceMedia) ? result.sourceMedia : [];
          for (const item of sourceMedia) {
            if (Array.isArray(item) && typeof item[0] === "string" && item[0].startsWith("http")) {
              extractedMedia.push(item[0]);
            } else if (typeof item === "string" && item.startsWith("http")) {
              extractedMedia.push(item);
            }
          }
          setSourceClassificationMedia(extractedMedia);
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
      <div className="min-h-screen relative">
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
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="relative z-10 text-white text-lg">Loading classification...</div>
        </div>
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;
  if (!classification) return <p>No classification found.</p>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
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
      <div className="relative z-10 pt-20 flex items-center justify-center px-4 py-12 min-h-screen">
        {classification.author && (
          <div className="w-full max-w-3xl space-y-4">
            {/* Source Classification Callout */}
            {classification?.classificationConfiguration?.source_classification_id && (
              <SourceClassificationCallout 
                classificationConfiguration={classification.classificationConfiguration}
              />
            )}
            
            <SimplePostSingle
              id={classification.id.toString()}
              title={`Classification #${classification.id}`}
              author={classification.author || "Unknown"}
              content={classification.content || "No content available"}
              category={classification.classificationtype || "Unknown"}
              images={classification.media || []}
              sourceMedia={sourceClassificationMedia}
            />
            {/* <div className="mt-8">
              <StructuresOnPlanet author={classification.author} />
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};
