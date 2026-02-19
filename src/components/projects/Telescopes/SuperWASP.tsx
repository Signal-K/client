"use client"

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "../../ui/button";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";

type Anomaly = {
  id: string;
  name: string;
  content?: string;
  details?: string;
};

interface TelescopeProps {
  anomalyId: string;
}

export const SuperWASPTutorial: React.FC<TelescopeProps> = ({ anomalyId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const { activePlanet } = useActivePlanet();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const [imageUrl, setImageUrl] = useState<string>("");
  const [showClassification, setShowClassification] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [periodCorrect, setPeriodCorrect] = useState<string>("");
  const [comments, setComments] = useState("");
  const [loadingImage, setLoadingImage] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load the lightcurve image
  useEffect(() => {
    if (anomalyId && supabaseUrl) {
      const url = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-superwasp-variable/${anomalyId}.gif`;
      setImageUrl(url);
      setLoadingImage(false);
    }
  }, [anomalyId, supabaseUrl]);

  // Tutorial slides for SuperWASP
  const tutorialSlides = createTutorialSlides([
    {
      title: "SuperWASP Classification",
      text: "Your task is to classify folded lightcurves of potentially periodic variable stars, observed by SuperWASP. Look at the shape of the folded lightcurve and decide into which category of variable star it should be placed, or whether it is 'junk'. You also need to decide whether the period is correct or not.",
    },
    {
      title: "Pulsators",
      text: "Pulsators have a single maximum per cycle which is usually narrower than the broad minimum. They will usually have a steeper rise and a shallower decay. Don't base your classification only on the average folded lightcurve (the red line) - always look at the distribution of white data points too.",
    },
    {
      title: "EA/EB Eclipsing Binaries",
      text: "EA/EB type eclipsing binaries have two V-shaped minima per cycle, usually of different depths. In between the eclipses, the lightcurve may be relatively flat or show some variation in brightness. Sometimes the lightcurve will be folded at half the true period so only one maximum and minimum will be seen per cycle.",
    },
    {
      title: "EW Eclipsing Binaries",
      text: "EW type eclipsing binaries have two minima per cycle, often of similar depths, with continuously varying brightness throughout the cycle. The minima are narrower than the maxima. Often, these stars will be identified at half their true period so only one maximum and minimum per cycle will be seen. Tip: Turning the folded lightcurve upside down, an EW will look different.",
    },
    {
      title: "Rotators",
      text: "Rotators usually have sinusoidal lightcurves, varying continuously with one maximum and one minimum per cycle, of equal width. Top Tip: Turning the folded lightcurve of a rotationally modulated star upside down, it will still look the same shape.",
    },
    {
      title: "Unknown & Junk",
      text: "Unknown type are objects that are clearly periodic, but the shape of the modulation does not match one of the named types. Junk lightcurves are everything else - where systematic noise in the data has produced a spurious signal that looks like something periodic. Most lightcurves will be junk!",
    }
  ]);

  const handleTutorialComplete = () => {
    setShowClassification(true);
  };

  const variableTypes = [
    { value: "pulsator", label: "Pulsator", description: "Single maximum per cycle, steeper rise and shallower decay" },
    { value: "ea_eb", label: "EA/EB Eclipsing Binary", description: "Two V-shaped minima per cycle, different depths" },
    { value: "ew", label: "EW Eclipsing Binary", description: "Two minima per cycle, similar depths, continuous variation" },
    { value: "rotator", label: "Rotator", description: "Sinusoidal lightcurve, one max and min per cycle" },
    { value: "unknown", label: "Unknown", description: "Clearly periodic but doesn't match named types" },
    { value: "junk", label: "Junk", description: "Spurious signal, not truly periodic" }
  ];

  const handleSubmit = async (withDiscussion: boolean = false) => {
    if (!session?.user?.id || !supabase) {
      console.error("No session or supabase client available");
      return;
    }

    if (!selectedType) {
      alert("Please select a variable star type");
      return;
    }

    if (!periodCorrect) {
      alert("Please indicate whether the period is correct");
      return;
    }

    setSubmitting(true);

    try {
      // Generate classification interpretation
      const generateInterpretation = () => {
        const typeInfo = variableTypes.find(t => t.value === selectedType);
        
        if (selectedType === "junk") {
          return {
            category: "Non-Variable / Spurious Signal",
            objectType: "Junk",
            confidence: "Classification Complete",
            description: "This lightcurve shows systematic noise rather than true periodic variability.",
            discovery: "You've helped filter out spurious signals from the dataset, which is crucial for identifying real variable stars.",
            scientificValue: "Removing junk data improves the quality of the variable star catalog."
          };
        }

        if (selectedType === "pulsator") {
          return {
            category: "Pulsating Variable Star",
            objectType: "Pulsator",
            confidence: "High",
            description: "This star's brightness varies due to periodic expansion and contraction of its outer layers.",
            discovery: "You've identified a pulsating star! These stars help us measure cosmic distances and understand stellar evolution.",
            scientificValue: "Pulsating variables are crucial for distance measurements and studying stellar structure."
          };
        }

        if (selectedType === "ea_eb") {
          return {
            category: "Eclipsing Binary System",
            objectType: "EA/EB Type",
            confidence: "High",
            description: "This is a binary star system where two stars orbit each other and periodically eclipse one another from our viewpoint.",
            discovery: "You've found an eclipsing binary! These systems allow us to measure stellar masses and radii directly.",
            scientificValue: "Eclipsing binaries are fundamental for determining accurate stellar properties and testing stellar models."
          };
        }

        if (selectedType === "ew") {
          return {
            category: "Contact Binary System",
            objectType: "EW Type",
            confidence: "High",
            description: "This is a contact binary where two stars are so close they share their outer atmospheres.",
            discovery: "You've identified a contact binary! These fascinating systems show us extreme stellar evolution.",
            scientificValue: "EW binaries help us understand mass transfer between stars and binary evolution."
          };
        }

        if (selectedType === "rotator") {
          return {
            category: "Rotating Variable Star",
            objectType: "Rotator",
            confidence: "High",
            description: "This star's brightness varies due to rotation, likely caused by starspots or other surface features.",
            discovery: "You've found a rotating variable! This tells us about the star's rotation period and magnetic activity.",
            scientificValue: "Rotational variables help us study stellar activity, magnetic fields, and rotation rates."
          };
        }

        if (selectedType === "unknown") {
          return {
            category: "Unknown Variable Type",
            objectType: "Unclassified Periodic Variable",
            confidence: "Medium",
            description: "This object shows clear periodic behavior but doesn't fit standard classification categories.",
            discovery: "You've found an unusual variable! These objects may represent rare types or complex systems.",
            scientificValue: "Unknown variables can lead to discoveries of new classes of objects or exotic stellar phenomena."
          };
        }

        return {
          category: "Classified",
          objectType: typeInfo?.label || "Unknown",
          confidence: "Classified",
          description: typeInfo?.description || "",
          discovery: "Classification complete",
          scientificValue: "Your classification helps build a comprehensive catalog of variable stars."
        };
      };

      const interpretation = generateInterpretation();

      const classificationConfiguration = {
        variableType: selectedType,
        variableTypeLabel: variableTypes.find(t => t.value === selectedType)?.label,
        periodCorrect: periodCorrect === "yes",
        periodNote: periodCorrect === "yes" ? "Period is correct" : "Period may need adjustment",
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
          classificationtype: "superwasp-variable",
          classificationConfiguration,
          content: comments.trim() || null,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Error saving classification:", data?.error);
        alert("Error saving classification. Please try again.");
        return;
      }

      console.log("Classification saved successfully:", data);
      
      // Show success message
      alert("Classification submitted successfully!");
      
      // Redirect to the classification page
      if (data?.id) {
        router.push(`/next/${data.id}`);
      }
      
    } catch (error) {
      console.error("Unexpected error during classification submission:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg">
      {/* Tutorial Component */}
      <TutorialContentBlock
        classificationtype="superwasp-variable"
        slides={tutorialSlides}
        onComplete={handleTutorialComplete}
        title="SuperWASP Variable Star Training"
        description="Learn to classify variable star lightcurves"
      />

      {/* Classification Interface - shown after tutorial or for returning users */}
      {showClassification && (
        <div className="flex flex-col xl:flex-row gap-4 w-full max-w-7xl mx-auto">
          {/* Left side - Lightcurve image */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-900 rounded-lg p-3 md:p-4">
              <div className="relative">
                {loadingImage ? (
                  <div className="w-full h-64 md:h-96 bg-black rounded flex items-center justify-center">
                    <span className="text-gray-400">Loading lightcurve...</span>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Folded lightcurve"
                    className="w-full h-auto object-contain bg-black rounded"
                    onError={() => {
                      console.error("Failed to load image");
                      setLoadingImage(false);
                    }}
                  />
                )}
                
                <div className="mt-3 text-xs md:text-sm text-gray-300">
                  <p className="font-semibold">Remember:</p>
                  <p className="mt-1">• Look at both the red line (average) and white data points (distribution)</p>
                  <p>• Each lightcurve is plotted over two cycles to help you see the variation</p>
                  <p>• Most lightcurves will be junk - that's normal!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Classification form */}
          <div className="flex-1 min-w-0 bg-gray-800 rounded-lg p-3 md:p-6">
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">CLASSIFICATION TASK</h3>
                <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-6">
                  Select the type of variable star that best matches this folded lightcurve:
                </p>
              </div>

              {/* Variable type selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Variable Star Type
                </label>
                {variableTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-start gap-2 md:gap-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="variableType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mt-0.5 md:mt-1 w-3 h-3 md:w-4 md:h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-xs md:text-sm text-white font-medium block">
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {type.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Period correctness */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Is the period correct?
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors flex-1">
                    <input
                      type="radio"
                      name="periodCorrect"
                      value="yes"
                      checked={periodCorrect === "yes"}
                      onChange={(e) => setPeriodCorrect(e.target.value)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-xs md:text-sm text-white">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors flex-1">
                    <input
                      type="radio"
                      name="periodCorrect"
                      value="no"
                      checked={periodCorrect === "no"}
                      onChange={(e) => setPeriodCorrect(e.target.value)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                    />
                    <span className="text-xs md:text-sm text-white">No</span>
                  </label>
                </div>
              </div>

              {/* Optional comments section */}
              <div className="mt-4 md:mt-6">
                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional observations or notes about this lightcurve..."
                  className="w-full h-16 md:h-20 p-2 md:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs md:text-sm"
                />
              </div>

              {/* Help and submit buttons */}
              <div className="mt-4 md:mt-6">
                <p className="text-xs text-gray-400 mb-3 text-center">
                  NEED SOME HELP WITH THIS TASK?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <button 
                    onClick={() => handleSubmit(true)}
                    disabled={submitting || !selectedType || !periodCorrect}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 md:px-4 rounded-md transition-colors text-xs md:text-sm"
                  >
                    {submitting ? "Submitting..." : "Done & Talk"}
                  </button>
                  <button 
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || !selectedType || !periodCorrect}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:cursor-not-allowed text-white py-2 px-3 md:px-4 rounded-md transition-colors text-xs md:text-sm"
                  >
                    {submitting ? "Submitting..." : "Done"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
