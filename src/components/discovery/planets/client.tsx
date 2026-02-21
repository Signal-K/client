'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import Navbar from "@/src/components/layout/Navbar";
import { PostCardSingleWithGenerator } from "@/src/components/social/posts/PostWithGen";

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
};

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

export default function CloudDetailsClient({ id }: { id: number }) {
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !session) {
      setLoading(false);
      return;
    }

    const fetchClassification = async () => {
      const res = await fetch(
        `/api/gameplay/classifications?id=${encodeURIComponent(String(id))}&includeAnomaly=true&limit=1`
      );
      const payload = await res.json();
      if (!res.ok || !payload?.classifications?.[0]) {
        setError("Failed to fetch classification.");
        setLoading(false);
        return;
      }
      const data = payload.classifications[0] as Classification;

      setClassification(data);
      setAnomaly(data.anomaly);
      setLoading(false);
    };

    fetchClassification();
  }, [id, session]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6 bg-black text-white border border-gray-200 rounded-md shadow-md">
      <Navbar />
      <div className="py-5"></div>
      <h1 className="text-2xl font-bold">
        {classification?.content || `Cloud #${classification?.id}`}
      </h1>
      {classification?.author && (
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
    </div>
  );
};
