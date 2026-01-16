"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { CommentCard } from "@/src/components/social/comments/CommentSingle";

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
  const supabase = useSupabaseClient();
  const session = useSession();
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
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", classificationId)
        .eq("surveyor", "TRUE")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data);
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
      
      const { error } = await supabase.from("comments").insert([
        {
          content: commentInput,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { planetType, commentInput },
          surveyor: "TRUE",
          category: "PlanetType",
        },
      ]);

      

      if (error) {
        
        throw error;
      }

      
      
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
      
      const { error } = await supabase.from("comments").insert([
        {
          content: `${t1}\n\n${t2}`,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { temperature: `${t1}, ${t2}` },
          surveyor: "TRUE",
          value: t2,
          category: "Temperature",
        },
      ]);

      if (error) throw error;
      
      
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
      
      const { error } = await supabase.from("comments").insert([
        {
          content: `${d1}\n\n${d2}`,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { density: `${d1}, ${d2}` },
          surveyor: "TRUE",
          value: d2,
          category: "Density",
        },
      ]);

      if (error) throw error;

      
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <>
          
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Proposal Submitted!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your proposal has been entered into the research database. Redirecting you to the dashboard...
                </p>
                <button 
                  onClick={() => {
                    try {
                      router.push('/');
                    } catch (error) {
                      console.error('Manual redirect error:', error);
                      if (typeof window !== "undefined") {
                        window.location.href = '/';
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
                >
                  Go to Dashboard Now
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};