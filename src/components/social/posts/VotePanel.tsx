'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/src/components/social/posts/PostSingle";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { incrementClassificationVote } from "@/src/lib/gameplay/classification-vote";
import { fetchClassificationsForVoting } from "@/src/lib/gameplay/classification-list";

interface VotePanelProps {
  classificationType: string;
  getImages?: (media: any) => string[];
}

const defaultGetImages = (media: any): string[] => {
  if (Array.isArray(media) && media.length === 2 && typeof media[1] === "string") {
    return [media[1]];
  }
  if (media && typeof media === "object" && "uploadUrl" in media && typeof (media as any).uploadUrl === "string") {
    return [(media as any).uploadUrl];
  }
  return [];
};

export default function VotePanel({ classificationType, getImages = defaultGetImages }: VotePanelProps) {
  const supabase = useSupabaseClient();
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

    fetchClassificationsForVoting({ supabase, classificationType, getImages })
      .then(setClassifications)
      .catch((err) => {
        console.error("Error fetching classifications:", err);
        setError("Failed to load classifications.");
      })
      .finally(() => setLoading(false));
  }, [session, classificationType]);

  const handleVote = async (classificationId: number, currentConfig: any) => {
    const updatedVotes = await incrementClassificationVote(classificationId, currentConfig?.votes || 0);
    if (updatedVotes === null) return;
    setClassifications((prev) =>
      prev.map((c) => (c.id === classificationId ? { ...c, votes: updatedVotes } : c))
    );
  };

  if (loading) return <p>Loading classifications...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-8">
      {classifications.map((classification) => (
        <PostCardSingle
          key={classification.id}
          classificationId={classification.id}
          title={classification.title}
          author={classification.author}
          content={classification.content}
          votes={classification.votes || 0}
          category={classification.category}
          tags={classification.tags || []}
          images={classification.images || []}
          anomalyId={classification.anomaly}
          classificationConfig={classification.classificationConfiguration}
          classificationType={classification.classificationtype}
          onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
        />
      ))}
    </div>
  );
}
