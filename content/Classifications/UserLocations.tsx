"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClassificationComments from "./ClassificationStats";

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
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false); // State to toggle view
  const [selectedRelatedClassification, setSelectedRelatedClassification] = useState<Classification | null>(null); // State to toggle media and configuration view

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
        query.eq("author", session.user.id); // Only fetch the user's classifications
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
    }
  };

  useEffect(() => {
    fetchUserLocationClassifications();
  }, [session, showAllUsers]);

  if (loading) {
    return <p>Loading locations...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!myLocations || myLocations.length === 0) {
    return <p>No locations found.</p>;
  }

  const displayedAnomalies = new Set<number>();

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => setShowAllUsers(!showAllUsers)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          {showAllUsers ? "Show My Planets Only" : "Show Planets by All Users"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myLocations
          .filter(location =>
            location.relatedClassifications &&
            location.relatedClassifications.length > 0 &&
            !displayedAnomalies.has(location.anomaly)
          )
          .map((location) => {
            displayedAnomalies.add(location.anomaly);

            return (
              <div
                key={location.id}
                className="p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]"
              >
                <h3 className="font-bold text-lg">
                  {location.anomalyContent || `Location #${location.id}`}
                </h3>
                <p>{location.content || ""}</p>

                {location.images && location.images.length > 0 && (
                  <div className="mt-2">
                    {location.relatedClassifications && location.relatedClassifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-md">Related Classifications:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300">
                          {location.relatedClassifications.map((related) => (
                            <li key={related.id}>
                              <button
                                onClick={() => {
                                  console.log('Selected related classification:', related);
                                  setSelectedRelatedClassification(related);
                                }}
                                className="text-blue-400 hover:underline"
                              >
                                {related.content || `Classification #${related.id}`}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {location.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Location ${location.id} - Image ${index + 1}`}
                        className="w-full h-auto rounded-md"
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => router.push(`/planets/${location.id}`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                >
                  View Classification
                </button>
              </div>
            );
          })}
      </div>

      {selectedRelatedClassification && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
          <h3 className="font-bold text-lg">Selected Related Classification #{selectedRelatedClassification.id}</h3>
          <p>{selectedRelatedClassification.content}</p>
          <div className="mt-2">
            {selectedRelatedClassification.media && selectedRelatedClassification.media.length > 0 && (
              <div>
                <h4 className="font-semibold text-md">Media URLs:</h4>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {selectedRelatedClassification.media.map((media, index) => (
                    <li key={index}>{typeof media === "string" ? media : media.uploadUrl}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedRelatedClassification.classificationConfiguration && (
              <div className="mt-2">
                <h4 className="font-semibold text-md">Classification Configuration:</h4>
                <pre className="bg-gray-800 text-white p-2 rounded-md">
                  {JSON.stringify(selectedRelatedClassification.classificationConfiguration, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};