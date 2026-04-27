"use client";

import React, { useEffect, useState } from "react";
import { PostCardSingleWithGenerator } from "@/src/components/social/posts/PostWithGen";
import { useSession } from "@/src/lib/auth/session-context";

interface ClassificationListProps {
  classificationType: string;
}

export default function ClassificationList({ classificationType }: ClassificationListProps) {
  const session = useSession();

  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(
      `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=${encodeURIComponent(classificationType)}&orderBy=created_at&ascending=false&limit=200`
    )
      .then((res) => res.json().then((payload) => ({ res, payload })))
      .then(({ res, payload }) => {
        if (!res.ok) throw new Error(payload?.error || "Failed to load classifications");
        const data: any[] = payload?.classifications || [];
        setClassifications(
          data.map((c) => {
            const media = c.media;
            const images: string[] = [];
            if (Array.isArray(media) && media.length === 2 && typeof media[1] === "string") {
              images.push(media[1]);
            } else if (media && typeof media === "object" && "uploadUrl" in media) {
              images.push((media as any).uploadUrl);
            }
            return { ...c, images, votes: c.classificationConfiguration?.votes || 0 };
          })
        );
      })
      .catch((err) => {
        console.error("Error fetching classifications:", err);
        setError("Failed to load classifications.");
      })
      .finally(() => setLoading(false));
  }, [session, classificationType]);

  if (loading) return <p>Loading classifications...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-8">
      {classifications.map((c) => (
        <PostCardSingleWithGenerator
          key={c.id}
          classificationId={Number(c.id)}
          title={c.title}
          author={c.author}
          content={c.content}
          votes={c.votes || 0}
          category={c.category}
          tags={c.tags || []}
          images={c.images || []}
          anomalyId={c.anomaly ?? ""}
          classificationConfig={c.classificationConfiguration}
          classificationType={c.classificationtype}
        />
      ))}
    </div>
  );
}
