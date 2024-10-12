"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Circle, Pencil, Square } from "lucide-react";
import { Mesh, SphereGeometry, MeshStandardMaterial } from "three";

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
    const meshRef = useRef<Mesh>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    };
  });

  const noise = (x: number, y: number) => {
    const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return seed - Math.floor(seed)
  };

  const generateTerrain = () => {
    const terrain = [];
    const resolution = 20;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const value = noise(i / resolution * period, j / resolution * period);
        terrain.push(value);
      };
    };
    return terrain;
  };

  const terrain = generateTerrain();

  const color = period < 3 ? "#ff79c6" : period >= 3 && period <= 7 ? "#8be9fd" : "#bd93f9";

  return ( // Update to have multiple colours/noise later
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );

  if (!terrain) {
    return (
        <div className="planet-container w-64 h-64 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="surfaceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}88`} />
          </radialGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#surfaceGradient)" filter="url(#noise)" />
        {terrain.map((height, index) => {
          const x = (index % 20) * 5
          const y = Math.floor(index / 20) * 5
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={height * 2}
              fill={`rgba(255,255,255,${height * 0.5})`}
              filter="url(#noise)"
            />
          )
        })}
        <circle cx="50" cy="50" r="48" fill="none" stroke={color} strokeWidth="0.5" />
      </svg>
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </div>
    );
  };
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
    const [structureId, setStructureId] = useState<number | null>(null);
    useEffect(() => {
        const fetchStructureConfiguration = async () => {
            if (!session) {
                return;
            };

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from("inventory")
                    .select('id, configuration')
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
                    setStructureId(inventoryData.id);
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

    const missionData = {
        user: session?.user.id,
        time_of_completion: new Date().toISOString(),
        mission: "3000001",
        configuration: null,
    };

    const handleCompleteMission = async () => {
        try {
            await supabase.from("missions").insert([missionData]);
        } catch (error: any) {
            console.error("Error completing mission: ", error);
        };
    };

    // Making the post
    const handleSubmitClassification = async () => {
        if (!session || !anomaly) {
            console.error("User session or anomaly not available");
            return;
        };

        handleCompleteMission();

        const planetGeneratorOptions = {};
        // Make sure to add mission for completing planet

        const classificationData = {
            anomaly: anomaly.id,
            author: session.user.id,
            content: notes,
            media: { imageUrl },  
            classificationtype: "Exoplanet Transit", 
            classificationConfiguration: {
                createdBy: configuration?.createdBy || "Telescope", 
                structureId: structureId, 
                activePlanet: activePlanet?.id || null,
                classificationOptions,
                planetGeneratorOptions, 
            },
        };

        try {
            const { data, error } = await supabase
                .from('classifications')
                .insert([classificationData]);

            if (error) {
                throw error;
            };

            console.log("Classification submitted:", data);
        } catch (error) {
            console.error("Error submitting classification:", error);
        };
    };

    return (
        <div className="container mx-auto p-4 space-y-6 bg-[#1e2129] text-[#f8f8f2] min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-[#82aaff]">Exoplanet Transit Hunter</h1>
            <div className="space-y-6">
                <div className="relative">
                    <img src={imageUrl} alt="Telescope's Transit Lightkurve image" className="w-128 rounded-lg" />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        style={{ pointerEvents: currentTool ? "auto" : "none" }}
                    />
                </div>
<div className="annotation">
                                                    <div className="flex flex-wrap gap-2">
          <Button
            // onClick={() => handleAnnotation("pen")}
            variant={currentTool === "pen" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Pen
          </Button>
          <Button
            // onClick={() => handleAnnotation("circle")}
            variant={currentTool === "circle" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Circle className="w-4 h-4 mr-2" />
            Circle
          </Button>
          <Button
            // onClick={() => handleAnnotation("square")}
            variant={currentTool === "square" ? "secondary" : "outline"}
            className="flex-1 bg-[#44475a] text-[#f8f8f2] hover:bg-[#6272a4]"
          >
            <Square className="w-4 h-4 mr-2" />
            Square
          </Button>
        </div> 
</div>
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
                    <div className="space-y-2">
                        <Button onClick={handleSubmitClassification} className="w-full mt-4">
                            Submit Classification
                        </Button>
                    </div>
                    <div className="planetAmbient">
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