'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";
import SatellitePlanetFourAggregator, { SatellitePlanetFourClassification } from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/P4Aggregator";
import AI4MAggregator from "@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AI4MAggregator";
import BuildTerrariumStructures from "@/components/Structures/Build/BuildOnTerrariums";
import StructuresOnTerrarium from "@/components/Structures/StructuresOnTerrarium";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock } from "lucide-react";
import Image from "next/image"
import { Edit, Map, ArrowLeft, Info, FileText, Droplets, Thermometer, Globe } from "lucide-react"
import SimplePlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/SimplePlanetGenerator";
import { Button } from "@/components/ui/button"
import BiomassStats from "@/components/Structures/Missions/Biologists/BiomassOnPlanet";
import WeatherGenerator from "@/components/Data/Generator/Weather/SimpleWeatherEvents";
import { PlanetGenerator } from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import PlanetProgress from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetCompletion";

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

const planets: Record<string, PlanetData> = {
  orionis: {
    name: "ORIONIS",
    galaxy: "Virgo A",
    diameter: "120,780 km",
    dayLength: "4 Earth hours",
    temperature: "10°C to 40°C",
    climate: "Temperate",
  },
  etheron: {
    name: "ETHERON",
    galaxy: "Sombrero",
    diameter: "56,780 km",
    dayLength: "12 Earth hours",
    temperature: "60°C to 90°C",
    climate: "Tropical",
  },
  theronix: {
    name: "THERONIX",
    galaxy: "Andromeda",
    diameter: "89,320 km",
    dayLength: "36 Earth hours",
    temperature: "-20°C to 15°C",
    climate: "Arctic",
  },
}

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

