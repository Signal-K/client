"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";

import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

type Anomaly = {
  id: string;
  name: string;
  content?: string;
  details?: string;
  avatarUrl?: string;
};

interface GalaxyZooProps {
  anomalyId: string;
  avatarUrl?: string;
};

export const GalaxyZooTutorial: React.FC<GalaxyZooProps> = ({
  anomalyId,
  avatarUrl,
}) => {
  const session = useSession();
  const router = useRouter();
  
  const [showClassification, setShowClassification] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tutorial slides for Galaxy Zoo
  const tutorialSlides = createTutorialSlides([
    {
      title: "Galaxy Zoo classification",
      text: "Welcome to Galaxy Zoo. You are helping scientists understand how galaxies form and evolve by classifying their shapes.",
    },
    {
      title: "Smooth vs Features",
      text: "The first step is to decide if the galaxy is simply smooth and rounded, or if it has features like spiral arms or a disk.",
      image: "https://panoptes-uploads.zooniverse.org/project_background/9f660d5b-2d74-45e0-a931-e40d6d5a1f29.jpeg"
    },
    {
      title: "Spiral Arms",
      text: "If you see spiral arms, we want to know how many and how tightly wound they are. This tells us about the galaxy's history.",
    },
    {
      title: "Scientific Impact",
      text: "Your classifications help create the largest database of galaxy shapes in the world, used by thousands of astronomers.",
    }
  ]);

  const handleTutorialComplete = () => {
    setShowClassification(true);
  };

  const handleSubmit = async (withDiscussion: boolean = false) => {
    if (!session?.user?.id || selectedOption === null) {
      return;
    }

    setSubmitting(true);

    try {
      const options = [
        "Smooth",
        "Features or Disk",
        "Star or Artifact"
      ];

      const interpretation = {
        category: "Galaxy Classification",
        objectType: options[selectedOption],
        confidence: "User Classified",
        description: `User identified this galaxy as ${options[selectedOption]}.`,
        discovery: "Contributed to galaxy morphology mapping.",
        scientificValue: "Helps refine evolution models of the universe."
      };

      const classificationConfiguration = {
        selectedOption: options[selectedOption],
        interpretation,
        comments: comments.trim() || null,
        withDiscussion,
        timestamp: new Date().toISOString()
      };

      const response = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomaly: parseInt(anomalyId),
          classificationtype: "galaxyZoo",
          classificationConfiguration,
          content: comments.trim() || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit classification");
      }

      const data = await response.json();
      
      // Redirect to the classification page
      if (data?.id) {
        router.push(`/next/${data.id}`);
      }
      
    } catch (error) {
      console.error("Error during galaxy classification:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg w-full">
      <TutorialContentBlock
        classificationtype="galaxyZoo"
        slides={tutorialSlides}
        onComplete={handleTutorialComplete}
        title="Galaxy Zoo Training"
        description="Learn to identify galaxy morphologies"
      />

      {showClassification && (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
          <div className="flex-1 bg-gray-900 rounded-xl p-4 flex items-center justify-center min-h-[400px]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Galaxy Subject"
                className="max-w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : (
              <div className="text-gray-500">No image available</div>
            )}
          </div>

          <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Classify this Galaxy</h3>
            
            <p className="text-gray-300 mb-4">Is the galaxy simply smooth and rounded, with no sign of a disk?</p>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                "Smooth",
                "Features or Disk",
                "Star or Artifact"
              ].map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    selectedOption === index 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>

            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional notes on this galaxy?"
              className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex gap-3">
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={submitting || selectedOption === null}
                className="flex-1 py-6 bg-blue-600 hover:bg-blue-500 text-lg font-bold"
              >
                {submitting ? "Submitting..." : "Submit Classification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Standalone classification panel — no tutorial preamble */
function GalaxyZooClassify({ anomalyId, avatarUrl }: GalaxyZooProps) {
  const session = useSession();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user?.id || selectedOption === null) return;
    setSubmitting(true);
    try {
      const options = ["Smooth", "Features or Disk", "Star or Artifact"];
      const interpretation = {
        category: "Galaxy Classification",
        objectType: options[selectedOption],
        confidence: "User Classified",
        description: `User identified this galaxy as ${options[selectedOption]}.`,
        discovery: "Contributed to galaxy morphology mapping.",
        scientificValue: "Helps refine evolution models of the universe.",
      };
      const response = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anomaly: parseInt(anomalyId),
          classificationtype: "galaxyZoo",
          classificationConfiguration: {
            selectedOption: options[selectedOption],
            interpretation,
            comments: comments.trim() || null,
            timestamp: new Date().toISOString(),
          },
          content: comments.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit classification");
      const data = await response.json();
      if (data?.id) router.push(`/next/${data.id}`);
    } catch (error) {
      console.error("Error during galaxy classification:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
      <div className="flex-1 bg-gray-900 rounded-xl p-4 flex items-center justify-center min-h-[400px]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Galaxy Subject" className="max-w-full max-h-[500px] object-contain rounded-lg" />
        ) : (
          <div className="text-gray-500">No image available</div>
        )}
      </div>
      <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Classify this Galaxy</h3>
        <p className="text-gray-300 mb-4">Is the galaxy simply smooth and rounded, with no sign of a disk?</p>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {["Smooth", "Features or Disk", "Star or Artifact"].map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`p-4 rounded-xl text-left transition-all border ${
                selectedOption === index
                  ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20"
                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Any additional notes on this galaxy?"
          className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={submitting || selectedOption === null}
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-lg font-bold"
        >
          {submitting ? "Submitting..." : "Submit Classification"}
        </Button>
      </div>
    </div>
  );
}

export default function TelescopeGalaxyZoo() {
  const session = useSession();
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session?.user?.id) return;

      try {
        const res = await fetch(
          `/api/gameplay/anomalies?anomalySet=telescope-galaxyZoo&limit=1`
        );
        const data = await res.json();
        if (data.anomalies && data.anomalies.length > 0) {
          setAnomaly(data.anomalies[0]);
        }
      } catch (error) {
        console.error("Error fetching galaxy anomaly:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session]);

  if (loading) return <div className="p-8 text-center text-gray-400">Scanning deep space...</div>;

  if (!anomaly) {
    return (
      <div className="p-8 text-center bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">No Galaxy Subjects Available</h3>
        <p className="text-gray-400">The deep space survey is currently updating. Check back soon for more targets.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded-xl border border-gray-700">
        <div>
          <h2 className="text-lg font-bold text-white">Galaxy Zoo Survey</h2>
          <p className="text-sm text-gray-400">Target ID: {anomaly.id}</p>
        </div>
        <Button onClick={() => setShowTutorial(!showTutorial)} variant="outline">
          {showTutorial ? "Return to Task" : "View Tutorial"}
        </Button>
      </div>

      {showTutorial ? (
        <GalaxyZooTutorial anomalyId={anomaly.id} avatarUrl={anomaly.avatarUrl} />
      ) : (
        <GalaxyZooClassify anomalyId={anomaly.id} avatarUrl={anomaly.avatarUrl} />
      )}
    </div>
  );
}
