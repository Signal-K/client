"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Circle, Pencil, Square } from "lucide-react";
import * as THREE from "three";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";
import { useActivePlanet } from "@/context/ActivePlanet";
import { FirstTelescopeClassification } from "./Transiting";

interface PlanetProps {
    period: number;
};

interface ClassificationOptions {
    repeatingDips: boolean;
    alignedDips: boolean;
    noDips: boolean;
    similarSizeDips: boolean;
};

export interface Anomaly {
    id: bigint;
    content: string;
    avatar_url?: string;
};

function InitialExoplanetGuide({ period }: PlanetProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    useEffect(() => {
        const interval = setInterval(() => {
            if (meshRef.current) {
                meshRef.current.rotation.y += 0.01
    }
    }, 16);
            return () => clearInterval(interval);
    
    }, []);

    let color
    if (period < 3) {
        color = '#ff79c6';
    } else if (period >= 3 && period <= 7) {
        color = '#8be9fd';
    } else {
        color = '#bd93f9';
    };

    return ( // Update to have multiple planes/colour maps & noise later
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export function ExoplanetTransitHunter() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [imageUrl, setImageUrl] = useState('/placeholder.svg?height=400&width=600');
    const [classificationOptions, setClassificationOptions] = useState({
        repeatingDips: false,
        alignedDips: false,
        noDips: false,
        similarSizeDips: false,
    });
    const [period, setPeriod] = useState('');
    const [t0, setT0] = useState('');
    
    // For annotating
    const [currentTool, setCurrentTool] = useState(null);
    const [notes, setNotes] = useState('');
    useEffect(() => {
        if (canvasRef.current && currentTool) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            };

            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;

            const startDrawing = (e: MouseEvent) => {
                isDrawing = true;
                lastX = e.offsetX;
                lastY = e.offsetY;
            };

            const draw = (e: MouseEvent) => {
                if (!isDrawing) {
                    return;
                };

                ctx.beginPath();
                ctx.strokeStyle = '#f8f8f2';
                ctx.lineWidth = 2;

                if (currentTool === 'pen') {
                    ctx.beginPath();
                    ctx.lineTo(e.offsetX, e.offsetY);
                } else if (currentTool === 'circle') {
                    const radius = Math.sqrt((e.offsetX - lastX) ** 2 + (e.offsetY - lastY) ** 2);
                    ctx.arc(lastX, lastY, radius, 0, 2 * Math.PI);
                } else if (currentTool === 'square') {
                    ctx.rect(lastX, lastY, e.offsetX - lastX, e.offsetY - lastY);
                };

                ctx.stroke();
                lastX = e.offsetX;
                lastY = e.offsetY;
            };

            const stopDrawing = () => {
                isDrawing = false;
            };

            canvas.addEventListener("mousedown", startDrawing)
            canvas.addEventListener("mousemove", draw)
            canvas.addEventListener("mouseup", stopDrawing)
            canvas.addEventListener("mouseout", stopDrawing)
      
            return () => {
              canvas.removeEventListener("mousedown", startDrawing)
              canvas.removeEventListener("mousemove", draw)
              canvas.removeEventListener("mouseup", stopDrawing)
              canvas.removeEventListener("mouseout", stopDrawing)
            };
        };
    }, [currentTool]);

    const isInputDisabled = classificationOptions.noDips || Object.values(classificationOptions).every((v) => !v);

    // Globe & 3js
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Classification data
    const handleClassificationChange = (option: keyof ClassificationOptions) => {
        if (option === 'noDips') {
            setClassificationOptions({ ...classificationOptions, [option]: !classificationOptions[option] });
            setPeriod('');
            setT0('');
        } else {
            setClassificationOptions({ ...classificationOptions, [option]: !classificationOptions[option], noDips: false });
        };
    };

    // For transit events
    // Check tutorial mission for transit
    const [hasMission3000001, setHasMission3000001] = useState(false);
    useEffect(() => {
        const checkForTutorialMission = async () => {
            if (!session) {
                return;
            };

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select('id')
                    .eq('user', session.user.id)
                    .eq('mission', '3000001')
                    .single();

                if (missionError) {
                    throw missionError;
                };

                setHasMission3000001(!!missionData);
            } catch ( error: any ) {
                console.error('Error checking for tutorial mission: ', error);
            };
        };

        checkForTutorialMission();
    }, [session]);

    // Fetch structure configuration
    const [configuration, setConfiguration] = useState<any | null>(null);
    useEffect(() => {
        const fetchStructureConfiguration = async () => {
            if (!session) {
                return;
            };

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from("inventory")
                    .select('configuration')
                    .eq('item', 3103)
                    .eq('anomaly', activePlanet?.id)
                    .eq('owner', session.user.id)
                    .order('id', { ascending: true })
                    .limit(1)
                    .single();

                if (inventoryError) {
                    throw inventoryError;
                };

                if (inventoryData && inventoryData.configuration) {
                    setConfiguration(inventoryData.configuration);
                } else {
                    setConfiguration(null);
                };
            } catch (error: any) {
                console.error('Error fetching structure configuration: ', error);
                setConfiguration(null);
            };
        };

        fetchStructureConfiguration();
    }, [session, activePlanet]);

    // Fetch exoplanet anomaly (random, from TESS)
    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    useEffect(() => {
        const fetchExoplanetAnomaly = async () => {
            if (!session) {
                return;
            };

            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select('*')
                    .eq("anomalySet", "tess"); // /userChoice

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    return;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/anomalies/${randomAnomaly.id}/Binned.png`);
            } catch (error: any) {
                console.error('Error fetching exoplanet anomaly: ', error);
                setAnomaly(null);
            };
        };

        fetchExoplanetAnomaly();
    }, [session, activePlanet, supabase]);

    if (!hasMission3000001) {
        return (
            <div>
                <FirstTelescopeClassification
                    anomalyid={"6"}
                />
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4 space-y-6 bg-[#1e2129] text-[#f8f8f2] min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-[#82aaff]">Exoplanet Transit Hunter</h1>
            <div className="space-y-6">
                <div className="relative">
                    <img src={imageUrl} alt="Telescope's Transit Lightkurve image" className="w-full h-auto rounded-lg" />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        style={{ pointerEvents: currentTool ? "auto" : "none" }}
                    />
                </div>
                        {/* <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleAnnotation("pen")}
            variant={currentTool === "pen" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Pen
          </Button>
          <Button
            onClick={() => handleAnnotation("circle")}
            variant={currentTool === "circle" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Circle className="w-4 h-4 mr-2" />
            Circle
          </Button>
          <Button
            onClick={() => handleAnnotation("square")}
            variant={currentTool === "square" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Square className="w-4 h-4 mr-2" />
            Square
          </Button>
        </div> */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(classificationOptions).map(([key, value]) => (
                        <Button
                            key={key}
                            onClick={() => handleClassificationChange(key as keyof ClassificationOptions)}
                            variant={value ? "secondary" : "outline"}
                            className={`w-full ${
                                value ? "bg-[#ff79c6] text-[#282a36]" : "bg-[#44475a] text-[#f8f8f2]"
                            } hover:bg-[#bd93f9]`}
                        >
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </Button>
                    ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="period" className="block text-sm font-medium text-[#8be9fd]">
                            Orbital period (days)
                        </label>
                        <input
                            id="period"
                            type="number"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            disabled={isInputDisabled}
                            className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="t0" className="block text-sm font-medium text-[#8be9fd]">
                            Transit starting point (days)
                        </label>
                        <input
                            id="t0"
                            type="number"
                            value={t0}
                            onChange={(e) => setT0(e.target.value)}
                            disabled={isInputDisabled}
                            className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-[#8be9fd]">
                            Further notes
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isInputDisabled}
                            className="w-full p-2 bg-[#282a36] text-[#f8f8f2] rounded-md focus:ring-2 focus:ring-[#6272a4]"
                        />
                    </div>
                    <div>
                        <Canvas className="w-full h-64 bg-[#282a36] rounded-lg">
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 15, 10]} angle={0.3} />
                            <InitialExoplanetGuide period={period ? parseFloat(period) : 5} />
                            <OrbitControls />
                        </Canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};