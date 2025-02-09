"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import SimplePlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/SimplePlanetGenerator";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";

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
}

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
      if (!params.id || !session) return; // Check if session is available

      const { data, error } = await supabase
        .from("classifications")
        .select("*, anomaly:anomalies(*)")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Failed to fetch classification.");
        setLoading(false);
        return;
      }

      // Set the fetched classification data
      setClassification(data);
      setAnomaly(data.anomaly);

      // Fetch related classifications if anomaly is available
      const parentPlanetLocation = data.anomaly;
      if (parentPlanetLocation) {
        const { data: relatedData, error: relatedError } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString())
          .eq("author", session.user.id);

        if (!relatedError && relatedData) {
          // Ensure we're safely updating the classification state
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
        <SimplePlanetGenerator
          classificationId={String(classification.id)}
          classificationConfig={classification.classificationConfiguration}
          author={classification.author}
        />
      )}
      {anomaly && classification.author === session?.user?.id && (
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
      {anomaly && (
        <div className="mt-6 p-4 bg-[#1E3A47] border border-gray-300 rounded-md">
          <h2 className="text-xl font-bold">Related Planet</h2>
          <p className="mt-2 text-sm">{anomaly.content || `Anomaly #${anomaly.id}`}</p>
          <p className="mt-1 text-sm">Type: {anomaly.anomalytype || "Unknown"}</p>
          <p className="mt-1 text-sm">Mass: {anomaly.mass ? `${anomaly.mass} kg` : "N/A"}</p>
          <p className="mt-1 text-sm">Radius: {anomaly.radius ? `${anomaly.radius} km` : "N/A"}</p>
          <p className="mt-1 text-sm">Density: {anomaly.density || "N/A"}</p>
          <p className="mt-1 text-sm">Gravity: {anomaly.gravity || "N/A"}</p>
          <p className="mt-1 text-sm">Orbital Period: {anomaly.orbital_period || "N/A"}</p>
          <p className="mt-1 text-sm">Temperature: {anomaly.temperature || "N/A"}K</p>
          <p className="mt-1 text-sm">Created At: {new Date(anomaly.created_at).toLocaleString()}</p>
          {anomaly.avatar_url && (
            <img
              src={anomaly.avatar_url}
              alt="Anomaly Avatar"
              className="mt-4 w-32 h-32 object-cover rounded-md border"
            />
          )}
        </div>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};