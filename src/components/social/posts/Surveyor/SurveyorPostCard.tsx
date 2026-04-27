"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useRouter } from "next/navigation";
import { CommentCard } from "@/src/components/social/comments/CommentSingle";
import { SuccessPopup } from "@/src/components/ui/SuccessPopup";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  isSurveyor?: boolean;
  configuration?: {
    planetType?: string;
  };
  category?: string;
  value?: string;
}

interface PostCardSingleProps {
  classificationId: number;
  anomalyId: string;
  author: string;
  tags?: string[];
  classificationConfig?: any;
  enableNewCommentingMethod?: boolean;
  children?: React.ReactNode;
  commentStatus?: boolean;
}

export function SurveyorComments({
  classificationId,
  author,
  anomalyId,
  classificationConfig,
  commentStatus,
}: PostCardSingleProps) {
  const router = useRouter();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [temperatureInputs, setTemperatureInputs] = useState<Record<string, string>>({});
  const [densityInputs, setDensityInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(
        `/api/gameplay/social/comments?classificationId=${classificationId}&surveyor=true&order=desc`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.comments) throw new Error(payload?.error || "Failed to fetch comments");
      setComments(payload.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleProposePlanetType = async (planetType: "Terrestrial" | "Gaseous") => {
    const commentInput = commentInputs[`${classificationId}-1`];

    if (!commentInput?.trim()) return;

    try {
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: commentInput,
          configuration: { planetType, commentInput },
          surveyor: "TRUE",
          category: "PlanetType",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to post surveyor comment");

      
      
      setCommentInputs((prev) => ({ ...prev, [`${classificationId}-1`]: "" }));
      
      
      setShowSuccessPopup(true);
      
      
      fetchComments();
      
      
      // Show popup and redirect after 3 seconds
      const redirectTimeout = setTimeout(() => {
        
        try {
          router.push('/');
          
        } catch (error) {
          console.error('SurveyorComments: Router.push error:', error);
          // Fallback to window.location
          if (typeof window !== "undefined") {
            window.location.href = '/';
          }
        }
      }, 3000);
      
        
    } catch (error) {
      console.error("Error inserting comment:", error);
    }
  };

  const handleAddTemperatureComment = async () => {
    const t1 = temperatureInputs[`${classificationId}-1`];
    const t2 = temperatureInputs[`${classificationId}-2`];
    if (!t1?.trim() || !t2?.trim()) return;

    try {
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${t1}\n\n${t2}`,
          configuration: { temperature: `${t1}, ${t2}` },
          surveyor: "TRUE",
          value: t2,
          category: "Temperature",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to post temperature comment");
      
      
      setTemperatureInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
      setShowSuccessPopup(true);
      fetchComments();
      
      // Show popup and redirect after 3 seconds
      const redirectTimeout = setTimeout(() => {
        
        try {
          router.push('/');
          
        } catch (error) {
          console.error('SurveyorComments: Router.push error:', error);
          // Fallback to window.location
          if (typeof window !== "undefined") {
            window.location.href = '/';
          }
        }
      }, 3000);
      
      
    } catch (error) {
      console.error("Error adding temperature comment:", error);
    }
  };

  const handleAddDensityComment = async () => {
    const d1 = densityInputs[`${classificationId}-1`];
    const d2 = densityInputs[`${classificationId}-2`];
    if (!d1?.trim() || !d2?.trim()) return;

    try {
      const response = await fetch("/api/gameplay/surveyor/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          content: `${d1}\n\n${d2}`,
          configuration: { density: `${d1}, ${d2}` },
          surveyor: "TRUE",
          value: d2,
          category: "Density",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to post density comment");

      
      setDensityInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
      setShowSuccessPopup(true);
      fetchComments();
      
      // Show popup and redirect after 3 seconds
      const redirectTimeout = setTimeout(() => {
        
        try {
          router.push('/');
          
        } catch (error) {
          console.error('SurveyorComments: Router.push error:', error);
          // Fallback to window.location
          if (typeof window !== "undefined") {
            window.location.href = '/';
          }
        }
      }, 3000);
      
      
    } catch (error) {
      console.error("Error adding density comment:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground">
      {commentStatus !== false && (
        <>
          {/* 🧮 Commenting Tools */}
          <CardContent className="py-6 space-y-8">

            {/* Planet Type Proposal */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={commentInputs[`${classificationId}-1`] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [`${classificationId}-1`]: e.target.value,
                    }))
                  }
                  placeholder="Discuss planet type"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleProposePlanetType("Terrestrial")}>
                  Propose Terrestrial
                </Button>
                <Button onClick={() => handleProposePlanetType("Gaseous")}>
                  Propose Gaseous
                </Button>
              </div>
            </div>

            {/* Temperature Proposal */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={temperatureInputs[`${classificationId}-1`] || ""}
                  onChange={(e) =>
                    setTemperatureInputs((prev) => ({
                      ...prev,
                      [`${classificationId}-1`]: e.target.value,
                    }))
                  }
                  placeholder="Discuss temperature"
                  rows={3}
                  className="w-1/2"
                />
                <Textarea
                  value={temperatureInputs[`${classificationId}-2`] || ""}
                  onChange={(e) =>
                    setTemperatureInputs((prev) => ({
                      ...prev,
                      [`${classificationId}-2`]: e.target.value,
                    }))
                  }
                  placeholder="Temperature value"
                  rows={3}
                  className="w-1/2"
                />
              </div>
              <Button onClick={handleAddTemperatureComment}>
                Propose Temperature
              </Button>
            </div>

            {/* Density Proposal */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={densityInputs[`${classificationId}-1`] || ""}
                  onChange={(e) =>
                    setDensityInputs((prev) => ({
                      ...prev,
                      [`${classificationId}-1`]: e.target.value,
                    }))
                  }
                  placeholder="Discuss density"
                  rows={3}
                  className="w-1/2"
                />
                <Textarea
                  value={densityInputs[`${classificationId}-2`] || ""}
                  onChange={(e) =>
                    setDensityInputs((prev) => ({
                      ...prev,
                      [`${classificationId}-2`]: e.target.value,
                    }))
                  }
                  placeholder="Density value"
                  rows={3}
                  className="w-1/2"
                />
              </div>
              <Button onClick={handleAddDensityComment}>
                Propose Density
              </Button>
            </div>

          </CardContent>

          {/* 💬 Comments Section */}
          <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  category={comment.category}
                  content={comment.content}
                  value={comment.value}
                  createdAt={comment.created_at}
                  replyCount={0}
                  isSurveyor={comment.isSurveyor}
                  configuration={comment.configuration}
                  classificationId={classificationId}
                  classificationConfig={classificationConfig}
                />
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </CardFooter>
        </>
      )}

      {showSuccessPopup && (
        <SuccessPopup
          title="Proposal Submitted!"
          message="Your proposal has been entered into the research database. Redirecting you to the dashboard..."
          onDismiss={() => router.push('/')}
        />
      )}
    </Card>
  );
};
