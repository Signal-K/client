"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Drill, Satellite, Droplet, Snowflake, Gem, Beaker, MapPin, ChevronRight } from "lucide-react"
import { getMineralDisplayName } from "@/src/utils/mineralAnalysis"

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
  }
}

interface MineralDepositProps {
  id: number
  mineralConfiguration: MineralConfiguration
  location?: string
  discoveryId?: number
  roverName?: string
  projectType: "P4" | "cloudspotting" | "JVH" | "AI4M"
  onExtract?: () => void
  hasRoverExtraction?: boolean
  hasSatelliteExtraction?: boolean
}

const mineralConfig = {
  "Iron Oxide": { color: "bg-red-600", icon: Gem, difficulty: "moderate" },
  Silicate: { color: "bg-amber-500", icon: Gem, difficulty: "easy" },
  Carbonates: { color: "bg-gray-400", icon: Gem, difficulty: "moderate" },
  Sulfates: { color: "bg-yellow-400", icon: Gem, difficulty: "easy" },
  "Hydrated Minerals": { color: "bg-blue-400", icon: Droplet, difficulty: "hard" },
  Olivine: { color: "bg-green-600", icon: Gem, difficulty: "hard" },
  Pyroxene: { color: "bg-emerald-700", icon: Gem, difficulty: "moderate" },
  dust: { color: "bg-orange-300", icon: Beaker, difficulty: "easy" },
  soil: { color: "bg-amber-700", icon: Beaker, difficulty: "easy" },
  "water-vapour": { color: "bg-cyan-300", icon: Droplet, difficulty: "moderate" },
  "water-ice": { color: "bg-blue-300", icon: Snowflake, difficulty: "moderate" },
  "co2-ice": { color: "bg-slate-300", icon: Snowflake, difficulty: "moderate" },
  "metallic-hydrogen": { color: "bg-purple-500", icon: Beaker, difficulty: "hard" },
  "metallic-helium": { color: "bg-indigo-400", icon: Beaker, difficulty: "hard" },
  methane: { color: "bg-orange-400", icon: Beaker, difficulty: "moderate" },
  ammonia: { color: "bg-teal-400", icon: Beaker, difficulty: "moderate" },
}

const difficultyColors = {
  easy: "bg-green-500",
  moderate: "bg-yellow-500",
  hard: "bg-red-500",
}

export function MineralExtraction({
  id,
  mineralConfiguration,
  location,
  discoveryId,
  roverName,
  projectType,
  hasRoverExtraction = false,
  hasSatelliteExtraction = false,
}: MineralDepositProps) {
  const router = useRouter()

  // Normalize mineral type from DB row. The `mineralConfiguration` can come in
  // various shapes depending on source: { type }, { mineralType }, or nested.
  const rawType = (mineralConfiguration as any).type || (mineralConfiguration as any).mineralType || "unknown"

  // Prefer a human-friendly name when available (AI4M analysis exports canonical types)
  let displayName = String(rawType)
  try {
    if ((mineralConfiguration as any).mineralType) {
      displayName = getMineralDisplayName((mineralConfiguration as any).mineralType)
    } else if ((mineralConfiguration as any).type) {
      displayName = String((mineralConfiguration as any).type)
    }
  } catch (e) {
    displayName = String(rawType)
  }

  // Find matching key in mineralConfig by normalizing names
  const normalizeKey = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const matchedKey = Object.keys(mineralConfig).find((k) => normalizeKey(k) === normalizeKey(displayName) || normalizeKey(k) === normalizeKey(rawType))

  const config = (matchedKey ? (mineralConfig as any)[matchedKey] : null) || {
    color: "bg-gray-500",
    icon: Gem,
    difficulty: "moderate",
  }

  // Normalize quantity: accept amount, quantity, or estimatedQuantity (categorical)
  let quantity = 0
  if ((mineralConfiguration as any).amount) {
    quantity = (mineralConfiguration as any).amount as number
  } else if ((mineralConfiguration as any).quantity) {
    quantity = (mineralConfiguration as any).quantity as number
  } else if ((mineralConfiguration as any).estimatedQuantity) {
    const q = (mineralConfiguration as any).estimatedQuantity as string
    const map: Record<string, number> = { trace: 10, small: 30, moderate: 60, large: 120, abundant: 240 }
    quantity = map[q] || 0
  }

  // Normalize purity to 0-100 percentage
  let purity = 0
  if (typeof (mineralConfiguration as any).purity === "number") {
    const p = (mineralConfiguration as any).purity as number
    purity = p > 1 ? p : p * 100
  }

  // Rover-based only for AI4M (rover surveys). P4 is satellite-based.
  const isRoverBased = projectType === "AI4M"
  const isSatelliteBased = projectType === "P4" || projectType === "cloudspotting" || projectType === "JVH"

  const MineralIcon = config.icon || Gem

  const mapDifficulty = (d: any) => {
    const sd = String(d || "").toLowerCase()
    if (sd === "easy" || sd === "moderate" || sd === "hard") return sd as keyof typeof difficultyColors
    if (sd === "difficult" || sd === "extreme") return "hard" as keyof typeof difficultyColors
    return "moderate" as keyof typeof difficultyColors
  }

  const difficultyKey = mapDifficulty(config.difficulty)
  const difficultyLabel = String(config.difficulty || difficultyKey)

  const handleExtract = () => {
    // Check if user has the required extraction research
    if (isRoverBased && !hasRoverExtraction) {
      router.push("/research")
      return
    }
    if (isSatelliteBased && !hasSatelliteExtraction) {
      router.push("/research")
      return
    }
    
    router.push(`/extraction/${id}`)
  }

  const handleViewDiscovery = () => {
    if (discoveryId) {
      router.push(`/posts/${discoveryId}`)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`${config.color} p-3 rounded-lg shadow-md flex-shrink-0`}>
              <MineralIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl line-clamp-1">{displayName}</CardTitle>
                <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                  {projectType}
                </Badge>
              </div>
              {typeof window !== "undefined" && location && (
                <CardDescription className="flex items-center gap-1 text-xs line-clamp-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{location}</span>
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-shrink-0 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Purity</p>
            <p className="font-semibold">{purity.toFixed(0)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Quantity</p>
            <p className="font-semibold text-xs line-clamp-2">{quantity} units</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Difficulty</p>
            <Badge className={`${difficultyColors[difficultyKey]} text-white text-xs capitalize`}>
              {difficultyLabel}
            </Badge>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm min-w-0">
            {isRoverBased ? <Drill className="w-4 h-4 text-primary flex-shrink-0" /> : <Satellite className="w-4 h-4 text-primary flex-shrink-0" />}
            <span className="font-medium line-clamp-1">
              {isRoverBased ? `Rover: ${roverName || "Unknown"}` : "Satellite Analysis"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{isRoverBased ? "Surface Mining" : "Remote Sensing"}</p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 mt-auto flex-shrink-0">
        <Button onClick={handleExtract} className="flex-1" size="sm">
          {isRoverBased ? <Drill className="w-4 h-4 mr-2" /> : <Satellite className="w-4 h-4 mr-2" />}
          {(isRoverBased && !hasRoverExtraction) || (isSatelliteBased && !hasSatelliteExtraction) 
            ? "Research Extraction" 
            : "Extract"}
        </Button>
        {discoveryId && (
          <Button variant="outline" size="sm" onClick={handleViewDiscovery}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
