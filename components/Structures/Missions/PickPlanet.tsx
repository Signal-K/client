'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { SciFiButton } from "@/components/ui/styles/sci-fi/button";
import PickPlanetCard from "@/content/Posts/PickPlanetCard";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Classification {
  id: number;
  created_at: string;
  content: string | null;
  author: string;
  anomaly: number;
  media?: any | null;
  classificationType: string | null;
  classificationConfiguration: any | null;
  planetType: string | null;
  images?: string[];
  temperature?: string | null;
};

interface PreferredTerrestrialClassificationsProps {
  onSelectAnomaly: (anomalyId: number | null) => void;
};

export default function PreferredTerrestrialClassifications({
  onSelectAnomaly,
}: PreferredTerrestrialClassificationsProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassifications = async () => {
    try {
      setLoading(true);

      // Fetch comments with preferred terrestrial configurations
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("classification_id, configuration")
        .filter("configuration", "cs", '{"preferred":true,"planetType":"Terrestrial"}');

      if (commentsError) throw commentsError;

      const classificationIds = comments.map((comment) => comment.classification_id).filter(Boolean);

      if (classificationIds.length === 0) {
        setClassifications([]);
        return;
      }

      // Fetch classifications for the selected classification IDs
      const { data: classificationsData, error: classificationsError } = await supabase
        .from("classifications")
        .select("*")
        .in("id", classificationIds);

      if (classificationsError) throw classificationsError;

      // Fetch temperature comments for each classification
      const enrichedClassifications = await Promise.all(
        classificationsData.map(async (classification) => {
          const { data: tempComments, error: tempCommentsError } = await supabase
          .from("comments")
          .select("configuration")
          .eq("classification_id", classification.id)
          .filter("configuration->>temperature", "ilike", "%temperature%");

          if (tempCommentsError) console.error(tempCommentsError);

          const randomTempComment =
            tempComments && tempComments.length > 0
              ? tempComments[Math.floor(Math.random() * tempComments.length)]
              : null;

          let temperature = null;
          if (randomTempComment?.configuration?.temperature) {
            temperature = randomTempComment.configuration.temperature;
          }

          let images: string[] = [];
          if (classification.media) {
            if (Array.isArray(classification.media)) {
              images = classification.media.filter((url: any) => typeof url === "string");
            } else if (typeof classification.media === "object" && classification.media.uploadUrl) {
              images.push(classification.media.uploadUrl);
            };
          };

          return { ...classification, images, temperature };
        })
      );

      setClassifications(enrichedClassifications);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchClassifications();
  }, [session]);

  return (
    <div>
      {loading ? (
        <p>Loading classifications...</p>
      ) : error ? (
        <p>{error}</p>
      ) : classifications.length === 0 ? (
        <p>No classifications found for preferred terrestrial planets.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classifications.map((classification) => (
            <Card key={classification.id} className="bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-lg">
              <CardHeader>
                <PickPlanetCard
                  id={classification.id.toString()}
                  title={`Planet #${classification.id}`}
                  author={classification.author}
                  anomalyTitle=""
                  content={classification.content || "No content available"}
                  images={classification.images || []}
                  classificationConfiguration={classification.classificationConfiguration}
                  anomaly={classification.anomaly.toString()}
                />
                {classification.temperature && (
                  <p className="text-gray-500 mt-2">
                    Estimated Temperature: {classification.temperature}°C
                  </p>
                )}
                <SciFiButton
                  onClick={() => onSelectAnomaly(classification.anomaly)}
                  className="mt-2 text-blue-500"
                >
                  {/* Search this planet for anomalies to investigate */}
                  Search this planet
                </SciFiButton>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


                {/* <PostCardSingle
                    classificationId={classification.id}
                    title={`Classification #${classification.id}`}
                    author={classification.author}
                    content={classification.content || "No content available"}
                    votes={0}
                    category="Terrestrial"
                    tags={["Preferred", "Planet"]}
                    images={classification.media || []}
                    anomalyId={classification.anomaly?.toString() || "N/A"}
                    classificationType="planet"
                    classificationConfig={classification.classificationConfiguration}
                    commentStatus={false}
                    enableNewCommentingMethod={false}
                /> */}