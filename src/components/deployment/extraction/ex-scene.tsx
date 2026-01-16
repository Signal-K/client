"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Drill, Satellite, Droplet, Snowflake, Gem, Beaker, Award, ChevronRight, ArrowLeft } from "lucide-react"

interface MineralConfiguration {
  type: string
  amount?: number
  quantity?: number
  purity: number
  metadata?: {
    source?: string
    discoveryMethod?: string
    coordinates?: { x: number; y: number }
    [key: string]: any
  };
};

interface ExtractionSceneProps {
  id: number
  mineralConfiguration: MineralConfiguration
  location?: string
  discoveryId?: number
  roverName?: string
  projectType: "P4" | "cloudspotting" | "JVH" | "AI4M"
  onExtractionComplete?: (quantity: number, purity: number) => void
};

// Mineral type configurations
const mineralConfig = {
  // AI4M minerals (rover-based)
  "Iron Oxide": { color: "bg-red-600", icon: Gem, tool: "drill", difficulty: "moderate" },
  Silicate: { color: "bg-amber-500", icon: Gem, tool: "scoop", difficulty: "easy" },
  Carbonates: { color: "bg-gray-400", icon: Gem, tool: "drill", difficulty: "moderate" },
  Sulfates: { color: "bg-yellow-400", icon: Gem, tool: "scoop", difficulty: "easy" },
  "Hydrated Minerals": { color: "bg-blue-400", icon: Droplet, tool: "drill", difficulty: "hard" },
  Olivine: { color: "bg-green-600", icon: Gem, tool: "drill", difficulty: "hard" },
  Pyroxene: { color: "bg-emerald-700", icon: Gem, tool: "drill", difficulty: "moderate" },

  // P4 minerals (satellite-based)
  dust: { color: "bg-orange-300", icon: Beaker, tool: "atmospheric-collector", difficulty: "easy" },
  soil: { color: "bg-amber-700", icon: Beaker, tool: "surface-sampler", difficulty: "easy" },
  "water-vapour": { color: "bg-cyan-300", icon: Droplet, tool: "atmospheric-collector", difficulty: "moderate" },

  // Cloudspotting minerals (satellite-based)
  "water-ice": { color: "bg-blue-300", icon: Snowflake, tool: "spectral-analyzer", difficulty: "moderate" },
  "co2-ice": { color: "bg-slate-300", icon: Snowflake, tool: "spectral-analyzer", difficulty: "moderate" },

  // JVH minerals (satellite-based)
  "metallic-hydrogen": { color: "bg-purple-500", icon: Beaker, tool: "deep-probe", difficulty: "hard" },
  "metallic-helium": { color: "bg-indigo-400", icon: Beaker, tool: "deep-probe", difficulty: "hard" },
  methane: { color: "bg-orange-400", icon: Beaker, tool: "atmospheric-collector", difficulty: "moderate" },
  ammonia: { color: "bg-teal-400", icon: Beaker, tool: "atmospheric-collector", difficulty: "moderate" },
};

const toolNames = {
  drill: "Percussion Drill",
  scoop: "Robotic Scoop",
  "atmospheric-collector": "Atmospheric Collector",
  "surface-sampler": "Surface Sampler",
  "spectral-analyzer": "Spectral Analyzer",
  "deep-probe": "Deep Atmospheric Probe",
};

