"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import ClassificationComments from "@/content/Classifications/ClassificationStats";

interface Classification {
  id: number;
  content: string | null;
  author: string | null;
  anomaly: Anomaly | null;
  media: (string | { uploadUrl?: string })[] | null;
  classificationtype: string | null;
  classificationConfiguration?: any;
  created_at: string;
  title?: string;
  votes?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  relatedClassifications?: Classification[];
};

type Anomaly = {
  id: number;
  content: string | null;
  anomalytype: string | null;
  mass: number | null;
  radius: number | null;
  density: number | null;
  gravity: number | null;
  temperature: number | null;
  orbital_period: number | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ClassificationDetail({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchClassification = async () => {
      if (!params.id || !session) return;

      const { data, error } = await supabase
        .from("classifications")
        .select("*, anomaly:anomalies(*), classificationConfiguration, media")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Failed to fetch classification.");
        setLoading(false);
        return;
      }

      setClassification(data);
      setAnomaly(data.anomaly);

      // Debugging step: Log the fetched classification
      console.log("Fetched classification:", data);

      const parentPlanetLocation = data.anomaly?.id;
      if (parentPlanetLocation) {
        const { data: relatedData, error: relatedError } = await supabase
          .from("classifications")
          .select("*, anomaly:anomalies(*), classificationConfiguration, media")
          .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString())
          .eq("author", session.user.id);

        if (relatedError) {
          setError("Failed to fetch related classifications.");
          setLoading(false);
          return;
        }

        // Debugging step: Log the related classifications
        console.log("Related classifications:", relatedData);

        if (relatedData) {
          setClassification((prevState) => {
            if (prevState) {
              return {
                ...prevState,
                relatedClassifications: relatedData,
              };
            }
            return prevState;
          });
        }
      }

      setLoading(false);
    };

    fetchClassification();
  }, [params.id, supabase, session]);

  if (loading) return <p>Loading classification data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!classification) return <p>Classification not found.</p>;

  return (
    <div className="p-6 bg-black text-white border border-gray-200 rounded-md shadow-md">
      <Navbar />
      <div className="py-5"></div>
      <h1 className="text-2xl font-bold">{classification.content || `Planet #${classification.id}`}</h1>
      {classification.author && (
        <PostCardSingleWithGenerator
          key={classification.id}
          classificationId={classification.id}
          title={classification.title || "Untitled"}
          author={classification.author || "Unknown"}
          content={classification.content || "No content available"}
          votes={classification.votes || 0}
          category={classification.category || "Uncategorized"}
          tags={classification.tags || []}
          images={classification.images || []}
          anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
          classificationConfig={classification.classificationConfiguration}
          classificationType={classification.classificationtype || "Unknown"}
        />
      )}
      
      {classification.relatedClassifications && classification.relatedClassifications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Related Classifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {classification.relatedClassifications.map((related: Classification) => (
              <div
                key={related.id}
                className="p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]"
              >
                <h4 className="font-bold text-lg">Classification #{related.id}</h4>
                <p className="mt-2 text-sm">{related.anomaly?.content || "No anomaly content"}</p>

                {/* Displaying media */}
                {related.media && related.media.length > 0 && (
                  <div className="mt-2">
                    {related.media.map((media, index) => (
                      <img
                        key={index}
                        src={typeof media === "string" ? media : media.uploadUrl}
                        alt={`Related Classification #${related.id} - Image ${index + 1}`}
                        className="w-full h-auto rounded-md"
                      />
                    ))}
                  </div>
                )}

                {/* Displaying classification configuration */}
                {related.classificationConfiguration && (
                  <div className="mt-2 p-2 bg-gray-800 text-white rounded-md">
                    <pre>{JSON.stringify(related.classificationConfiguration, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {classification.classificationConfiguration && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
          <h3 className="text-xl font-bold">Classification Configuration</h3>
          <pre className="bg-gray-800 text-white p-2 rounded-md">
            {JSON.stringify(classification.classificationConfiguration, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};