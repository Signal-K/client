"use client";

import { useState, useEffect } from "react";
import PlanetViewer from "./planetViewer";
import { type PlanetConfig, defaultPlanetConfig } from "@/utils/planet-physics";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PlanetGeneratorProps {
    classificationId: string;
};

interface PlanetStats {
  mass?: number;
  radius?: number;
  [key: string]: any;
};

export default function PlanetGenerator({
    classificationId,
}: PlanetGeneratorProps) {
    const supabase = useSupabaseClient();

    const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig);
    const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
    const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
    const [importText, setImportText] = useState<string>("");
    const [importError, setImportError] = useState<string>("");

    const [planetStats, setPlanetStats] = useState<PlanetStats>({});

    const handleConfigChange = ( newConfig: Partial<PlanetConfig> ) => {
        setPlanetConfig(( prev ) => ({
            ...prev,
            ...newConfig
        }))
    };

    const handleImport = () => {
        try {
            const config = JSON.parse(importText);
            setPlanetConfig(config);
            setImportDialogOpen(false);
            setImportError("");
        } catch (error: any) {
            setImportError("Invalid JSON configuration");
        };
    };

    const handleExport = async () => {
        const idAsNumber = Number.parseInt(classificationId);
        if (isNaN(idAsNumber)) return;

        const { data, error: fetchError } = await supabase
            .from("classifications")
            .select("classificationConfiguration")
            .eq("id", idAsNumber)
            .single();

        if (fetchError || !data) {
            console.error("Failed to fetch planet configuration: ", fetchError);
            return;
        };

        const currentConfig = data.classificationConfiguration || {};
        const updatedConfig = {
            ...currentConfig,
            planetConfiguration: planetConfig,
        };

        const { error: updateError } = await supabase
            .from("classifications")
            .update({ classificationConfiguration: updatedConfig })
            .eq("id", idAsNumber);
        
        if (updateError) {
            console.error("Failed to update planet configuration, ", updateError);
        };
    };

    // Fetch planet data
    useEffect(() => {
        const fetchExportedValues = async () => {
        const idAsNumber = Number.parseInt(classificationId)
        if (isNaN(idAsNumber)) return

        const { data, error } = await supabase
            .from("classifications")
            .select("classificationConfiguration")
            .eq("id", idAsNumber)
            .single()

        if (error || !data?.classificationConfiguration?.exportedValue) return

        const { exportedValue } = data.classificationConfiguration

        setPlanetStats((prev) => ({
            ...prev,
            ...(exportedValue.mass && { mass: exportedValue.mass }),
            ...(exportedValue.radius && { radius: exportedValue.radius }),
        }))
        }

        fetchExportedValues()
    }, [classificationId, supabase])

    // Listen for custom events from the settings panel
    useEffect(() => {
        const handleOpenImport = () => setImportDialogOpen(true);
        const handleOpenExport = () => setExportDialogOpen(true);

        window.addEventListener("open-import-dialog", handleOpenImport);
        window.addEventListener("open-export-dialog", handleOpenExport);

        return () => {
            window.removeEventListener("open-import-dialog", handleOpenImport);
            window.removeEventListener("open-export-dialog", handleOpenExport);
        };
    }, []);

    const exportConfig = JSON.stringify(planetConfig, null, 2);
    
    return (
        <main className="flex w-full relative flex-col">
            <div className="w-full h-screen">
                <PlanetViewer planetConfig={planetConfig} onConfigChange={handleConfigChange} />
            </div>

            <p>{JSON.stringify(planetStats, null, 2)}</p>

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import Planet Configuration</DialogTitle>
                        <DialogDescription>Paste a previously exported planet configuration JSON below.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Paste JSON configuration here..."
                            className="min-h-[200px]"
                        />
                        {importError && <p className="text-red-500 text-sm">{importError}</p>}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport}>Import</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Export Planet Configuration</DialogTitle>
                    <DialogDescription>Copy this JSON to save your planet configuration.</DialogDescription>
                </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Textarea
                            value={exportConfig}
                            readOnly
                            className="min-h-[200px] font-mono text-sm"
                            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={async () => {
                                    await handleExport();
                                    navigator.clipboard.writeText(exportConfig)
                                    setExportDialogOpen(false)
                                }}
                            >
                                Copy & Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
};


// "use client"

