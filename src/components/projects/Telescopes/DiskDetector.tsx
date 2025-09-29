"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

type Anomaly = {
  id: string;
  name: string;
  content?: string;
  details?: string;
};

interface TelescopeProps {
  anomalyId: string;
};

export const DiskDetectorTutorial: React.FC<TelescopeProps> = ({
  anomalyId,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const { activePlanet } = useActivePlanet();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showClassification, setShowClassification] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>(new Array(7).fill(false));
  const [comments, setComments] = useState("");
  const [loadingImages, setLoadingImages] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  // Function to detect how many images are available for this anomaly
  const detectAvailableImages = async () => {
    if (!supabaseUrl) return [];
    
    const urls: string[] = [];
    let imageIndex = 1;
    let maxAttempts = 20; // Safety limit
    
    while (imageIndex <= maxAttempts) {
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyId}/${imageIndex}.png`;
      
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          urls.push(imageUrl);
          imageIndex++;
        } else {
          break; // Stop when we hit a 404 or other error
        }
      } catch (error) {
        break; // Stop on network errors
      }
    }
    
    return urls;
  };

  // Load images when component mounts
  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      const availableImages = await detectAvailableImages();
      setImageUrls(availableImages);
      setLoadingImages(false);
    };
    
    if (anomalyId) {
      loadImages();
    }
  }, [anomalyId, supabaseUrl]);

  // Tutorial slides for Disk Detective
  const tutorialSlides = createTutorialSlides([
    {
      title: "Disk Detective Classification",
      text: "Hello, and welcome to the Disk Detective Classification",
    },
    {
      title: "Finding Hidden Disks",
      text: "Find stars with hidden disks of dust around them. These stars show us where to look for new planetary systems and teach us about how planets form",
      image: "/assets/Docs/Telescopes/DiskDetector/Step1.png"
    },
    {
      title: "Ideal Disk Candidates",
      text: "The ideal disk candidate is a single, round source, contained mostly within in the outer circle in all of the images. It may move a bit from image to image, but it does not move beyond the inner circle.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step2.png"
    },
    {
      title: "Survey Labels",
      text: "As you go through the images, pay attention to the label in the upper right hand corner. This label indicates what survey the image is from, i.e., which telescope took the image.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step3.png"
    },
    {
      title: "Different Survey Features",
      text: "You'll be looking for different features in the images from different surveys. For example, images from the Pan-STARRS survey are especially good at revealing objects like galaxies that are not round. The last image (unWISE w3), from the WISE telescope, is especially good at revealing interstellar dust clouds.",
      image: "/assets/Docs/Telescopes/DiskDetector/Step4.png"
    },
    {
      title: "Ready to Start!",
      text: "Let's get started with classifying disk candidates!",
    }
  ]);

  const handleTutorialComplete = () => {
    setShowClassification(true);
  };

  const handleOptionChange = (index: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[index] = !newSelectedOptions[index];
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = async (withDiscussion: boolean = false) => {
    if (!session?.user?.id || !supabase) {
      console.error("No session or supabase client available");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare classification configuration
      const optionLabels = [
        "moves_off_crosshairs_2mass_only",
        "moves_off_crosshairs_multiple",
        "not_found_panstarrs_skymapper_2mass",
        "extended_beyond_outer_circle_unwise",
        "multiple_objects_inner_circle",
        "objects_between_circles",
        "none_of_above"
      ];

      // Generate classification interpretation
      const generateInterpretation = () => {
        const selectedCount = selectedOptions.filter(Boolean).length;
        
        if (selectedOptions[6]) { // "None of the above"
          return {
            category: "Circumstellar Disk Candidate",
            objectType: "Potential Planetary System",
            confidence: "High",
            description: "This appears to be a genuine circumstellar disk - a ring of dust and debris around a star where planets may be forming or have already formed.",
            discovery: "You may have helped identify a new planetary system! This disk could be either a young protoplanetary disk where planets are currently forming, or a mature debris disk indicating an existing planetary system.",
            scientificValue: "Clean disk candidates like this are rare and valuable for understanding planet formation processes."
          };
        }
        
        if (selectedCount === 0) {
          return {
            category: "Unclassified Object",
            objectType: "Unknown",
            confidence: "N/A",
            description: "This object remains unclassified.",
            discovery: "No characteristics were identified for this source.",
            scientificValue: "Please review the object to help determine what it might be."
          };
        }
        
        // Analyze specific combinations to determine object type
        if (selectedOptions[0] || selectedOptions[1]) {
          return {
            category: "Moving Solar System Object",
            objectType: "Asteroid or Minor Planet", 
            confidence: "High",
            description: "This object shows movement between observations, indicating it's within our solar system rather than a distant star.",
            discovery: "You've identified a solar system object! This is likely an asteroid, comet, or minor planet orbiting our Sun.",
            scientificValue: "While not a disk, these objects help us understand the structure and evolution of our solar system."
          };
        }
        
        if (selectedOptions[2]) {
          return {
            category: "Infrared-Only Source",
            objectType: "Very Cool Object or Heavily Obscured Star",
            confidence: "Medium",
            description: "This object is only visible in infrared light, suggesting it's either very cool or hidden behind dust.",
            discovery: "This could be a brown dwarf (failed star), a very cool red dwarf star, or a young star still embedded in its birth cloud.",
            scientificValue: "Infrared-only sources often reveal hidden stellar populations and early stages of star formation."
          };
        }
        
        if (selectedOptions[3]) {
          return {
            category: "Extended Celestial Object",
            objectType: "Galaxy or Nebula",
            confidence: "High", 
            description: "The extended nature suggests this is not a single star but rather a collection of stars or gas clouds.",
            discovery: "You've likely identified a distant galaxy or a nebula (gas cloud) in our own galaxy, rather than a circumstellar disk.",
            scientificValue: "While not a disk candidate, galaxies and nebulae are important for understanding cosmic structure and star formation."
          };
        }
        
        if (selectedOptions[4] || selectedOptions[5]) {
          return {
            category: "Multiple Star System",
            objectType: "Binary/Multiple Stars or Crowded Star Field",
            confidence: "Medium",
            description: "Multiple objects in the field suggest either a system of multiple stars or a crowded region of space.",
            discovery: "This could be a binary star system, star cluster, or simply a line-of-sight alignment of unrelated stars.",
            scientificValue: "Multiple star systems are common and can host planets, though they're more complex than single-star systems."
          };
        }
        
        // Fallback for other combinations
        return {
          category: "Complex or Contaminated Source",
          objectType: "Unclear - Multiple Issues Present",
          confidence: "Low",
          description: "This source shows multiple characteristics that make it difficult to classify definitively.",
          discovery: "The combination of features suggests this may not be a simple circumstellar disk, but could be something more complex or contaminated by nearby objects.",
          scientificValue: "Complex sources like this require follow-up observations to determine their true nature."
        };
      };

      const interpretation = generateInterpretation();

      const classificationConfiguration = {
        selectedOptions: selectedOptions.map((selected, index) => ({
          option: optionLabels[index],
          selected: selected,
          label: [
            "The object moves off the crosshairs in ONLY the 2MASS images.",
            "The object moves off the crosshairs in two or more images.",
            "The object is not found in the Pan-STARRS, SkyMapper or 2MASS images.",
            "The object is extended beyond the outer circle in the unWISE images.",
            "Two or more images show multiple objects inside the inner circle.",
            "Two or more images show objects between the inner and outer circles.",
            "None of the above."
          ][index]
        })).filter(option => option.selected),
        interpretation,
        comments: comments.trim() || null,
        withDiscussion,
        imageCount: imageUrls.length,
        timestamp: new Date().toISOString()
      };

      // Insert classification into database
      const { data, error } = await supabase
        .from('classifications')
        .insert({
          author: session.user.id,
          anomaly: parseInt(anomalyId),
          classificationtype: 'diskDetective',
          classificationConfiguration: classificationConfiguration,
          content: comments.trim() || null
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving classification:", error);
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
        classificationtype="DiskDetective"
        slides={tutorialSlides}
        onComplete={handleTutorialComplete}
        title="Disk Detective Training"
        description="Learn to identify stars with dust disks"
      />

      {/* Classification Interface - shown after tutorial or for returning users */}
      {showClassification && (
        <div className="flex flex-col xl:flex-row gap-4 w-full max-w-7xl mx-auto">
          {/* Left side - Image slideshow */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-900 rounded-lg p-3 md:p-4">
              <div className="relative">
                {loadingImages ? (
                  <div className="w-full h-48 md:h-80 bg-black rounded flex items-center justify-center">
                    <span className="text-gray-400">Loading images...</span>
                  </div>
                ) : (
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt={`Disk candidate ${currentImageIndex + 1}`}
                    className="w-full h-48 md:h-80 object-contain bg-black rounded"
                  />
                )}
                
                {/* Image navigation thumbnails */}
                {!loadingImages && imageUrls.length > 0 && (
                  <div className="flex justify-center mt-3 gap-1 md:gap-2 overflow-x-auto pb-2">
                    {imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-6 h-6 md:w-10 md:h-10 rounded border-2 overflow-hidden ${
                          currentImageIndex === index 
                            ? 'border-blue-400' 
                            : 'border-gray-600'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-contain bg-black"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Navigation buttons */}
                {!loadingImages && imageUrls.length > 1 && (
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={prevImage}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 md:px-3 md:py-2 rounded-md transition-colors text-xs md:text-sm"
                    >
                      ← Previous
                    </button>
                    <span className="flex items-center text-xs md:text-sm text-gray-300 mx-2 md:mx-4">
                      {currentImageIndex + 1} / {imageUrls.length}
                    </span>
                    <button
                      onClick={nextImage}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 md:px-3 md:py-2 rounded-md transition-colors text-xs md:text-sm"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Classification form */}
          <div className="flex-1 min-w-0 bg-gray-800 rounded-lg p-3 md:p-6">
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">TASK</h3>
                <h4 className="text-sm md:text-md font-medium text-gray-300 mb-2 md:mb-4">TUTORIAL</h4>
                <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-6">
                  What best describes the object you see? You may choose more than one option.
                </p>
              </div>

              {/* Multiple choice options */}
              <div className="space-y-1 md:space-y-2">
                {[
                  "The object moves off the crosshairs in ONLY the 2MASS images.",
                  "The object moves off the crosshairs in two or more images.",
                  "The object is not found in the Pan-STARRS, SkyMapper or 2MASS images.",
                  "The object is extended beyond the outer circle in the unWISE images.",
                  "Two or more images show multiple objects inside the inner circle.",
                  "Two or more images show objects between the inner and outer circles.",
                  "None of the above."
                ].map((option, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-2 md:gap-3 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions[index]}
                      onChange={() => handleOptionChange(index)}
                      className="mt-0.5 md:mt-1 w-3 h-3 md:w-4 md:h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-xs md:text-sm text-gray-200 leading-tight md:leading-relaxed">
                      {option}
                    </span>
                  </label>
                ))}
              </div>

              {/* Optional comments section */}
              <div className="mt-4 md:mt-6">
                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional observations or notes..."
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
                    disabled={submitting}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-3 md:px-4 rounded-md transition-colors text-xs md:text-sm"
                  >
                    {submitting ? "Submitting..." : "Done & Talk"}
                  </button>
                  <button 
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
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

export function TelescopeDiskDetector() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMission3000009, setHasMission3000009] = useState<boolean | null>(null);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);

  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: anomalyData, error: anomalyError } = await supabase
          .from("anomalies")
          .select("*")
          .eq("author", session.user.id)
          .eq("anomalySet", "telescope-diskDetective")
          .limit(1)
          .maybeSingle();

        if (anomalyError) {
          throw anomalyError;
        }

        if (anomalyData) {
          setAnomaly(anomalyData);
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyData.id}/1.png`);
        } else {
          setAnomaly(null);
          setImageUrl(null);
        }
      } catch (error: any) {
        console.error("Error fetching anomaly:", error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session, supabase]);

  useEffect(() => {
    const checkMission = async () => {
      if (!session) {
        setMissionLoading(false);
        return;
      }

      try {
        const { data: missionData, error: missionError } = await supabase
          .from("missions")
          .select("*")
          .eq("user", session.user.id)
          .eq("mission", 3000009)
          .maybeSingle();

        if (missionError) {
          console.error("Error checking mission:", missionError.message);
          setHasMission3000009(false);
        } else {
          setHasMission3000009(!!missionData);
        }
      } catch (error: any) {
        console.error("Error in mission check:", error.message);
        setHasMission3000009(false);
      } finally {
        setMissionLoading(false);
      }
    };

    checkMission();
  }, [session, supabase]);

  if (loading || missionLoading) {
    return <div>Loading...</div>;
  }

  if (!hasMission3000009) {
    return (
      <div className="text-center p-4">
        <p>You need to unlock this mission first. Complete the required tasks to access the Disk Detective classification.</p>
      </div>
    );
  }

  if (!anomaly) {
    return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>;
  }

  const startTutorial = () => setShowTutorial(true);

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
      <Button onClick={startTutorial} variant="outline">
        Show Tutorial
      </Button>

      {showTutorial && <DiskDetectorTutorial anomalyId={anomaly.id} />}

      {imageUrl && !showTutorial && (
        <div className="flex flex-col items-center w-full">
          <ClassificationForm
            anomalyId={anomaly.id}
            anomalyType="DiskDetective"
            missionNumber={3000009}
            assetMentioned={imageUrl}
          />
        </div>
      )}
    </div>
  );
};