export function ExtractionScene({
  id,
  mineralConfiguration,
  location,
  discoveryId,
  roverName,
  projectType,
  onExtractionComplete,
}: ExtractionSceneProps) {
  const router = useRouter()
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extracted, setExtracted] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  const mineralType = mineralConfiguration.type
  const config = mineralConfig[mineralType as keyof typeof mineralConfig] || {
    color: "bg-gray-500",
    icon: Gem,
    tool: "drill",
    difficulty: "moderate",
  }

  const quantity = mineralConfiguration.amount || mineralConfiguration.quantity || 0
  const purity =
    typeof mineralConfiguration.purity === "number"
      ? mineralConfiguration.purity > 1
        ? mineralConfiguration.purity
        : mineralConfiguration.purity * 100
      : 0

  const isRoverBased = projectType === "AI4M" || projectType === "P4"
  const isSatelliteBased = projectType === "cloudspotting" || projectType === "JVH"

  const MineralIcon = config.icon

  // Generate extraction particles
  useEffect(() => {
    if (extracting && progress > 20) {
      const interval = setInterval(() => {
        setParticles((prev) => [
          ...prev.slice(-10), // Keep last 10 particles
          {
            id: Date.now() + Math.random(),
            x: 50 + (Math.random() - 0.5) * 20,
            y: 70 + (Math.random() - 0.5) * 10,
          },
        ])
      }, 200)
      return () => clearInterval(interval)
    }
  }, [extracting, progress])

  const handleExtract = async () => {
    setExtracting(true)
    setProgress(0)

    // Simulate extraction progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setExtracting(false)
          setExtracted(true)
          if (onExtractionComplete) {
            onExtractionComplete(quantity, purity)
          }
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const handleViewDiscovery = () => {
    if (discoveryId) {
      router.push(`/posts/${discoveryId}`)
    }
  }

  const backgroundType = isRoverBased ? "rover" : "stars"

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-background to-background/80 py-4 px-4">
      <div className="flex flex-col max-w-6xl mx-auto w-full space-y-4 h-full">
        {/* Header with back button */}
        <div className="flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {discoveryId && (
            <Button variant="outline" size="sm" onClick={handleViewDiscovery} className="gap-2 bg-transparent">
              View Discovery
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Large immersive extraction scene - flexible height */}
        <div className="relative w-full flex-1 rounded-lg overflow-hidden border border-border/30 shadow-2xl">
          {/* Terrain Layer */}
          <div className="absolute inset-0">
            {/* Rover-based terrain (Martian surface) */}
            {isRoverBased && (
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 70%, #8b4513 0%, transparent 50%),
                    radial-gradient(ellipse at 70% 60%, #a0522d 0%, transparent 40%),
                    linear-gradient(180deg, transparent 0%, #cd853f 60%, #8b4513 100%)
                  `,
                }}
              >
                {/* Surface texture details */}
                <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-black/20"
                      style={{
                        left: `${Math.random() * 100}%`,
                        bottom: `${Math.random() * 40}%`,
                        width: `${4 + Math.random() * 16}px`,
                        height: `${4 + Math.random() * 16}px`,
                      }}
                    />
                  ))}
                </div>
                {/* Horizon line */}
                <div className="absolute bottom-32 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-900/50 to-transparent" />
              </div>
            )}

            {/* Satellite-based terrain (Gaseous/Cloud atmosphere) */}
            {isSatelliteBased && (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    projectType === "cloudspotting"
                      ? `
                        radial-gradient(ellipse at 20% 40%, #b3d9ff 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 60%, #e6f3ff 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 80%, #cce6ff 0%, transparent 40%),
                        linear-gradient(180deg, #4d94ff 0%, #80b3ff 50%, #b3d9ff 100%)
                      `
                      : `
                        radial-gradient(ellipse at 30% 30%, #9966ff 0%, transparent 60%),
                        radial-gradient(ellipse at 70% 70%, #cc99ff 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 50%, #b380ff 0%, transparent 40%),
                        linear-gradient(180deg, #6633cc 0%, #9966ff 50%, #cc99ff 100%)
                      `,
                }}
              >
                {/* Atmospheric swirls */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white/30 blur-xl"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${80 + Math.random() * 160}px`,
                        height: `${60 + Math.random() * 120}px`,
                        animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 4}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mineral deposit glow */}
          <div
            className="absolute"
            style={{
              left: "50%",
              bottom: "25%",
              transform: "translate(-50%, 0)",
              zIndex: 10,
            }}
          >
            <div
              className={`w-24 h-24 rounded-full ${config.color} opacity-40 blur-2xl ${extracting ? "animate-pulse" : ""}`}
            />
          </div>

          {/* Tool/Automaton Visualization */}
          <div className="absolute inset-0 flex items-end justify-center pb-16">
            {/* Rover with tool */}
            {isRoverBased && (
              <div className="relative" style={{ zIndex: 20 }}>
                {/* Rover body - larger version */}
                <svg width="200" height="100" viewBox="0 0 200 100" className="drop-shadow-2xl">
                  {/* Body */}
                  <rect x="35" y="35" width="130" height="45" fill="#ff3c1a" rx="8" />
                  {/* Solar panels */}
                  <rect x="10" y="20" width="38" height="68" fill="#18dda1" rx="3" />
                  <rect x="152" y="20" width="38" height="68" fill="#18dda1" rx="3" />
                  {/* Wheels */}
                  <circle cx="50" cy="88" r="12" fill="#333" stroke="#666" strokeWidth="3" />
                  <circle cx="100" cy="88" r="12" fill="#333" stroke="#666" strokeWidth="3" />
                  <circle cx="150" cy="88" r="12" fill="#333" stroke="#666" strokeWidth="3" />
                  {/* Wheel details */}
                  <circle cx="50" cy="88" r="4" fill="#666" />
                  <circle cx="100" cy="88" r="4" fill="#666" />
                  <circle cx="150" cy="88" r="4" fill="#666" />
                  {/* Antenna */}
                  <line x1="158" y1="35" x2="175" y2="15" stroke="#fff" strokeWidth="4" />
                  <circle cx="175" cy="15" r="4" fill="#ff3c1a" />
                  {/* Tool attachment */}
                  {config.tool === "drill" && (
                    <>
                      <rect x="25" y="58" width="12" height="32" fill="#666" rx="2" />
                      <rect
                        x="28"
                        y="82"
                        width="6"
                        height="18"
                        fill="#999"
                        className={extracting ? "animate-bounce" : ""}
                        style={{ transformOrigin: "center" }}
                      />
                      {/* Drill particles */}
                      {extracting && (
                        <g>
                          <circle cx="31" cy="95" r="2" fill={config.color.replace("bg-", "#")} opacity="0.8">
                            <animate attributeName="cy" from="95" to="105" dur="0.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.8" to="0" dur="0.5s" repeatCount="indefinite" />
                          </circle>
                        </g>
                      )}
                    </>
                  )}
                  {config.tool === "scoop" && (
                    <path
                      d="M 25 65 L 15 85 Q 15 92 25 92 L 42 92 Q 50 92 50 85 L 42 65 Z"
                      fill="#999"
                      className={extracting ? "animate-bounce" : ""}
                    />
                  )}
                  {/* Headlights */}
                  <circle cx="35" cy="42" r="5" fill="#ffff00" opacity={extracting ? "1" : "0.6"} />
                  <circle cx="35" cy="58" r="5" fill="#ffff00" opacity={extracting ? "1" : "0.6"} />
                  {/* Details on body */}
                  <rect x="42" y="42" width="22" height="6" fill="#fff" />
                  <rect x="70" y="42" width="22" height="6" fill="#fff" />
                  <rect x="98" y="42" width="22" height="6" fill="#fff" />
                </svg>

                {/* Extraction particles */}
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className={`absolute w-2 h-2 rounded-full ${config.color}`}
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      animation: "rise 1.5s ease-out forwards",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Satellite */}
            {isSatelliteBased && (
              <div className="relative" style={{ zIndex: 20 }}>
                <svg width="180" height="140" viewBox="0 0 180 140" className="drop-shadow-2xl">
                  {/* Main body */}
                  <rect x="60" y="45" width="60" height="50" fill="#2d5f7a" rx="5" />
                  {/* Solar panels */}
                  <rect x="10" y="25" width="45" height="90" fill="#18dda1" rx="3" />
                  <rect x="125" y="25" width="45" height="90" fill="#18dda1" rx="3" />
                  {/* Panel details */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <g key={i}>
                      <line x1="10" y1={30 + i * 10} x2="55" y2={30 + i * 10} stroke="#0d6e5e" strokeWidth="1.5" />
                      <line x1="125" y1={30 + i * 10} x2="170" y2={30 + i * 10} stroke="#0d6e5e" strokeWidth="1.5" />
                    </g>
                  ))}
                  {/* Antenna */}
                  <line x1="90" y1="45" x2="90" y2="20" stroke="#fff" strokeWidth="3" />
                  <circle cx="90" cy="20" r="5" fill="#ff3c1a" />
                  {/* Sensor dish */}
                  <ellipse cx="90" cy="105" rx="20" ry="10" fill="#4d94ff" opacity="0.7" />
                  <ellipse cx="90" cy="105" rx="14" ry="7" fill="#80b3ff" opacity="0.9" />
                  {/* Windows/sensors */}
                  <circle cx="80" cy="60" r="5" fill="#4d94ff" opacity={extracting ? "1" : "0.6"} />
                  <circle cx="100" cy="60" r="5" fill="#4d94ff" opacity={extracting ? "1" : "0.6"} />
                  <rect x="75" y="72" width="30" height="14" fill="#4d94ff" opacity="0.8" />
                </svg>

                {/* Scanning beam effect */}
                {extracting && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 h-48">
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-cyan-400/50 via-cyan-400/25 to-transparent"
                      style={{
                        clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-4 z-30">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/30 space-y-2">
              <div className="flex items-center gap-3">
                <div className={`${config.color} p-2 rounded-lg`}>
                  <MineralIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{mineralType}</h3>
                  <p className="text-sm text-gray-300">
                    {typeof window !== "undefined" && location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>Purity: {purity.toFixed(0)}%</span>
                <span>•</span>
                <span>Qty: {quantity} units</span>
              </div>
            </div>

            <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/30">
              <p className="text-sm text-gray-300">
                {isRoverBased ? `Rover: ${roverName || "Unknown"}` : "Satellite Analysis"}
              </p>
              <p className="text-xs text-gray-400">{toolNames[config.tool as keyof typeof toolNames]}</p>
            </div>
          </div>

          {/* Progress overlay */}
          {extracting && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-border/30 z-30">
              <div className="flex items-center justify-between text-sm text-white mb-2">
                <span>Extracting {mineralType}...</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}
        </div>

        {/* Rewards Section */}
        {extracted && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Extraction Complete!</h3>
                <p className="text-sm text-muted-foreground">Resources added to inventory</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-background/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Resource</p>
                <p className="text-sm font-semibold text-foreground">{mineralType}</p>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="text-sm font-semibold text-foreground">{quantity} units</p>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Purity</p>
                <p className="text-sm font-semibold text-foreground">{purity.toFixed(0)}%</p>
              </div>
              <div className="bg-background/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-semibold text-foreground capitalize">{projectType}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">Returning to base in 3 seconds...</p>
          </div>
        )}

        {/* Action Button */}
        {!extracted && !extracting && (
          <Button onClick={handleExtract} className="w-full flex-shrink-0" size="lg">
            {isRoverBased ? <Drill className="w-5 h-5 mr-2" /> : <Satellite className="w-5 h-5 mr-2" />}
            Begin Extraction
          </Button>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        @keyframes rise {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
};