export default function ClassificationDetail({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);

  const [loading, setLoading] = useState(true);
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
  const [currentView, setCurrentView] = useState<FocusView>("planet");
  const [density, setDensity] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const planet = planets[currentPlanet];
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
  
      // Find the first comment by the author with type 'OrbitalPeriod'
      const orbitalPeriodComment = data?.find(
        (comment) => comment.category === "OrbitalPeriod" && comment.author === classification.author
      );

      const radiusComment = data?.find(
        (comment) => comment.category === "PlanetType" && comment.author === classification.author
      );

      const temperatureComment = data?.find(
        (comment) => comment.category === "Temperature" && comment.author === classification.author
      )
      
      if (orbitalPeriodComment) {
        setSurveyorPeriod(orbitalPeriodComment.value || ""); 
      };

      if (radiusComment) {
        setDensity(radiusComment.content || null); 
      };

      if (temperatureComment) {
        setTemperature(temperatureComment.value || null); 
      };

      setBiomassScore(calculateBiomass(temperature ?? undefined, density ?? undefined, parseFloat(surveyorPeriod) || undefined));
    };
  };  

  useEffect(() => {
    fetchComments();
    {cloudSummary && p4Summary && ai4MSummary && (
      console.log(cloudSummary, p4Summary, ai4MSummary) 
  )}
  }, [classification, supabase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const time = Math.max(getTimeUntilNextSunday() / 1000, 300); // Ensure it's always at least 5 minutes
        return Math.floor(time);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleViewChange = (view: FocusView) => {
    setCurrentView(view)
  };

  const handleBackToMain = () => {
    setCurrentView("planet")
  };

  useEffect(() => {
    if (!params.id) return;

    const fetchClassification = async () => {
      if (!params.id || !session) return;

      const { data, error } = await supabase
        .from("classifications")
        .select("*, anomaly:anomalies(*), classificationConfiguration, media")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Failed to fetch classification.");
        setLoading(false);
        return;
      };

      setClassification(data);
      setAnomaly(data.anomaly);

      const periodFromField = data.classificationConfiguration?.additionalFields?.field_0;
      if (periodFromField) {
        setPeriod(periodFromField);
      }

      const parentPlanetLocation = data.anomaly?.id;
      if (parentPlanetLocation) {
        const query = supabase
          .from("classifications")
          .select("*, anomaly:anomalies(*), classificationConfiguration, media")
          .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString());

        if (showCurrentUser) {
          query.eq("author", session.user.id);
        }

        const { data: relatedData, error: relatedError } = await query;

        if (relatedError) {
          setError("Failed to fetch related classifications.");
          setLoading(false);
          return;
        };

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

    fetchClassification();
  }, [params.id, supabase, session, showCurrentUser]);

  if (loading) return <p>Loading classification data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!classification) return <p>Classification not found.</p>;

  const cloudClassifications = relatedClassifications.filter(
    (related) => related.classificationtype === "cloud"
  );

  const satelliteP4Classifications: SatellitePlanetFourClassification[] = relatedClassifications
    .filter(
      (related): related is Classification & SatellitePlanetFourClassification =>
        related.classificationtype === "satellite-planetFour" &&
        Array.isArray(related.classificationConfiguration?.annotationOptions)
    )
    .map((related) => ({
      id: related.id,
      annotationOptions: related.classificationConfiguration?.annotationOptions || [],
      classificationConfiguration: related.classificationConfiguration || {}
    }));

  const ai4MClassifications: AI4MClassification[] = relatedClassifications.filter(
    (related) => related.classificationtype === "automaton-aiForMars"
  ).map((related) => ({
    id: related.id,
    classificationConfiguration: related.classificationConfiguration || {},
    annotationOptions: related.classificationConfiguration?.annotationOptions || []
  }));

  const handleCloudSummaryUpdate = (summary: AggregatedCloud) => {
    setCloudSummary(summary);
    console.log("Cloud Summary:", summary);
  };

  const handleP4SummaryUpdate = (summary: AggregatedP4) => {
    setP4Summary(summary);
  };

  // const handleAI4MSummaryUpdate = useCallback((summary: AggregatedAI4M) => {
  //   setAI4MSummary(summary);
  // }, []);  

  const toggleUserClassifications = () => {
    setShowCurrentUser((prev) => !prev);
  };

  const toggleMetadataVisibility = () => {
    setShowMetadata((prev) => !prev);
  };

  const getBackgroundImage = (planetType: string | null) => {
    switch (planetType) {
      case "Terrestrial":
        return "url('/assets/Backdrops/Venus.png')";
      case "Gaseous":
        return "url('/assets/Backdrops/gasgiant.jpeg')";
      default:
        return "url('/assets/Backdrops/Earth.png')";
    };
  };

  // Component for the Climate information
  const ClimateComponent = () => (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl p-6 text-white">
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
  );

  // Component for the atmosphere information
  const AtmosphereComponent = () => (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl p-6 text-white">
      <>
       {/* Cloud Classification Summary */}
         {cloudClassifications.length > 0 && (
            <CloudClassificationSummary
              classifications={cloudClassifications}
              onSummaryUpdate={handleCloudSummaryUpdate}
            />
          )}

         {/* SP4 Classification Summary */}
          {satelliteP4Classifications.length > 0 && (
            <SatellitePlanetFourAggregator
              classifications={satelliteP4Classifications}
              onSummaryUpdate={handleP4SummaryUpdate}
            />
          )}

          {/* AI4M Classification Summary */}
          {/* {ai4MClassifications.length > 0 && (
            <AI4MAggregator
  classifications={ai4MClassifications}
  onSummaryUpdate={handleAI4MSummaryUpdate}
/>
          )} */}
        </>
    </div>
  )

  // Component for the exploration information
  const ExplorationComponent = () => (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl p-6 text-white">
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
    </div>
  );

  // Component for the map view
  const MapComponent = () => (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl p-6 text-white">
      <h2 className="text-2xl font-light mb-4">Planet Map</h2>
      <div className="space-y-4">
        <div className="relative h-80 bg-blue-900/50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg">Interactive Map</p>
              <p className="text-sm text-white/70 mt-2">Topographical data is currently loading...</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button variant="outline" size="sm" className="text-xs">
              Terrain
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Satellite
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Resources
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 p-2 rounded-lg">
            <h3 className="text-xs font-medium">Northern Hemisphere</h3>
            <p className="text-xs text-white/80">3 continents, 2 major oceans</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <h3 className="text-xs font-medium">Equatorial Region</h3>
            <p className="text-xs text-white/80">Dense rainforests, island chains</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
            <h3 className="text-xs font-medium">Southern Hemisphere</h3>
            <p className="text-xs text-white/80">Ice caps, mountain ranges</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Component for the edit view
  const EditComponent = () => (
    <div className="w-full max-w-lg bg-black/40 backdrop-blur-sm rounded-xl p-6 text-white">
      <h2 className="text-2xl font-light mb-4">Edit Planet Data</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Planet Name</label>
            <input
              type="text"
              defaultValue={planet.name}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Galaxy</label>
            <input
              type="text"
              defaultValue={planet.galaxy}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Biomass:</label>
            {/* <input
              type="text"
              defaultValue={planet.diameter}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            /> */}
            {/* <BiomassStats /> */}
            {biomassScore}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Day Length</label>
            <input
              type="text"
              defaultValue={planet.dayLength}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Temperature Range</label>
            <input
              type="text"
              defaultValue={planet.temperature}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Climate</label>
            <input
              type="text"
              defaultValue={planet.climate}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div className="pt-2">
            <Button className="w-full">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )

  const PlanetComponent = () => (
    <div>
        {classification && (
            <>
                {/* <SimplePlanetGenerator
                classificationId={String(classification.id)}
                classificationConfig={classification.classificationConfiguration}
                author={classification.author || ''}
                biome={dominantBiome ?? undefined}
              /> */}
                <PlanetGenerator />
              </>
        )}
    </div>
  );

  const renderFocusComponent = () => {
    switch (currentView) {
      case "planet":
        return <PlanetComponent />
      case "overview":
        return <PlanetComponent />
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
        return <PlanetComponent />
    };
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1454789591675-556c287e39e2?q=80&w=2344&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Space background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {dominantBiome && (
        <><WeatherGenerator biome={dominantBiome} /></>
      )}

      {/* Navigation */}
      {/* <header className="relative z-10 p-4 md:p-6">
        <nav className="hidden md:flex justify-between items-center">
          <div className="flex space-x-6 invisible">
            <button className="text-sm font-light hover:text-white/80">Home</button>
            <button className="text-sm font-light hover:text-white/80">About</button>
            <button className="text-sm font-light hover:text-white/80">Contact</button>
          </div>
          <div className="text-xl font-light tracking-widest">METEORA</div>
          <div className="flex space-x-6 invisible">
            <button className="text-sm font-light hover:text-white/80">Galaxies</button>
            <button className="text-sm font-light hover:text-white/80">Solar System</button>
            <button className="text-sm font-light hover:text-white/80">Earth</button>
          </div>
        </nav>
        <div className="md:hidden flex justify-between items-center">
          <div className="text-xl font-light tracking-widest">METEORA</div>
          <Button variant="ghost" size="icon" className="text-white">
            <Globe className="h-5 w-5" />
          </Button>
        </div>
      </header> */}

      {/* Main content */}
      <main className="relative z-10 h-[calc(100vh-80px)] flex flex-col">
        {/* Planet name */}
        <div className="text-center mt-8 py-8 md:mt-8">
          {/* <h1 className="text-4xl md:text-6xl font-light tracking-widest">{planet.name}</h1> */}
        </div>

        {/* Back button - only visible when not on planet view */}
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

        {/* Action buttons - Desktop */}
        <div className="hidden md:flex justify-center mt-6 space-x-4">
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

        {/* Planet stats - Desktop */}
        <div className="hidden md:flex justify-center mt-8 space-x-12 text-center">
          <div>
            <div className="text-sm uppercase tracking-wider text-white/70">Biomass:</div>
            {/* <BiomassStats /> */}
            {biomassScore}
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-white/70">Radius:</div>
            <div className="text-lg">{density} Earth radii</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-white/70">Biome:</div>
            <div className="text-lg">{dominantBiome}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-white/70">Period:</div>
            <div className="text-lg">{surveyorPeriod}</div>
          </div>
          {/* <div>
            <div className="text-sm uppercase tracking-wider text-white/70"></div>
            <div className="text-lg">{planet.climate}</div>
          </div> */}
        </div>

        {/* Planet visualization or focused component */}
        <div className="flex-1 relative flex items-center justify-center">
          {renderFocusComponent()}

          {/* Planet selector - Mobile only */}
          {/* <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              variant={currentPlanet === "theronix" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentPlanet("theronix")}
              className="text-xs"
            >
              THERONIX
            </Button>
            <Button
              variant={currentPlanet === "orionis" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentPlanet("orionis")}
              className="text-xs"
            >
              ORIONIS
            </Button>
            <Button
              variant={currentPlanet === "etheron" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCurrentPlanet("etheron")}
              className="text-xs"
            >
              ETHERON
            </Button>
          </div> */}
        </div>

        {/* Planet stats - Mobile */}
        <div className="md:hidden p-4 space-y-2">
          <div className="flex justify-between">
            <div className="text-purple-400 uppercase text-xs">Galaxy</div>
            <div className="text-sm">{planet.galaxy}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-purple-400 uppercase text-xs">Diameter</div>
            <div className="text-sm">{planet.diameter}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-purple-400 uppercase text-xs">Day Length</div>
            <div className="text-sm">{planet.dayLength}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-purple-400 uppercase text-xs">Avg Temperature</div>
            <div className="text-sm">{planet.temperature}</div>
          </div>
          {/* <div className="flex justify-between">
            <div className="text-purple-400 uppercase text-xs">Climate</div>
            <div className="text-sm">{planet.climate}</div>
          </div> */}
        </div>

        {/* Action buttons - Mobile */}
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

        {/* Edit and Map buttons
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex space-x-2">
          <Button
            variant={currentView === "edit" ? "secondary" : "outline"}
            size="icon"
            className="rounded-full bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={() => handleViewChange("edit")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "map" ? "secondary" : "outline"}
            size="icon"
            className="rounded-full bg-black/50 border-white/30 text-white hover:bg-white/20"
            onClick={() => handleViewChange("map")}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div> */}
      </main>
    </div>
  );

  // return (
  //   <div
  //     className="p-6 bg-black text-white border rounded-md opacity-80 shadow-md relative"
  //     style={{
  //       backgroundImage: getBackgroundImage(classification.classificationConfiguration?.planetType || null),
  //       backgroundSize: "cover",
  //       backgroundPosition: "center",
  //       backgroundRepeat: "no-repeat",
  //     }}
  //   >
  //     <Navbar />
  //     <div className="py-5"></div>
  //     <h1 className="text-2xl font-bold">{classification.classificationConfiguration?.planetType || classification.content || `Planet #${classification.id}`}</h1>
  //     {classification.author && (
  //       <><PostCardSingleWithGenerator
  //         key={classification.id}
  //         classificationId={classification.id}
  //         title={classification.title || "Untitled"}
  //         author={classification.author || "Unknown"}
  //         content={classification.content || "No content available"}
  //         votes={classification.votes || 0}
  //         category={classification.classificationtype || "Uncategorized"}
  //         // images={classification.images || []}
  //         anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
  //         classificationConfig={classification.classificationConfiguration}
  //         classificationType={classification.classificationtype || "Unknown"}
  //         tags={classification.tags || []}
  //         images={classification.images || []} 
  //         biome={dominantBiome || ''}
  //       />
  //       <div className="flex flex-col">

  //     <div className="flex items-center gap-3 mt-2">
  //       <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
  //         <Clock className="h-4 w-4" />
  //         <span className="text-sm">Next: {formatTime(timeLeft)}</span>
  //       </Badge>
  //       <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
  //         <Camera className="h-4 w-4" />
  //         <span className="text-sm">12 Active</span>
  //       </Badge>
  //     </div>
  //   </div>
  //       </>
  //     )}

  //     <BuildTerrariumStructures location={classification.id} />
  //     <StructuresOnTerrarium location={classification.id} />

  //     {(cloudSummary || p4Summary || ai4MSummary) && (
  //       <BiomeAggregator
  //         cloudSummary={cloudSummary}
  //         p4Summary={p4Summary}
  //         ai4MSummary={ai4MSummary}
  //         onBiomeUpdate={(biome) => setDominantBiome(biome)}
  //       />
  //     )}

  //     {/* Toggle Buttons */}
  //     <div className="mt-4">
  //       <button 
  //         className="px-4 py-2 bg-blue-500 text-white rounded-md"
  //         onClick={toggleUserClassifications}
  //       >
  //         {showCurrentUser ? "Show All Classifications" : "Show My Classifications"}
  //       </button>
  //       <button 
  //         className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md"
  //         onClick={toggleMetadataVisibility}
  //       >
  //         {showMetadata ? "Hide Metadata" : "Show Metadata"}
  //       </button>
  //     </div>

  //     {/* Show Metadata (if toggle is on) */}
  //     {showMetadata && (
  //       <>
  //         {/* Cloud Classification Summary */}
  //         {cloudClassifications.length > 0 && (
  //           <CloudClassificationSummary
  //             classifications={cloudClassifications}
  //             onSummaryUpdate={handleCloudSummaryUpdate}
  //           />
  //         )}

  //         {/* SP4 Classification Summary */}
  //         {satelliteP4Classifications.length > 0 && (
  //           <SatellitePlanetFourAggregator
  //             classifications={satelliteP4Classifications}
  //             onSummaryUpdate={handleP4SummaryUpdate}
  //           />
  //         )}

  //         {/* AI4M Classification Summary */}
  //         {ai4MClassifications.length > 0 && (
  //           <AI4MAggregator
  //             classifications={ai4MClassifications}
  //             onSummaryUpdate={handleAI4MSummaryUpdate}
  //           />
  //         )}
  //       </>
  //     )}

  //     {/* Related Classifications */}
  //     {/* {relatedClassifications.length > 0 && (
  //       <div className="mt-8">
  //         <h3 className="text-xl font-semibold">Related Classifications</h3>
  //         <div className="grid grid-cols-2 gap-4 mt-4">
  //           {relatedClassifications.map((related) => (
  //             <PostCardSingleWithGenerator
  //               key={related.id}
  //               classificationId={related.id}
  //               title={related.title || "Untitled"}
  //               author={related.author || "Unknown"}
  //               content={related.content || "No content available"}
  //               votes={related.votes || 0}
  //               category={related.classificationtype || "Uncategorized"}
  //               tags={related.tags || []}
  //               images={related.images || []} anomalyId={""} classificationType={""}              />
  //           ))}
  //         </div>
  //       </div>
  //     )} */}
  //   </div>
  // );
}