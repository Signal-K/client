"use client";

import React, { useEffect, useState } from "react";
import { PostCardSingleWithGenerator } from "@/src/components/social/posts/PostWithGen";
import { useSession } from "@/src/lib/auth/session-context";

type Classification = {
  id: string;
  title: string;
  author: string;
  content: string;
  category: string;
  tags?: string[];
  media?: string[] | { uploadUrl: string };
  classificationConfiguration?: { votes?: number };
  anomaly?: string;
  classificationtype: string;
  votes?: number; // Added
  images?: string[]; // Added
};

export default function JVHCloudClassificationGenerator() {
  const session = useSession();

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassifications = async () => {
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=lidar-jovianVortexHunter&orderBy=created_at&ascending=false&limit=200`
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load classifications");
      const data = payload?.classifications || [];

      const processedData = data.map((classification: Classification) => {
        const media = classification.media;
        const images: string[] = [];

        if (Array.isArray(media) && media.length === 2 && typeof media[1] === "string") {
          images.push(media[1]);
        } else if (media && typeof media === "object" && "uploadUrl" in media) {
          images.push(media.uploadUrl);
        }

        const votes = classification.classificationConfiguration?.votes || 0;

        return { ...classification, images, votes };
      });

      setClassifications(processedData);
    } catch (error) {
      console.error("Error fetching classifications:", error);
      setError("Failed to load classifications.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchClassifications();
  }, [session]);

  return (
    <div className="space-y-8">
      {loading ? (
        <p>Loading classifications...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        classifications.map((classification) => (
          <PostCardSingleWithGenerator
            key={classification.id}
            classificationId={Number(classification.id)} // Convert to number
            title={classification.title}
            author={classification.author}
            content={classification.content}
            votes={classification.votes || 0}
            category={classification.category}
            tags={classification.tags || []}
            images={classification.images || []}
            anomalyId={classification.anomaly || ""} // Default to empty string
            classificationConfig={classification.classificationConfiguration}
            classificationType={classification.classificationtype}
          />
        ))
      )}
    </div>
  );
};
