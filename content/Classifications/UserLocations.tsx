"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, ArrowRightLeft } from "lucide-react";

interface ClassificationConfiguration {
  classificationOptions?: {
    radius?: number;
    biomassScore?: number;
    period?: string;
  };
  temperature?: string;
  parentPlanetLocation?: number;
};

interface Classification {
  author: string;
  id: number;
  content: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  classificationConfiguration?: ClassificationConfiguration;
  image_url?: string;
  images?: string[];
  anomalyContent?: string;
  relatedClassifications?: Classification[];
};

export default function MySettlementsLocations() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();

  const [myLocations, setMyLocations] = useState<Classification[] | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false);

  async function fetchUserLocationClassifications() {
    try {
      const query = supabase
        .from("classifications")
        .select("*, anomalies(content)")
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (!showAllUsers) {
        query.eq("author", session?.user.id);
      }

      const { data: locationClassificationData, error: lcError } = await query;

      if (lcError) throw lcError;

      const enrichedClassifications = await Promise.all(
        locationClassificationData.map(async (classification: any) => {
          let images: string[] = [];
          if (classification.media) {
            if (Array.isArray(classification.media)) {
              images = classification.media
                .map((item: { uploadUrl: string }) =>
                  typeof item === "string" ? item : item.uploadUrl || ""
                )
                .filter(Boolean);
            }
          }

          const anomalyContent = classification.anomalies?.content || null;

          let relatedClassifications: Classification[] = [];
          const parentPlanetLocation = classification.anomaly;
          if (parentPlanetLocation) {
            const { data: relatedData, error: relatedError } = await supabase
              .from("classifications")
              .select("*")
              .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString())
              .eq("author", session?.user.id);

            if (!relatedError && relatedData) {
              relatedClassifications = relatedData;
            }
          }

          return { ...classification, images, anomalyContent, relatedClassifications };
        })
      );

      setMyLocations(enrichedClassifications);
    } catch (err: any) {
      setError("An error occurred while fetching classifications.");
      console.error(err);
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchUserLocationClassifications();
  }, [session, showAllUsers]);

  if (loading) return <p>Loading locations...</p>;
  if (error) return <p>{error}</p>;
  if (!myLocations || myLocations.length === 0) return <p>No locations found. Discover some asteroids or planets using your telescope!</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
      <Tabs defaultValue="player" onValueChange={(val) => setShowAllUsers(val === "community")}>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-2">
          <TabsList className="bg-[#1e293b] border border-[#6b21a8] w-full sm:w-auto">
            <TabsTrigger value="player" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white w-1/2 sm:w-auto">
              My Locations
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white w-1/2 sm:w-auto">
              All Locations
            </TabsTrigger>
          </TabsList>
        </div>

        {["player", "community"].map((tab) => (
          <TabsContent key={tab} value={tab} className="overflow-x-auto">
            <div className="flex gap-3 overflow-x-auto py-2">
              {myLocations
                .filter(location =>
                  tab === "player"
                    ? location.author === session?.user?.id || showAllUsers
                    : location.relatedClassifications && location.relatedClassifications.length > 0
                )
                .map((location) => {
                  const config = location.classificationConfiguration || {};
                  const options = config.classificationOptions || {};
                  return (
                    <div
                      key={location.id}
                      className="flex-shrink-0 p-3 w-72 border border-gray-200 rounded-md shadow-md bg-[#2C4F64] space-y-3"
                    >
                      <div>
                        <h3 className="font-semibold text-sm">{location.anomalyContent || `Location #${location.id}`}</h3>
                        <p className="text-xs">{location.content || ""}</p>
                      </div>
                      <Button
                        onClick={() => router.push(`/planets/${location.id}`)}
                        className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        View Classification
                      </Button>
                      <PlanetProgress
                        temperature={config.temperature ? parseFloat(config.temperature) : null}
                        radius={options.radius ?? null}
                        biomassScore={options.biomassScore ?? 0}
                        period={options.period ?? ""}
                      />
                    </div>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function getBiomassStage(score: number) {
  if (score < 0.1) {
    return {
      label: "Awaiting Catalysts",
      description: "The world is waiting on weather events to spark life.",
      color: "from-gray-500 to-gray-700",
    };
  } else if (score < 0.3) {
    return {
      label: "Microbial Genesis",
      description: "Simple microbial and fungal life is forming.",
      color: "from-green-600 to-green-800",
    };
  } else if (score < 0.5) {
    return {
      label: "Biotic Expansion",
      description: "Life is spreading across the surface.",
      color: "from-teal-500 to-teal-800",
    };
  } else {
    return {
      label: "Ecological Complexity",
      description: "Complex ecosystems and adaptive traits emerging.",
      color: "from-emerald-400 to-emerald-700",
    };
  }
}

function PlanetProgress({
  temperature,
  radius,
  biomassScore,
  period,
}: {
  temperature: number | null;
  radius: number | null;
  biomassScore: number;
  period: string;
}) {
  const [chapter, setChapter] = useState<1 | 2>(1);
  const isConfirmed = {
    temperature: temperature !== null,
    radius: radius !== null,
    biomass: biomassScore !== null && !isNaN(biomassScore),
    period: period !== "",
  };

  const biomassPercent = Math.max(0, Math.min(biomassScore * 100, 100));
  const biomassStage = getBiomassStage(biomassScore);

  return (
    <div className="space-y-3 text-xs text-gray-300 font-medium">
      <div className="flex justify-between items-center">
        <div className="uppercase tracking-wide text-[10px] text-gray-400">Chapter {chapter}</div>
        <button
          onClick={() => setChapter(chapter === 1 ? 2 : 1)}
          className="flex items-center space-x-1 px-2 py-1 rounded border border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-300 text-[10px]"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Switch</span>
        </button>
      </div>

      {chapter === 1 ? (
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(isConfirmed).map(([key, value]) => (
            <div
              key={key}
              className={`flex items-center justify-center py-1 px-2 rounded-xl border text-[10px] uppercase tracking-wide
                ${value
                  ? "border-green-400 text-green-300 bg-gradient-to-br from-green-900 to-green-700"
                  : "border-gray-600 text-gray-400 bg-gradient-to-br from-gray-800 to-gray-700"
                }
              `}
            >
              {value ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
              {key}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-2 text-center text-[10px] text-gray-400">
          Values pending for Chapter 2
        </div>
      )}

      <div>
        <div className="uppercase tracking-wide text-[10px] text-gray-400 mb-1">Biomass Evolution</div>
        <div className="w-full h-2 rounded-xl bg-gray-800 shadow-inner overflow-hidden border border-gray-600">
          <div
            className={`h-full transition-all duration-700 rounded-xl bg-gradient-to-r ${biomassStage.color}`}
            style={{ width: `${biomassPercent}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] text-white font-semibold">{biomassStage.label}</div>
        <div className="text-[10px] text-gray-400">{biomassStage.description}</div>
      </div>
    </div>
  );
};