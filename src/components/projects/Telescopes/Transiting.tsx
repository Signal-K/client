"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@/src/lib/auth/session-context';
import { useActivePlanet } from '@/src/core/context/ActivePlanet'; 
import ImageAnnotator from '../(classifications)/Annotating/AnnotatorView';
// import PreferredTerrestrialClassifications from '@/src/components/deployment/missions/structures/PickPlanet';
import { Button } from "@/src/components/ui/button";
import { useRouter } from 'next/navigation';
import TutorialContentBlock from "../TutorialContentBlock";
import NGTSTutorial from "./NGTSTutorial";

type Anomaly = {
  id: number;
  anomalySet: string;
  avatar_url?: string;
  content?: any;
};

export function TelescopeTessWithId({ anomalyId }: { anomalyId: string }) {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [availableSectors, setAvailableSectors] = useState<number[]>([])
  const [currentSector, setCurrentSector] = useState<number>(1)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showNGTSTutorial, setShowNGTSTutorial] = useState(false)
  const [sectorsExpanded, setSectorsExpanded] = useState(false)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<boolean | null>(null)
  const [isNGTSAnomaly, setIsNGTSAnomaly] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  // Check if user has completed a planet classification before
  const checkTutorialCompletion = async () => {
    if (!session?.user?.id) return false

    try {
      const { data: classifications, error } = await supabase
        .from('classifications')
        .select('id')
        .eq('author', session.user.id)
        .eq('classificationtype', 'planet')
        .limit(1)

      if (error) {
        console.error('Error checking tutorial completion:', error)
        return false
      }

      return classifications && classifications.length > 0
    } catch (err) {
      console.error('Error in checkTutorialCompletion:', err)
      return false
    }
  }

  const fetchAvailableSectors = async (anomalyId: number) => {
    try {
      const { data: files, error } = await supabase.storage
        .from('anomalies')
        .list(`${anomalyId}`, {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error("Error fetching sectors:", error)
        return [1] // Default to sector 1 if there's an error
      }

      if (!files || files.length === 0) {
        return [1] // Default to sector 1 if no files found
      }

      // Extract sector numbers from filenames like "Sector1.png", "Sector2.png", etc.
      const sectors = files
        .filter(file => file.name.match(/^Sector\d+\.png$/))
        .map(file => {
          const match = file.name.match(/^Sector(\d+)\.png$/)
          return match ? parseInt(match[1], 10) : null
        })
        .filter((sector): sector is number => sector !== null)
        .sort((a, b) => a - b)

      return sectors.length > 0 ? sectors : [1]
    } catch (err) {
      console.error("Error in fetchAvailableSectors:", err)
      return [1]
    }
  }

  const handleSectorChange = (sector: number) => {
    if (selectedAnomaly) {
      setCurrentSector(sector)
      
      // NGTS anomalies don't use sector-based paths, use avatar_url
      if (isNGTSAnomaly) {
        if (selectedAnomaly.avatar_url) {
          const newImageUrl = `${supabaseUrl}/storage/v1/object/public/${selectedAnomaly.avatar_url}`;
          setCurrentImageUrl(newImageUrl);
        } else {
          // Fallback
          const ngtsPath = selectedAnomaly.anomalySet || 'telescope/telescope-planetHunters-ngts';
          const newImageUrl = `${supabaseUrl}/storage/v1/object/public/${ngtsPath}/${selectedAnomaly.content || selectedAnomaly.id}.png`;
          setCurrentImageUrl(newImageUrl);
        }
      } else {
        const newImageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${selectedAnomaly.id}/Sector${sector}.png`;
        setCurrentImageUrl(newImageUrl);
      }
    }
  }

  useEffect(() => {
    const initializeComponent = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      // First check if user has completed tutorial
      const tutorialCompleted = await checkTutorialCompletion()
      setHasCompletedTutorial(tutorialCompleted)
      
      // For anonymous users or users who haven't completed tutorial, show tutorial by default
      if (session.user.is_anonymous && !tutorialCompleted) {
        setShowTutorial(true)
      }

      // Now fetch the anomaly data
      try {
        console.log("Fetching anomaly with ID:", anomalyId)
        
        let anomaly: Anomaly | null = null

        if (anomalyId === "random" || !anomalyId) {
          // Fetch a random anomaly from linked_anomalies for backward compatibility
          const { data: linkedAnomalies, error: linkedError } = await supabase
            .from("linked_anomalies")
            .select(`
              id,
              anomaly_id,
              anomalies!inner (
                id,
                anomalySet,
                avatar_url,
                content
              )
            `)
            .eq("author", session.user.id)
            .eq("anomalies.anomalySet", "telescope-tess");

          if (linkedError) throw linkedError

          if (!linkedAnomalies || linkedAnomalies.length === 0) {
            router.push("/activity/deploy")
            return
          }

          // Pick a random anomaly from the list
          const randomIndex = Math.floor(Math.random() * linkedAnomalies.length)
          anomaly = linkedAnomalies[randomIndex]?.anomalies as unknown as Anomaly
        } else {
          // Fetch specific anomaly by ID - remove restrictive filtering since planet-hunters can have various anomaly types
          const { data: anomalies, error: anomalyError } = await supabase
            .from("anomalies")
            .select("id, content, anomalySet, avatar_url, anomalytype")
            .eq("id", anomalyId);

          if (anomalyError) {
            console.error("Database error:", anomalyError);
            throw anomalyError;
          }

          console.log("Query returned:", anomalies);

          if (!anomalies || anomalies.length === 0) {
            console.log("No anomaly found with ID:", anomalyId);
            setError("Anomaly not found.");
            return;
          }

          anomaly = anomalies[0];
        }

        if (!anomaly) {
          setError("Unable to load anomaly.");
          return;
        }

        setSelectedAnomaly(anomaly);

        // Check if this is an NGTS anomaly
        const isNGTS = anomaly.anomalySet?.includes('telescope-ngts') || 
                       anomaly.anomalySet?.includes('telescope-planetHunters-ngts');
        setIsNGTSAnomaly(isNGTS);

        let initialImageUrl: string;
        const urls: string[] = [];

        if (isNGTS) {
          // NGTS anomalies use avatar_url which contains the full path
          // Format: telescope/telescope-planetHunters-ngts/104061564.png
          if (anomaly.avatar_url) {
            initialImageUrl = `${supabaseUrl}/storage/v1/object/public/${anomaly.avatar_url}`;
          } else {
            // Fallback: construct from anomalySet and content/id
            const ngtsPath = anomaly.anomalySet || 'telescope/telescope-planetHunters-ngts';
            initialImageUrl = `${supabaseUrl}/storage/v1/object/public/${ngtsPath}/${anomaly.content || anomaly.id}.png`;
          }
          urls.push(initialImageUrl);
          
          // NGTS doesn't use sectors, so we set a single sector
          setAvailableSectors([1]);
          setCurrentSector(1);
        } else {
          // Regular TESS anomalies use the sector system
          const sectors = await fetchAvailableSectors(anomaly.id);
          setAvailableSectors(sectors);
          setCurrentSector(sectors[0] || 1);

          if (anomaly.avatar_url) urls.push(anomaly.avatar_url);
          
          // Set up image URLs for all sectors
          const sectorUrls = sectors.map(sector => 
            `${supabaseUrl}/storage/v1/object/public/anomalies/${anomaly.id}/Sector${sector}.png`
          );
          urls.push(...sectorUrls);
          
          // Set the initial current image URL to the first sector
          initialImageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomaly.id}/Sector${sectors[0] || 1}.png`;
        }

        setImageUrls(urls);
        setCurrentImageUrl(initialImageUrl);

      } catch (err: any) {
        console.error("Error fetching anomaly:", err.message || err)
        setError("Unable to load anomaly.")
      } finally {
        setLoading(false)
      }
    }

    initializeComponent()
  }, [session, anomalyId])

  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (loading) return <div className="text-white p-4">Loading...</div>
  if (!selectedAnomaly || !currentImageUrl)
    return <div className="text-white p-4">No anomaly found.</div>

  return (
    <div className="w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col gap-2 px-4">
      {/* NGTS Tutorial Modal */}
      {showNGTSTutorial && <NGTSTutorial onClose={() => setShowNGTSTutorial(false)} />}

      {/* Top Button Bar */}
      <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-2 flex justify-center items-center gap-4 flex-shrink-0">
        {hasCompletedTutorial === false ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-amber-300 text-sm font-medium">
              Complete the tutorial before classifying
            </div>
            {!showTutorial && (<Button 
              variant="default" 
              onClick={() => setShowTutorial(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Start Required Tutorial
            </Button>)}
          </div>
        ) : (
          <>
            <Button variant="outline" onClick={() => setShowTutorial(true)}>
              Want a walkthrough? Start the tutorial
            </Button>
            {isNGTSAnomaly && (
              <Button 
                variant="outline" 
                onClick={() => setShowNGTSTutorial(true)}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                View NGTS Tutorial
              </Button>
            )}
          </>
        )}
      </div>
      
      {/* Main content area with sidebar */}
      <div className="flex-1 overflow-hidden min-h-0 flex gap-2">
        {/* Left Sector Selector */}
        {availableSectors.length > 1 && !showTutorial && (
          <div className="flex-shrink-0">
            <div className="h-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-2 flex flex-col items-center">
              {/* Header with expand/collapse button */}
              <div className="flex flex-col items-center mb-2">
                <span className="text-xs text-white/70 mb-1">Sectors</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSectorsExpanded(!sectorsExpanded)}
                  className="w-8 h-8 p-0 text-white/70 hover:bg-white/20"
                >
                  {sectorsExpanded ? "↑" : "↓"}
                </Button>
              </div>
              
              {/* Current sector (always visible) */}
              <Button
                variant="default"
                size="sm"
                className="w-10 h-10 p-0 text-sm bg-blue-600 text-white border-blue-600 mb-2"
              >
                {currentSector}
              </Button>
              
              {/* Expanded sectors */}
              {sectorsExpanded && (
                <div className="flex flex-col gap-1">
                  {availableSectors
                    .filter(sector => sector !== currentSector)
                    .map((sector) => (
                      <Button
                        key={sector}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSectorChange(sector)}
                        className="w-10 h-10 p-0 text-sm bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        {sector}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {showTutorial || (hasCompletedTutorial === false) ? (
            <div className="w-full h-full overflow-auto">
              <FirstTelescopeClassification 
                anomalyid={selectedAnomaly.id.toString()} 
                onTutorialComplete={async () => {
                  // Refresh tutorial completion status
                  const completed = await checkTutorialCompletion()
                  setHasCompletedTutorial(completed)
                  if (completed) {
                    setShowTutorial(false)
                  }
                }}
              />
            </div>
          ) : hasCompletedTutorial === true ? (
            <div className="w-full h-full overflow-hidden">
              <ImageAnnotator
                key={`${selectedAnomaly.id}-sector-${currentSector}`}
                anomalyType="planet"
                missionNumber={1372001}
                structureItemId={3103}
                assetMentioned={selectedAnomaly.id.toString()}
                annotationType={isNGTSAnomaly ? "NGTS" : "PH"}
                initialImageUrl={currentImageUrl}
                anomalyId={selectedAnomaly.id.toString()}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                Checking tutorial status...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function StarterTelescopeTess() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [availableSectors, setAvailableSectors] = useState<number[]>([])
  const [currentSector, setCurrentSector] = useState<number>(1)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  const fetchAvailableSectors = async (anomalyId: number) => {
    try {
      const { data: files, error } = await supabase.storage
        .from('anomalies')
        .list(`${anomalyId}`, {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error("Error fetching sectors:", error)
        return [1] // Default to sector 1 if there's an error
      }

      if (!files || files.length === 0) {
        return [1] // Default to sector 1 if no files found
      }

      // Extract sector numbers from filenames like "Sector1.png", "Sector2.png", etc.
      const sectors = files
        .filter(file => file.name.match(/^Sector\d+\.png$/))
        .map(file => {
          const match = file.name.match(/^Sector(\d+)\.png$/)
          return match ? parseInt(match[1], 10) : null
        })
        .filter((sector): sector is number => sector !== null)
        .sort((a, b) => a - b)

      return sectors.length > 0 ? sectors : [1]
    } catch (err) {
      console.error("Error in fetchAvailableSectors:", err)
      return [1]
    }
  }

  const handleSectorChange = (sector: number) => {
    if (selectedAnomaly) {
      setCurrentSector(sector)
      const newImageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${selectedAnomaly.id}/Sector${sector}.png`
      setCurrentImageUrl(newImageUrl)
    }
  }

  useEffect(() => {
    const fetchRandomLinkedAnomaly = async () => {
      if (!session) {
        setLoading(false)
        return
      };

      try {
        const { data: linkedAnomalies, error: linkedError } = await supabase
          .from("linked_anomalies")
          .select(`
            id,
            anomaly_id,
            anomalies!inner (
              id,
              anomalySet,
              avatar_url,
              content
            )
          `)
          .eq("author", session.user.id)
          .eq("anomalies.anomalySet", "telescope-tess")

        if (linkedError) throw linkedError

        if (!linkedAnomalies || linkedAnomalies.length === 0) {
          router.push("/activity/deploy")
          return
        }

        // Pick a random anomaly from the list
        const randomIndex = Math.floor(Math.random() * linkedAnomalies.length)
        const anomaly = linkedAnomalies[randomIndex]?.anomalies as unknown as Anomaly

        setSelectedAnomaly(anomaly)

        // Fetch available sectors for this anomaly
        const sectors = await fetchAvailableSectors(anomaly.id)
        setAvailableSectors(sectors)
        setCurrentSector(sectors[0] || 1)

        const urls: string[] = []
        if (anomaly.avatar_url) urls.push(anomaly.avatar_url)
        
        // Set up image URLs for all sectors
        const sectorUrls = sectors.map(sector => 
          `${supabaseUrl}/storage/v1/object/public/anomalies/${anomaly.id}/Sector${sector}.png`
        )
        urls.push(...sectorUrls)

        setImageUrls(urls)
        
        // Set the initial current image URL to the first sector
        const initialImageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomaly.id}/Sector${sectors[0] || 1}.png`
        setCurrentImageUrl(initialImageUrl)

      } catch (err: any) {
        console.error("Error fetching linked anomaly:", err.message || err)
        setError("Unable to load anomaly.")
      } finally {
        setLoading(false)
      }
    }

    fetchRandomLinkedAnomaly()
  }, [session])

  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (loading) return <div className="text-white p-4">Loading...</div>
  if (!selectedAnomaly || !currentImageUrl)
    return <div className="text-white p-4">No anomaly found.</div>

  return (
    <div className="w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col gap-2 px-4">
      {/* Button Bar */}
      <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-1 flex justify-between items-center flex-shrink-0">
        {/* Sector Navigation Buttons */}
        {/* {availableSectors.length > 1 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-white/70 px-2">Sectors:</span>
            <div className="flex flex-col gap-1">
              {availableSectors.map((sector) => (
                <Button
                  key={sector}
                  variant={currentSector === sector ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSectorChange(sector)}
                  className={`w-8 h-8 p-0 text-xs ${
                    currentSector === sector 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
        )} */}
        
        <Button variant="outline" onClick={() => setShowTutorial(true)}>
          Want a walkthrough? Start the tutorial
        </Button>
      </div>

      {/* Tutorial OR Annotator */}
      <div className="flex-1 w-full rounded-xl bg-white/10 backdrop-blur-md shadow-md p-2 overflow-hidden flex min-h-0">
        {/* Sector buttons on the left (for larger screens) */}
        {/* {availableSectors.length > 1 && !showTutorial && (
          <div className="hidden sm:flex flex-col gap-2 mr-2 pt-4 flex-shrink-0">
            <span className="text-xs text-white/70 text-center mb-1">Sectors</span>
            {availableSectors.map((sector) => (
              <Button
                key={sector}
                variant={currentSector === sector ? "default" : "outline"}
                size="sm"
                onClick={() => handleSectorChange(sector)}
                className={`w-10 h-10 p-0 text-sm ${
                  currentSector === sector 
                    ? "bg-blue-600 text-white border-blue-600" 
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                {sector}
              </Button>
            ))}
          </div>
        )} */}
        
        {/* Main content area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {showTutorial ? (
            <div className="w-full h-full overflow-auto">
              <FirstTelescopeClassification anomalyid="6" />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden">
              <ImageAnnotator
                key={`${selectedAnomaly.id}-sector-${currentSector}`}
                anomalyType="planet"
                missionNumber={1372001}
                structureItemId={3103}
                assetMentioned={selectedAnomaly.id.toString()}
                annotationType="PH"
                initialImageUrl={currentImageUrl}
                anomalyId={selectedAnomaly.id.toString()}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

interface TelescopeProps {
    anomalyid: string;
    onTutorialComplete?: () => void | Promise<void>;
};

const FirstTelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid, onTutorialComplete }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid || activePlanet?.id}/Binned.png`;

    const [part, setPart] = useState(1);
    const nextPart = () => setPart(2);

    // Handle classification completion
    const handleClassificationComplete = () => {
        if (onTutorialComplete) {
            onTutorialComplete();
        }
    };

    const tutorialSlides = [
        {
            title: "Planet Discovery Journey",
            text: "Hello there! To start your journey, you'll need to discover your first planet.",
            image: "/assets/Template.png"
        },
        {
            title: "Examine Lightcurves",
            text: "To determine if a planet is real, you'll need to examine a lightcurve and identify patterns in dips and variations.",
            image: "/assets/Docs/Curves/Step2.png"
        },
        {
            title: "Look for Regular Dips",
            text: "Look for regular dips—these often signal a planet passing in front of its star and can confirm its orbit.",
            image: "/assets/Docs/Curves/Step1.png"
        },
        {
            title: "Analyze Dip Shapes",
            text: "Pay attention to the shape of these dips: a sharp, symmetrical dip usually indicates a genuine planet transit...",
            image: "/assets/Docs/Curves/Step3.png"
        },
        {
            title: "Identify Irregular Shapes",
            text: "...While asymmetrical or irregular shapes might suggest something else.",
            image: "/assets/Docs/Curves/Step4.png"
        },
        {
            title: "Ready to Analyze",
            text: "Let's give it a try! Identify the dips in this lightcurve:",
            image: "/assets/Docs/Curves/Step4.png"
        }
    ];

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <TutorialContentBlock
                        slides={tutorialSlides}
                        classificationtype="planet"
                        onComplete={nextPart}
                    />
                )}
                {part === 2 && (
                    <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        {/* <div className="bg-white bg-opacity-90 mb-4">
                            <img
                                src={imageUrl}
                                alt="Planet Transit Lightcurve"
                                className="w-full h-full object-contain"
                            />
                        </div> */}
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyType='planet'
                            missionNumber={3000001}
                            structureItemId={3103}
                            assetMentioned={anomalyid}
                            annotationType="PH"
                            anomalyId={anomalyid}
                            className="h-full w-full"
                            onClassificationComplete={handleClassificationComplete}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};