// import { useState, useEffect } from "react"
// import { Canvas } from "@react-three/fiber"
// import { OrbitControls, Stars, Environment } from "@react-three/drei"
// import { PlanetShader } from "./PlanetShader"
// import { SimplePlanet } from "./Simple/simple"
// import { StylizedPlanetShader } from "./Shader/Styliized/stylized-planet-shader"
// import { StylizedClouds } from "./Shader/Styliized/stylized-cloud-shader"
// import { Planet } from "./Planet/planet-main"
// import { SettingsPanel } from "./SettingsPanel"
// import { Cog, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   type PlanetStats,
//   calculateDensity,
//   defaultPlanetStats,
//   mergeWithDefaults,
//   generateDefaultLandmarks,
// } from "@/lib/planet-physics"
// import { useSupabaseClient } from "@supabase/auth-helpers-react"

// export interface PlanetGeneratorProps {
//   classificationConfig?: any
//   content?: string
//   classificationId: string
//   author: string
//   type?: string
//   biome?: string 
//   planetConfiguration?: any
// };

// export function PlanetGenerator({
//   classificationId = "UNCLASSIFIED",
//   author = "UNKNOWN",
//   type,
//   biome,
//   planetConfiguration,
//   classificationConfig,
//   content,
// }: PlanetGeneratorProps) {
//   const supabase = useSupabaseClient()

//   const [showSettings, setShowSettings] = useState(false)
//   const [renderMode, setRenderMode] = useState<"detailed" | "simple" | "stylized" | "standard">("detailed")
//   const [planetStats, setPlanetStats] = useState<PlanetStats>(() => {
//     const initialStats = planetConfiguration
//       ? mergeWithDefaults(planetConfiguration)
//       : {
//           ...defaultPlanetStats,
//           ...(biome ? { biome } : {}),
//           ...(type ? { type } : {}),
//         }

//     if (!initialStats.landmarks || initialStats.landmarks.length === 0) {
//       initialStats.landmarks = generateDefaultLandmarks(initialStats)
//     }

//     return initialStats
//   })

//   // Update planet stats when configuration changes
//   useEffect(() => {
//     const updatedStats = planetConfiguration
//       ? mergeWithDefaults(planetConfiguration)
//       : {
//           ...defaultPlanetStats,
//           ...(biome ? { biome } : {}),
//           ...(type ? { type } : {}),
//         }

//     if (!updatedStats.landmarks || updatedStats.landmarks.length === 0) {
//       updatedStats.landmarks = generateDefaultLandmarks(updatedStats)
//     } else {
//       const hasTerrestrial = updatedStats.landmarks.some((l) => l.category === "terrestrial")
//       const hasGaseous = updatedStats.landmarks.some((l) => l.category === "gaseous")

//       if (!hasTerrestrial || !hasGaseous) {
//         const defaultLandmarks = generateDefaultLandmarks(updatedStats)
//         if (!hasTerrestrial) {
//           const terrestrial = defaultLandmarks.find((l) => l.category === "terrestrial")
//           if (terrestrial) updatedStats.landmarks.push(terrestrial)
//         }
//         if (!hasGaseous) {
//           const gaseous = defaultLandmarks.find((l) => l.category === "gaseous")
//           if (gaseous) updatedStats.landmarks.push(gaseous)
//         }
//       }
//     }

//     setPlanetStats(updatedStats)
//   }, [planetConfiguration, biome, type])

//   // Fetch exported values from Supabase
//   useEffect(() => {
//     const fetchExportedValues = async () => {
//       const idAsNumber = Number.parseInt(classificationId)
//       if (isNaN(idAsNumber)) return

//       const { data, error } = await supabase
//         .from("classifications")
//         .select("classificationConfiguration")
//         .eq("id", idAsNumber)
//         .single()

//       if (error || !data?.classificationConfiguration?.exportedValue) return

//       const { exportedValue } = data.classificationConfiguration

//       setPlanetStats((prev) => ({
//         ...prev,
//         ...(exportedValue.mass && { mass: exportedValue.mass }),
//         ...(exportedValue.radius && { radius: exportedValue.radius }),
//       }))
//     }

//     fetchExportedValues()
//   }, [classificationId, supabase])

//   // Update density when mass or radius changes
//   useEffect(() => {
//     setPlanetStats((prev) => ({
//       ...prev,
//       density: calculateDensity(prev.mass, prev.radius),
//     }))
//   }, [planetStats.mass, planetStats.radius])

