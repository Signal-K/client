'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { SimplePostSingle } from "@/content/Posts/SimplePostSingle";
import { SciFiButton } from "@/components/ui/styles/sci-fi/button";

interface Classification {
  id: number;
  created_at: string;
  content: string | null;
  author: string;
  anomaly: number | null;
  media?: any | null;
  classificationType: string | null;
  classificationConfiguration: any | null;
  planetType: string | null;
  images?: string[];
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
  
        const { data: comments, error: commentsError } = await supabase
          .from("comments")
          .select("classification_id")
          .filter("configuration", "cs", '{"preferred":true,"planetType":"Terrestrial"}');
  
        if (commentsError) throw commentsError;
  
        const classificationIds = comments.map((comment) => comment.classification_id).filter(Boolean);
  
        if (classificationIds.length === 0) {
          setClassifications([]);
          return;
        };
  
        const { data: classificationsData, error: classificationsError } = await supabase
          .from("classifications")
          .select("*")
          .in("id", classificationIds);
  
        if (classificationsError) throw classificationsError;
  
        const processedClassifications = classificationsData.map((classification) => {
          let images: string[] = [];
          if (classification.media) {
            if (Array.isArray(classification.media)) {
              images = classification.media.filter((url: any) => typeof url === "string");
            } else if (typeof classification.media === "object" && classification.media.uploadUrl) {
              images.push(classification.media.uploadUrl);
            };
          };
          return { ...classification, images };
        });
  
        setClassifications(processedClassifications);
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
      <div className="space-y-8">
        {loading ? (
          <p>Loading classifications...</p>
        ) : error ? (
          <p>{error}</p>
        ) : classifications.length === 0 ? (
          <p>No classifications found for preferred terrestrial planets.</p>
        ) : (
          classifications.map((classification) => (
            <div key={classification.id} className="space-y-4">
                <SimplePostSingle
                  id={classification.id.toString()}
                  title={`Classification #${classification.id}`}
                  author={classification.author}
                  content={classification.content || "No content available"}
                  category={classification.classificationType || "Unknown"}
                  images={classification.images || []}
                  classificationConfiguration={classification.classificationConfiguration}
                />
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
                <SciFiButton
                  onClick={() => onSelectAnomaly(classification.anomaly)}
                  className="mt-2 text-blue-500"
                >
                  Search this planet for anomalies to investigate
                </SciFiButton>
            </div>
            ))
        )}
      </div>
    );
};  