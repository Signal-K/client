'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";
import SatellitePlanetFourAggregator, { SatellitePlanetFourClassification } from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/P4Aggregator";
import AI4MAggregator from "@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AI4MAggregator";
import BuildTerrariumStructures from "@/components/Structures/Build/BuildOnTerrariums";
import StructuresOnTerrarium from "@/components/Structures/StructuresOnTerrarium";

export interface Classification {
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
};

export interface AggregatedP4 {
  fanCount: number;
  blotchCount: number;
  classificationCounts: Record<string, number>;
};

export interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
};

export interface AggregatedBalloon {
  shapeCount: number;
  vortexCount: number;
  streakCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
};

export interface AI4MClassification {
  id: number;
  classificationConfiguration: any;
  annotationOptions: any[]; 
};

export default function ClassificationDetail({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dominantBiome, setDominantBiome] = useState<string | null>('Jungle');
  const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
  const [p4Summary, setP4Summary] = useState<AggregatedP4 | null>(null);
  const [ai4MSummary, setAI4MSummary] = useState<AggregatedAI4M | null>(null);
  const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);

  const [showCurrentUser, setShowCurrentUser] = useState<boolean>(true);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

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
      };

      setClassification(data);
      setAnomaly(data.anomaly);

      const parentPlanetLocation = data.anomaly?.id;
      if (parentPlanetLocation) {
        const query = supabase
          .from("classifications")
          .select("*, anomaly:anomalies(*), classificationConfiguration, media")
          .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString());

        if (showCurrentUser) {
          query.eq("author", session.user.id);
        }

        const { data: relatedData, error: relatedError } = await query;

        if (relatedError) {
          setError("Failed to fetch related classifications.");
          setLoading(false);
          return;
        }

        if (relatedData) {
          const votePromises = relatedData.map(async (related) => {
            const { count, error: votesError } = await supabase
              .from("votes")
              .select("*", { count: "exact" })
              .eq("classification_id", related.id);

            if (votesError) {
              console.error("Error fetching votes:", votesError);
              return { ...related, votes: 0 };
            }

            return { ...related, votes: count };
          });

          const relatedClassificationsWithVotes = await Promise.all(votePromises);
          setRelatedClassifications(relatedClassificationsWithVotes);
        }
      }

      setLoading(false);
    };

    fetchClassification();
  }, [params.id, supabase, session, showCurrentUser]);

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
        Array.isArray(related.classificationConfiguration?.annotationOptions)
    )
    .map((related) => ({
      id: related.id,
      annotationOptions: related.classificationConfiguration?.annotationOptions || [],
      classificationConfiguration: related.classificationConfiguration || {}
    }));

  const ai4MClassifications: AI4MClassification[] = relatedClassifications.filter(
    (related) => related.classificationtype === "automaton-aiForMars"
  ).map((related) => ({
    id: related.id,
    classificationConfiguration: related.classificationConfiguration || {},
    annotationOptions: related.classificationConfiguration?.annotationOptions || []
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

  const toggleUserClassifications = () => {
    setShowCurrentUser((prev) => !prev);
  };

  const toggleMetadataVisibility = () => {
    setShowMetadata((prev) => !prev);
  };

  const getBackgroundImage = (planetType: string | null) => {
    switch (planetType) {
      case "Terrestrial":
        return "url('/assets/Backdrops/Venus.png')";
      case "Gaseous":
        return "url('/assets/Backdrops/gasgiant.jpeg')";
      default:
        return "url('/assets/Backdrops/Earth.png')";
    };
  };

  return (
    <div
      className="p-6 bg-black text-white border rounded-md opacity-80 shadow-md relative"
      style={{
        backgroundImage: getBackgroundImage(classification.classificationConfiguration?.planetType || null),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />
      <div className="py-5"></div>
      <h1 className="text-2xl font-bold">{classification.classificationConfiguration?.planetType || classification.content || `Planet #${classification.id}`}</h1>
      {classification.author && (
        <><PostCardSingleWithGenerator
          key={classification.id}
          classificationId={classification.id}
          title={classification.title || "Untitled"}
          author={classification.author || "Unknown"}
          content={classification.content || "No content available"}
          votes={classification.votes || 0}
          category={classification.classificationtype || "Uncategorized"}
          // images={classification.images || []}
          anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
          classificationConfig={classification.classificationConfiguration}
          classificationType={classification.classificationtype || "Unknown"}
          tags={classification.tags || []}
          images={classification.images || []} 
          biome={dominantBiome || ''}
        />
        </>
      )}

      <BuildTerrariumStructures location={classification.id} />
      <StructuresOnTerrarium location={classification.id} />

      {(cloudSummary || p4Summary || ai4MSummary) && (
        <BiomeAggregator
          cloudSummary={cloudSummary}
          p4Summary={p4Summary}
          ai4MSummary={ai4MSummary}
          onBiomeUpdate={(biome) => setDominantBiome(biome)}
        />
      )}

      {/* Toggle Buttons */}
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={toggleUserClassifications}
        >
          {showCurrentUser ? "Show All Classifications" : "Show My Classifications"}
        </button>
        <button 
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={toggleMetadataVisibility}
        >
          {showMetadata ? "Hide Metadata" : "Show Metadata"}
        </button>
      </div>

      {/* Show Metadata (if toggle is on) */}
      {showMetadata && (
        <>
          {/* Cloud Classification Summary */}
          {cloudClassifications.length > 0 && (
            <CloudClassificationSummary
              classifications={cloudClassifications}
              onSummaryUpdate={handleCloudSummaryUpdate}
            />
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
        </>
      )}

      {/* Related Classifications */}
      {/* {relatedClassifications.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold">Related Classifications</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {relatedClassifications.map((related) => (
              <PostCardSingleWithGenerator
                key={related.id}
                classificationId={related.id}
                title={related.title || "Untitled"}
                author={related.author || "Unknown"}
                content={related.content || "No content available"}
                votes={related.votes || 0}
                category={related.classificationtype || "Uncategorized"}
                tags={related.tags || []}
                images={related.images || []} anomalyId={""} classificationType={""}              />
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}