//   // Get render mode label
//   const getRenderModeLabel = () => {
//     switch (renderMode) {
//       case "detailed":
//         return "Detailed View"
//       case "stylized":
//         return "Stylized View"
//       case "simple":
//         return "Simple View"
//       case "standard":
//         return "Standard Render"
//       default:
//         return "Detailed View"
//     }
//   }

//   return (
//     <div className="w-full h-screen relative overflow-hidden">
//       {/* Classification info - kept but commented out as in original */}
//       {/* <div className="absolute top-4 left-4 z-10 bg-black/70 text-green-400 font-mono p-2 rounded border border-green-500/30 text-sm">
//         <div>
//           <span className="text-green-500/70">ID:</span> {classificationId}
//         </div>
//         <div>
//           <span className="text-green-500/70">AUTHOR:</span> {author}
//         </div>
//         {type && (
//           <div>
//             <span className="text-green-500/70">TYPE:</span> {type}
//           </div>
//         )}
//         {biome && (
//           <div>
//             <span className="text-green-500/70">BIOME:</span> {biome}
//           </div>
//         )}
//         {planetStats.landmarks && planetStats.landmarks.length > 0 && (
//           <div>
//             <span className="text-green-500/70">LANDMARKS:</span> {planetStats.landmarks.length}
//           </div>
//         )}
//       </div> */}

//       {/* Classification config - kept but commented out as in original */}
//       {/* {classificationConfig && (
//         <pre className="text-xs text-white/70">
//           {JSON.stringify(classificationConfig, null, 2)}
//         </pre>
//       )} */}

//       {/* Use a key on the Canvas to force a complete remount when switching modes */}
//       <Canvas key={renderMode} camera={{ position: [0, 0, 10], fov: 45 }}>
//         <ambientLight intensity={0.4} />
//         <pointLight position={[10, 10, 10]} intensity={2} />
//         <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b0c4de" />
//         <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
//         <Environment preset="sunset" />

//         {renderMode === "detailed" && <PlanetShader planetStats={planetStats} />}
//         {renderMode === "stylized" && (
//           <>
//             <StylizedPlanetShader planetStats={planetStats} />
//             <StylizedClouds planetStats={planetStats} />
//           </>
//         )}
//         {renderMode === "simple" && <SimplePlanet planetStats={planetStats} />}
//         {renderMode === "standard" && <Planet planetStats={planetStats} />}

//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
//         <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
//         <mesh position={[0, 0, -15]}>
//           <sphereGeometry args={[5, 32, 32]} />
//           <meshBasicMaterial color="#4060ff" transparent opacity={0.03} />
//         </mesh>
//       </Canvas>

//       <div className="absolute top-4 right-4 flex gap-2">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" size="sm" className="bg-black/50 hover:bg-black/70 text-white">
//               {getRenderModeLabel()}
//               <ChevronDown className="ml-2 h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="bg-black/80 border-slate-700 text-white">
//             <DropdownMenuItem
//               className={renderMode === "detailed" ? "bg-cyan-900/40" : "hover:bg-slate-700/50"}
//               onClick={() => setRenderMode("detailed")}
//             >
//               Detailed View
//             </DropdownMenuItem>
//             <DropdownMenuItem
//               className={renderMode === "stylized" ? "bg-cyan-900/40" : "hover:bg-slate-700/50"}
//               onClick={() => setRenderMode("stylized")}
//             >
//               Stylized View
//             </DropdownMenuItem>
//             <DropdownMenuItem
//               className={renderMode === "simple" ? "bg-cyan-900/40" : "hover:bg-slate-700/50"}
//               onClick={() => setRenderMode("simple")}
//             >
//               Simple View
//             </DropdownMenuItem>
//             <DropdownMenuItem
//               className={renderMode === "standard" ? "bg-cyan-900/40" : "hover:bg-slate-700/50"}
//               onClick={() => setRenderMode("standard")}
//             >
//               Standard Render
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <Button
//           variant="outline"
//           size="icon"
//           className="bg-black/50 hover:bg-black/70 text-white"
//           onClick={() => setShowSettings(!showSettings)}
//         >
//           <Cog className="h-4 w-4" />
//         </Button>
//       </div>

//       {showSettings && (
//         <SettingsPanel
//           planetStats={planetStats}
//           setPlanetStats={setPlanetStats}
//           classificationId={classificationId}
//           author={author}
//         />
//       )}
//     </div>
//   )
// };