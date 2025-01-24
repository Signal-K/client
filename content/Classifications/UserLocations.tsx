"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

interface ClassificationConfiguration {
  classificationOptions: { [key: string]: any };
  temperature?: string;
};

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  classificationConfiguration?: ClassificationConfiguration;
  image_url?: string;
  images?: string[];
};

export default function MySettlementsLocations() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [myLocations, setMyLocations] = useState<Classification[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUserLocationClassifications() {
    if (!session?.user) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    };

    try {
      const { data: locationClassificationData, error: lcError } = await supabase
        .from("classifications")
        .select("*")
        .eq("author", session.user.id)
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (lcError) throw lcError;

      const enrichedClassifications = locationClassificationData.map((classification: Classification) => {
        let images: string[] = [];
        if (classification.media) {
          if (Array.isArray(classification.media)) {
            images = classification.media.map((item) =>
              typeof item === "string" ? item : item.uploadUrl || ""
            ).filter(Boolean);
          };
        };
        return { ...classification, images };
      });

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
  }, [session]);

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {myLocations.map((location) => (
        <div
          key={location.id}
          className="p-4 border border-gray-200 rounded-md shadow-md bg-white"
        >
          <h3 className="font-bold text-lg">{location.title || `Location #${location.id}`}</h3>
          <p>{location.content || "No description available."}</p>
          {location.images && location.images.length > 0 && (
            <div className="mt-2">
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
        </div>
      ))}
    </div>
  );
};