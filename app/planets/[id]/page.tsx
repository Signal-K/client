'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";
import SatellitePlanetFourAggregator, { SatellitePlanetFourClassification } from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/P4Aggregator";
import AI4MAggregator from "@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AI4MAggregator";

export interface Classification {
  id: number;
  content: string | null;
  author: string | null;
  anomaly: Anomaly | null;
  media: (string | { uploadUrl?: string })[] | null;
  classificationtype: string | null;
  classificationConfiguration?: any; // classificationConfiguration is now optional
  created_at: string;
  title?: string;
  votes?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  relatedClassifications?: Classification[];
};

export type Anomaly = {
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

export interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  additionalFields: Record<string, Set<string>>;
  cloudColours?: Record<string, number>;
}

export interface AggregatedP4 {
  fanCount: number;
  blotchCount: number;
  classificationCounts: Record<string, number>;
}

export interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
}

export interface AI4MClassification {
  id: number;
  classificationConfiguration: any;
  annotationOptions: any[];  // Ensure annotationOptions is an array, as required by the aggregator
}

export default function ClassificationDetail({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
  const [p4Summary, setP4Summary] = useState<AggregatedP4 | null>(null);
  const [ai4MSummary, setAI4MSummary] = useState<AggregatedAI4M | null>(null);
  const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);

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

        if (relatedData) {
          setRelatedClassifications(relatedData);
        }
      }

      setLoading(false);
    };

    fetchClassification();
  }, [params.id, supabase, session]);

  if (loading) return <p>Loading classification data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!classification) return <p>Classification not found.</p>;

  const cloudClassifications = relatedClassifications.filter(
    (related) => related.classificationtype === "cloud"
  );

  const satelliteP4Classifications: SatellitePlanetFourClassification[] = relatedClassifications
    .filter(
      (related): related is Classification & SatellitePlanetFourClassification =>
        related.classificationtype === "satellite-planetFour" &&
        Array.isArray(related.classificationConfiguration?.annotationOptions) // Ensures annotationOptions is an array
    )
    .map((related) => ({
      id: related.id,
      annotationOptions: related.classificationConfiguration?.annotationOptions || [], // Defaults to empty array
      classificationConfiguration: related.classificationConfiguration || {}
    }));

  const ai4MClassifications: AI4MClassification[] = relatedClassifications.filter(
    (related) => related.classificationtype === "automaton-aiForMars"
  ).map((related) => ({
    id: related.id,
    classificationConfiguration: related.classificationConfiguration || {},
    annotationOptions: related.classificationConfiguration?.annotationOptions || []  // Ensure annotationOptions is included
  }));

  const handleCloudSummaryUpdate = (summary: AggregatedCloud) => {
    setCloudSummary(summary);
  };

  const handleP4SummaryUpdate = (summary: AggregatedP4) => {
    setP4Summary(summary);
  };

  const handleAI4MSummaryUpdate = (summary: AggregatedAI4M) => {
    setAI4MSummary(summary);
  };

  return (
    <div className="p-6 bg-black text-white border border-gray-200 rounded-md shadow-md">
      <Navbar />
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-[-1]"
        src="/assets/Backdrops/Venus.png"
        alt="Barren (default planet type) background"
      />
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
          category={classification.classificationtype || "Uncategorized"}
          tags={classification.tags || []}
          images={classification.images || []}
          anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
          classificationConfig={classification.classificationConfiguration}
          classificationType={classification.classificationtype || "Unknown"}
        />
      )}

      {/* Cloud Classification Summary */}
      {cloudClassifications.length > 0 && (
        <CloudClassificationSummary
          classifications={cloudClassifications}
          onSummaryUpdate={handleCloudSummaryUpdate}
        />
      )}

      {/* Biome Aggregation */}
      {cloudSummary && Object.keys(cloudSummary.annotationOptions).length > 0 && (
        <BiomeAggregator cloudSummary={cloudSummary} />
      )}

      {/* SP4 Classification Summary */}
      {satelliteP4Classifications.length > 0 && (
        <SatellitePlanetFourAggregator
          classifications={satelliteP4Classifications}
          onSummaryUpdate={handleP4SummaryUpdate}
        />
      )}

      {/* AI4M Classification Summary */}
      {ai4MClassifications.length > 0 && (
        <AI4MAggregator
          classifications={ai4MClassifications}
          onSummaryUpdate={handleAI4MSummaryUpdate}
        />
      )}

      {/* Related Classifications Section */}
      {relatedClassifications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Related Classifications</h3>
          {relatedClassifications.map((related) => (
            <div key={related.id} className="mt-4">
              <h4 className="text-lg font-semibold">{related.classificationtype}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
                  <h4 className="font-bold text-lg">Classification #{related.id}</h4>
                  <p className="mt-2 text-sm">{related.anomaly?.content || "No anomaly content"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};