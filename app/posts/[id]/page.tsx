"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { SimplePostSingle } from "@/src/components/social/posts/SimplePostSingle";
import StructuresOnPlanet from "@/src/components/deployment/structures/Structures";
import Navbar from "@/src/components/layout/Navbar";
import GameNavbar from "@/src/components/layout/Tes";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

interface Classification {
  id: number;
  created_at: string;
  content: string | null;
  author: string | null;
  anomaly: number | null;
  media: string[] | null;
  classificationtype: string | null;
  classificationConfig?: any | null;
};

export default function SinglePostPage({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();

  const router = useRouter();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassification = async () => {
      const id = parseInt(params.id, 10);
      if (isNaN(id)) {
        setError("Invalid classification ID.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          setError("Classification not found.");
        } else {
          const flattenedMedia = (data.media || [])
            .flat()
            .filter((url: string) => typeof url === "string" && url.startsWith("http"));

          setClassification({
            ...data,
            media: flattenedMedia,
          });
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching the classification.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassification();
  }, [params.id, supabase]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <img
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/assets/Backdrops/Earth.png"
          alt="Backdrop"
        />
        <div className="relative z-10 text-white text-lg">Loading classification...</div>
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;
  if (!classification) return <p>No classification found.</p>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      <img
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/assets/Backdrops/Earth.png"
        alt="Backdrop"
      />

      <div className="w-full z-10">
        <GameNavbar />
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-12 min-h-screen">
        {classification.author && (
          <div className="w-full max-w-3xl">
            <SimplePostSingle
              id={classification.id.toString()}
              title={`Classification #${classification.id}`}
              author={classification.author || "Unknown"}
              content={classification.content || "No content available"}
              category={classification.classificationtype || "Unknown"}
              images={classification.media || []}
            />
            {/* <div className="mt-8">
              <StructuresOnPlanet author={classification.author} />
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};