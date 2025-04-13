'use client';

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import Link from "next/link";

const BiodomeStructureBase = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchUploads = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("author", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching uploads:", error);
      } else {
        setUploads(data || []);
      }
      setLoading(false);
    };

    fetchUploads();
  }, [session, supabase]);

  if (!session) {
    return <p>Please log in to view your uploads.</p>;
  }

  return (
    <div className="p-6">
      <Navbar />
      <h2 className="text-3xl font-bold mb-6">Your Uploads</h2>

      {loading ? (
        <p>Loading...</p>
      ) : uploads.length === 0 ? (
        <p>No uploads found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => {
            const config = upload.configuration || {};
            const biome = config.natural_habitat?.biomes?.toLowerCase();
            const scenePath =
              biome === "ocean"
                ? "/scenes/ocean"
                : biome === "desert"
                ? "/scenes/desert"
                : null;

            return (
              <div
                key={upload.id}
                className="relative bg-gray-800 text-white rounded-xl p-6 shadow-lg flex flex-col"
                style={{ background: "#2D2D2D" }}
              >
                <div className="absolute top-4 right-4 text-gray-400 text-sm">
                  {new Date(upload.created_at).toLocaleDateString()}
                </div>

                <img
                  src={upload.file_url}
                  alt={config.common_name || "Unknown Species"}
                  className="w-full h-48 object-contain rounded-md bg-gray-900"
                />

                <h3 className="text-2xl font-semibold mt-4">
                  {config.common_name || "Unknown Species"}
                </h3>
                <p className="text-gray-400">
                  {config.kingdom} → {config.phylum} → {config.class}
                </p>

                <div className="mt-4">
                  <h4 className="text-lg font-medium">Traits:</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(config.traits) ? config.traits : []).map((trait: string) => (
                      <span
                        key={trait}
                        className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}

                    {(!config.traits || (Array.isArray(config.traits) && config.traits.length === 0)) && (
                      <span className="text-gray-500">No traits available</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-medium">Habitat:</h4>
                  <p className="text-gray-300">
                    {config.natural_habitat?.biomes || "Unknown"}
                  </p>
                  <p className="text-gray-300">
                    {config.natural_habitat?.geographical_distribution || "Unknown"}
                  </p>
                </div>

                {config.characteristics && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium">Characteristics:</h4>
                    <ul className="text-gray-300 text-sm list-disc ml-4">
                      {Object.entries(config.characteristics).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scenePath && (
                  <Link
                    href={scenePath}
                    className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2 px-4 rounded-xl transition duration-200"
                  >
                    View {biome.charAt(0).toUpperCase() + biome.slice(1)} Scene
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BiodomeStructureBase;