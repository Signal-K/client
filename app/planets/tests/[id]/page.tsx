'use client';

import React, { useEffect, useCallback, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, FileText, Info, Thermometer } from "lucide-react";

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

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Time stuff
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

    return (
        <div className="relative min-h-screen w-screen overflow-hidden bg-black text-white">
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

            {/* {dominantBiome && ( */}
                <div className="absolute top-0 left-0 w-screen z-10">
                    Weather generator goes here
                </div>
            {/* )} */}

            <main className="relative z-10 h-[100vh] flex flex-col justify-start pt-12">
                {/* {currentView !== "planet" && ( */}
                    <div className="absolute top-4 left-4 z-20">
                        <Button
                            variant='ghost'
                            size='icon'
                            className="rounded-full bg-black/50 text-white hover:bg-white/20"
                            // onClick={}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                {/* )} */}

                <div className="hidden md:flex justify-center mt-4 space-x-4">
                    <Button
                        className="text-white border border-white/30 hover:bg-white/10"
                    >
                        <Info className="mr-2 h-4 w-4" />
                        Overview
                    </Button>
                    <Button
                        // variant={currentView === "Climate" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("Climate")}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Climate
                    </Button>
                    <Button
                        // variant={currentView === "atmosphere" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("atmosphere")}
                    >
                        <Droplets className="mr-2 h-4 w-4" />
                        Atmosphere
                    </Button>
                    <Button
                        // variant={currentView === "exploration" ? "secondary" : "ghost"}
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("exploration")}
                    >
                        <Thermometer className="mr-2 h-4 w-4" />
                        Exploration
                    </Button>
                </div>

                <div  className="hidden md:flex justify-center mt-6 space-x-12 text-center">
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Biomass:</div>
                        {/* {biomass} */} 
                        Biomass goes here
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Density:</div>
                        {/* {density} */}
                        Density
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Density:</div>
                        {/* {dominantBiome} */}
                        Biome
                    </div>
                    <div>
                        <div className="text-sm uppercase tracking-wider text-white/70">Density:</div>
                        {/* {surveyorPeriod} */}
                        Days
                    </div>
                </div>

                <div className="flex-1 flex items-start justify-center mt-2">
                    Render focus component here
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
                        // variant={currentView === "overview" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("overview")}
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                    <Button
                        // variant={currentView === "Climate" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("Climate")}
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        // variant={currentView === "atmosphere" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("atmosphere")}
                    >
                        <Droplets className="h-4 w-4" />
                        </Button>
                    <Button
                        // variant={currentView === "exploration" ? "secondary" : "ghost"}
                        size="sm"
                        className="text-white border border-white/30 hover:bg-white/10"
                        // onClick={() => handleViewChange("exploration")}
                    >
                        <Thermometer className="h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
};