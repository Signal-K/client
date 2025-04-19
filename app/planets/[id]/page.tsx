'use client';

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, FileText, Info, Thermometer } from "lucide-react";
import { PlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import WeatherEventStatus from "@/components/Data/Generator/Weather/EventsCounter";
import BiomassStats from "@/components/Structures/Missions/Biologists/BiomassOnPlanet";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";
import PlanetProgress from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetCompletion";
import WeatherGenerator from "@/components/Data/Generator/Weather/SimpleWeatherEvents";
import GameNavbar from "@/components/Layout/Tes";

export interface Classification {
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

type PlanetData = {
  name: string
  galaxy: string
  diameter: string
  dayLength: string
  temperature: string
  climate: string
};

type FocusView = "planet" | "overview" | "Climate" | "atmosphere" | "exploration" | "map" | "edit"

export type Anomaly = {
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

export interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  additionalFields: Record<string, Set<string>>;
  cloudColours?: Record<string, number>;
};

export interface AggregatedP4 {
  fanCount: number;
  blotchCount: number;
  classificationCounts: Record<string, number>;
};

export interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
};

export interface AggregatedBalloon {
  shapeCount: number;
  vortexCount: number;
  streakCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
};

export interface AI4MClassification {
  id: number;
  classificationConfiguration: any;
  annotationOptions: any[]; 
};

export default function TestPlanetWrapper({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [currentView, setCurrentView] = useState<FocusView>("planet");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dominantBiome, setDominantBiome] = useState<string | null>('Barren (Pending)');
  const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
  const [p4Summary, setP4Summary] = useState<AggregatedP4 | null>(null);
  const [ai4MSummary, setAI4MSummary] = useState<AggregatedAI4M | null>(null);
  const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);
  const [period, setPeriod] = useState<string>("");
  const [showCurrentUser, setShowCurrentUser] = useState<boolean>(true);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [currentPlanet, setCurrentPlanet] = useState<string>("orionis")
  const [density, setDensity] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [biomassScore, setBiomassScore] = useState<number>(0);
  const [surveyorPeriod, setSurveyorPeriod] = useState<string>("")
  const [comments, setComments] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const getTimeUntilNextSunday = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7); 
      nextSunday.setHours(10, 1, 0, 0); 
      return nextSunday.getTime() - now.getTime(); 
  };

  const calculateBiomass = (temperature?: number, radius?: number, orbitalPeriod?: number): number => {
      const T = temperature ?? 300;
      const R = radius ?? 1;
      const P = orbitalPeriod ?? 1.5;

      return (
          0.1 *
          (T / (T + 300)) *
          (1 / (1 + Math.exp(-(R - 1.2)))) *
          (1 / (1 + Math.exp(-(1.5 - P))))
      );
  };  

  const formatTime = (timeInSeconds: number) => {
      const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(timeInSeconds % 60).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const orbital = parseFloat(surveyorPeriod);
    const rad = density !== null ? Number(density) : undefined;
    const temp = temperature !== null ? temperature : undefined;
  
    if (!isNaN(orbital) && rad !== undefined && temp !== undefined) {
      setBiomassScore(calculateBiomass(temp, rad, orbital));
    }
  }, [supabase]);    

  const MemoizedPlanetGenerator = useMemo(() => {
    return classification?.id && classification.author ? (
            // <PostCardSingleWithGenerator
            //   key={classification.id}
            //   classificationId={classification.id}
            //   title={classification.title || "Untitled"}
            //   author={classification.author || "Unknown"}
            //   content={classification.content || "No content available"}
            //   votes={classification.votes || 0}
            //   category={classification.classificationtype || "Uncategorized"}
            //   // images={classification.images || []}
            //   anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
            //   classificationConfig={classification.classificationConfiguration}
            //   classificationType={classification.classificationtype || "Unknown"}
            //   tags={classification.tags || []}
            //   images={classification.images || []} 
            //   biome={dominantBiome || ''}
            //   toggle={true}
            // />
            <PlanetGenerator         classificationId={classification.id.toString()}         author={classification.author}       />
    ) : null;
  }, [classification?.id, classification?.author]);  

  useEffect(() => {
      if (!params.id) return;

      const fetchClassifications = async () => {
          const { data, error } = await supabase
              .from("classifications")
              .select("*, anomaly:anomalies(*), classificationConfiguration, media")
              .eq('id', params.id)
              .single();

          if (error) {
              console.error("Error fetching classification", error);
              setError("Failed to fetch classification data");
              return;
          }

          setClassification(data);
          setAnomaly(data.anomaly);

          const periodFromField = data.classificationConfiguration?.additionalFields?.field_0;
          if (periodFromField) setPeriod(periodFromField);

          const parentPlanetLocation = data.anomaly?.id;
          if (parentPlanetLocation) {
              const query = supabase
                  .from("classifications")
                  .select("*, anomaly:anomalies(*), classificationConfiguration, media")
                  .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString());

              const { data: relatedData, error: relatedError } = await query;

              if (relatedError) {
                  setError("Failed to fetch related classifications")
                  setLoading(false);
                  return;
              }

              if (relatedData) {
                  const votePromises = relatedData.map(async (related) => {
                    const { count, error: votesError } = await supabase
                      .from("votes")
                      .select("*", { count: "exact" })
                      .eq("classification_id", related.id);
        
                    if (votesError) {
                      console.error("Error fetching votes:", votesError);
                      return { ...related, votes: 0 };
                    }
        
                    return { ...related, votes: count };
                  });
        
                  const relatedClassificationsWithVotes = await Promise.all(votePromises);
                  setRelatedClassifications(relatedClassificationsWithVotes);
              }
          }

          setLoading(false);
      };

      fetchClassifications();
  }, [session]);

  const fetchComments = async () => {
      if (!classification) return;
    
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", classification.id)
        .order("created_at", { ascending: false });
    
      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data || []);
    
        const orbitalPeriodComment = data?.find(
          (comment) => comment.category === "OrbitalPeriod" && comment.author === classification.author
        );
  
        const radiusComment = data?.find(
          (comment) => comment.category === "PlanetType" && comment.author === classification.author
        );
  
        const temperatureComment = data?.find(
          (comment) => comment.category === "Temperature" && comment.author === classification.author
        );
        
        if (orbitalPeriodComment) setSurveyorPeriod(orbitalPeriodComment.value || ""); 
        if (radiusComment) setDensity(radiusComment.content || null); 
        if (temperatureComment) setTemperature(temperatureComment.value || null); 
      }
  };  
  
  useEffect(() => {
      fetchComments();
      if (cloudSummary && p4Summary && ai4MSummary) {
        console.log(cloudSummary, p4Summary, ai4MSummary);
      }
  }, [classification, supabase]);

  useEffect(() => {
      const timer = setInterval(() => {
          setTimeLeft(prev => {
              const time = Math.max(getTimeUntilNextSunday() / 1000, 300);
              return Math.floor(time);
          });
      }, 1000);
  
      return () => clearInterval(timer);
  }, [supabase]);
  
  const handleViewChange = (view: FocusView) => {
      setCurrentView(view)
  };
  
  const handleBackToMain = () => {
      setCurrentView('planet');
  };

    // Planet generator content
    const PlanetComponent = useMemo(() => (
      <div className="flex w-full h-screen flex justify-center items-center">
        {classification && !loading && MemoizedPlanetGenerator}
      </div>
    ), [classification, loading, MemoizedPlanetGenerator]);    

    const ClimateComponent = () => (
        <div className="w-full max-w-6xl bg-black/20 backdrop-blur-md rounded-2xl p-6 text-white mx-auto space-y-6 overflow-y-auto max-h-[80vh]">
          {/* <div>
            <h2 className="text-lg font-semibold mb-2">Classification Configuration</h2>
            <div className="bg-black/30 p-4 rounded-xl overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(classification?.classificationConfiguration, null, 2)}
              </pre>
            </div>
          </div>
      
          {relatedClassifications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Related Classifications</h2>
              <div className="space-y-4 max-h-96 overflow-auto pr-2">
                {relatedClassifications.map((rc, index) => (
                  <div
                    key={index}
                    className="bg-black/30 p-4 rounded-xl"
                  >
                    <pre className="whitespace-pre-wrap break-words text-sm">
                      {JSON.stringify(rc, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          <div className="w-full max-w-4xl bg-black/10 backdrop-blur-sm rounded-xl p-6 text-white mx-auto">
      {(cloudSummary || p4Summary || ai4MSummary) && (
        <BiomeAggregator
          cloudSummary={cloudSummary}
          p4Summary={p4Summary}
          ai4MSummary={ai4MSummary}
          onBiomeUpdate={(biome) => setDominantBiome(biome)} biomassVersion={biomassScore}        />
      )}
                    <PlanetProgress
                  temperature={temperature}
                  radius={density}
                  biomassScore={biomassScore}
                  period={surveyorPeriod}
                />
    </div>
        </div>
    );      

    const AtmosphereComponent = () => (
        <div className="w-full max-w-4xl bg-black/10 backdrop-blur-sm rounded-xl p-6 text-white mx-auto">
          {classification?.id !== undefined && (
            <WeatherEventStatus 
              classificationId={classification.id} 
              biome={dominantBiome || 'RockyHighlands'}
              biomass={biomassScore}
            />
          )}
        </div>
    );

    const ExplorationComponent = () => (
        <div className="w-full max-w-4xl bg-black/10 backdrop-blur-sm rounded-xl p-6 text-white mx-auto">
          {classification && (
            <PostCardSingleWithGenerator
              key={classification.id}
              classificationId={classification.id}
              title={classification.title || "Untitled"}
              author={classification.author || "Unknown"}
              content={classification.content || "No content available"}
              votes={classification.votes || 0}
              category={classification.classificationtype || "Uncategorized"}
              // images={classification.images || []}
              anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
              classificationConfig={classification.classificationConfiguration}
              classificationType={classification.classificationtype || "Unknown"}
              tags={classification.tags || []}
              images={classification.images || []} 
              biome={dominantBiome || ''}
            />
          )}
        </div>
    );

    const MapComponent = () => (
        <div className="w-full max-w-4xl bg-black/10 backdrop-blur-sm rounded-xl p-6 text-white mx-auto">

        </div>
    );

    const EditComponent = () => (
        <div className="w-full max-w-4xl bg-black/10 backdrop-blur-sm rounded-xl p-6 text-white mx-auto">

        </div>
    );

    const renderFocusComponent = () => {
        switch (currentView) {
          case "planet":
            return PlanetComponent
          case "overview":
            return PlanetComponent
          case "Climate":
            return <ClimateComponent />
          case "atmosphere":
            return <AtmosphereComponent />
          case "exploration":
            return <ExplorationComponent />
          case "map":
            return <MapComponent />
          case "edit":
            return <EditComponent />
          default:
            return PlanetComponent
        };
    };

    return (
      <div className="min-h-screen w-screen">
        <GameNavbar />
        <div className="relative py-1 overflow-hidden bg-black text-white">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/Backdrops/background1.jpg"
                    alt='background'
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {dominantBiome && (
                <div className="absolute top-0 left-0 w-screen z-10">
                    <WeatherGenerator biome={dominantBiome} />
                </div>
            )}

            <main className="relative z-10 h-[100vh] flex flex-col justify-start pt-12">
                {currentView !== "planet" && (
                    <div className="absolute top-4 left-4 z-20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-black/50 text-white hover:bg-white/20"
                            onClick={handleBackToMain}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                <div className="hidden md:flex justify-center mt-4 space-x-4">
                    <Button
                        variant={currentView === "overview" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("overview")}
                    >
                        <Info className="mr-2 h-4 w-4" />
                        Overview
                    </Button>
                    <Button
                        variant={currentView === "Climate" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("Climate")}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Climate
                    </Button>
                    <Button
                        variant={currentView === "atmosphere" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("atmosphere")}
                    >
                        <Droplets className="mr-2 h-4 w-4" />
                        Atmosphere
                    </Button>
                    <Button
                        variant={currentView === "exploration" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("exploration")}
                    >
                        <Thermometer className="mr-2 h-4 w-4" />
                        Exploration
                    </Button>
                </div>

                <div  className="hidden md:flex justify-center mt-6 space-x-12 text-center">
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Biomass:</div>
                        {biomassScore}
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Density:</div>
                        {/* {density} */}
                        g/cm^3
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Main biome:</div>
                        {dominantBiome}
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Period:</div>
                        {period} Days {/* // or surveyorPeriod */}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6">
                    {renderFocusComponent()}
                </div>

                <div className="md:hidden p-4 space-y-2">
                    <div className="flex justify-between">
                        <div className="text-purple-400 uppercase text-xs"></div>
                        <div className="text-sm"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-purple-400 uppercase text-xs"></div>
                        <div className="text-sm"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-purple-400 uppercase text-xs"></div>
                        <div className="text-sm"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-purple-400 uppercase text-xs"></div>
                        <div className="text-sm"></div>
                    </div>
                </div>

                <div className="md:hidden flex justify-center mt-2 mb-4 space-x-2">
                    <Button
                        variant={currentView === "overview" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("overview")}
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={currentView === "Climate" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("Climate")}
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={currentView === "atmosphere" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("atmosphere")}
                    >
                        <Droplets className="h-4 w-4" />
                        </Button>
                    <Button
                        variant={currentView === "exploration" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        onClick={() => handleViewChange("exploration")}
                    >
                        <Thermometer className="h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
        </div>
    );
};