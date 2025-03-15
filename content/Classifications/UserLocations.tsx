"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClassificationConfiguration {
  classificationOptions: { [key: string]: any };
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
  const [selectedRelatedClassification, setSelectedRelatedClassification] = useState<Classification | null>(null);

  async function fetchUserLocationClassifications() {
    if (!session) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    };

    try {
      const query = supabase
        .from("classifications")
        .select("*, anomalies(content)")
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (!showAllUsers) {
        query.eq("author", session.user.id);
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
              .eq("author", session.user.id);

            if (!relatedError && relatedData) {
              relatedClassifications = relatedData;
            };
          };

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

  if (loading) {
    return <p>Loading locations...</p>;
  };

  if (error) {
    return <p>{error}</p>;
  };

  if (!myLocations || myLocations.length === 0) {
    return <p>No locations found.</p>;
  };

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

        <TabsContent value="player" className="overflow-x-auto">
          <div className="flex gap-3 overflow-x-auto py-2">
            {myLocations
              .filter(location => location.author === session?.user?.id || showAllUsers)
              .map((location) => (
                <div
                  key={location.id}
                  className="flex-shrink-0 p-3 w-56 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]"
                >
                  <h3 className="font-semibold text-sm">{location.anomalyContent || `Location #${location.id}`}</h3>
                  <p className="text-xs">{location.content || ""}</p>

                  <Button
                    onClick={() => router.push(`/planets/${location.id}`)}
                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    View Classification
                  </Button>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="overflow-x-auto">
          <div className="flex gap-3 overflow-x-auto py-2">
            {myLocations
              .filter(location => location.relatedClassifications && location.relatedClassifications.length > 0)
              .map((location) => (
                <div
                  key={location.id}
                  className="flex-shrink-0 p-3 w-56 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]"
                >
                  <h3 className="font-semibold text-sm">{location.anomalyContent || `Location #${location.id}`}</h3>
                  <p className="text-xs">{location.content || ""}</p>

                  <Button
                    onClick={() => router.push(`/planets/${location.id}`)}
                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    View Classification
                  </Button>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};