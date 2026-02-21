'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import PostCard from "@/src/components/social/posts/TestPostCard";
import { incrementClassificationVote } from "@/src/lib/gameplay/classification-vote";

interface VotePlanetClassificationsProps { 
  classificationId: string | number;
};

export default function VotePlanetClassifications({ classificationId }: VotePlanetClassificationsProps) {
  const session = useSession();
  const router = useRouter();

  const [classification, setClassification] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const fetchClassification = async () => { 
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/gameplay/classifications?id=${encodeURIComponent(String(classificationId))}&limit=1`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to load classification");
      const data = payload?.classifications?.[0];
      if (!data) throw new Error("Classification not found");

      let image: string | null = null;
      const media = data.media;

      if (Array.isArray(media)) {
        for (const subArray of media) {
          if (Array.isArray(subArray) && subArray.length > 0) {
            image = subArray[0];
            break;
          };
        };
      } else if (media && typeof media.uploadUrl === "string") {
        image = media.uploadUrl;
      };

      const votes = data.classificationConfiguration?.votes || 0;
 
      setClassification({ ...data, image, votes });
    } catch (error) {
      console.error("Error fetching classification:", error);
      setError("Failed to load classification.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchClassification();
  }, [session, classificationId]);

  const handleVote = async (classificationId: number, currentConfig: any) => {
    const updatedVotes = await incrementClassificationVote(
      classificationId,
      currentConfig?.votes || 0
    );

    if (updatedVotes === null) {
      return;
    }

    setClassification((prev: any) =>
      prev ? { ...prev, votes: updatedVotes } : prev
    );

    // Show success popup
    setShowSuccessPopup(true);

    // Redirect after 3 seconds
    setTimeout(() => {
      try {
        router.push('/');
      } catch (error) {
        console.error("PHVote: Router.push error:", error);
        // Fallback to window.location
        if (typeof window !== "undefined") {
          window.location.href = '/';
        }
      }
    }, 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg">
      <div className="space-y-6">
        
        {loading ? (
          <p className="text-center text-gray-400">Loading classification...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : classification ? (
          <PostCard
            classificationId={classification.id}
            title={classification.title}
            author={classification.author}
            content={classification.content}
            votes={classification.votes}
            category={classification.category}
            tags={classification.tags || []}
            images={classification.image ? [classification.image] : []}
            anomalyId={classification.anomaly}
            classificationConfig={classification.classificationConfiguration}
            classificationType={classification.classificationtype}
            onVote={() =>
              handleVote(
                classification.id,
                classification.classificationConfiguration
              )
            }
          />
        ) : (
          <p className="text-center text-gray-400">Classification not found.</p>
        )}
      </div>
      
            {/* Success Popup */}
      {showSuccessPopup && (
        <>
          {console.log('PHVote: Rendering popup - showSuccessPopup is true')}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Vote Submitted!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your vote has been recorded in the research database. Redirecting you to the dashboard...
                </p>
                <button 
                  onClick={() => {
                    console.log('PHVote: Manual redirect button clicked');
                    try {
                      router.push('/');
                    } catch (error) {
                      console.error('PHVote: Manual redirect error:', error);
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
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
