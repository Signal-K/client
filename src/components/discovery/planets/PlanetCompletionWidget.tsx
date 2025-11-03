"use client"

import React, { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Progress } from "@/src/components/ui/progress"
import { Card } from "@/src/components/ui/card"
import { Loader2, Globe } from "lucide-react"

type PlanetType = "Terrestrial" | "Gaseous" | "Habitable" | "Unsurveyed"

interface PlanetCompletion {
  classificationId: number
  planetName: string
  anomalyId: number
  planetType: PlanetType
  isComplete: boolean
  completionSteps: {
    discovered: boolean // Step 1: Classification exists
    surveyed: boolean // Step 2: Has stats (radius, density, etc)
    typeConfirmed: boolean // Planet type determined
    cloudsOrDepositsFound: boolean // Step 3: Has clouds OR mineral deposits
    waterFound: boolean // Step 4: Has liquid water (only required for potentially habitable terrestrial)
  }
  completionPercentage: number
  requiresWater: boolean // True for terrestrial planets in habitable temperature range
}

export default function PlanetCompletionWidget() {
  const supabase = useSupabaseClient()
  const session = useSession()

  const [planets, setPlanets] = useState<PlanetCompletion[]>([])
  const [selectedPlanetId, setSelectedPlanetId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    fetchPlanetCompletions()
  }, [session?.user?.id])

  const fetchPlanetCompletions = async () => {
    if (!session?.user?.id) return

    try {
      // Fetch all user's planet classifications with anomaly data
      const { data: planetClassifications, error: classError } = await supabase
        .from("classifications")
        .select(`
          id,
          anomaly:anomalies (
            id,
            content,
            radius,
            density,
            mass,
            gravity,
            temperature,
            orbital_period
          )
        `)
        .eq("author", session.user.id)
        .eq("classificationtype", "planet")

      if (classError) {
        console.error("Error fetching planet classifications:", classError)
        setLoading(false)
        return
      }

      if (!planetClassifications || planetClassifications.length === 0) {
        setLoading(false)
        return
      }

      // Calculate completion for each planet
      const completions: PlanetCompletion[] = await Promise.all(
        planetClassifications.map(async (classification: any) => {
          const anomalyId = classification.anomaly?.id
          const planetName = classification.anomaly?.content || `Planet ${classification.id}`

          // Step 1: Discovered (classification exists - always true if we're here)
          const discovered = true

          // Step 2: Surveyed (has density - the key stat for type determination)
          const density = classification.anomaly?.density
          const temperature = classification.anomaly?.temperature
          const surveyed = Boolean(density)

          // Determine planet type based on density
          let planetType: PlanetType = "Unsurveyed"
          let requiresWater = false
          
          if (surveyed && density != null) {
            // Density thresholds (g/cm³):
            // Gaseous planets: < 2.5 g/cm³
            // Terrestrial planets: >= 2.5 g/cm³
            if (density < 2.5) {
              planetType = "Gaseous"
            } else {
              // Terrestrial planet
              // Check if it's in the habitable temperature range (-15°C to 50°C)
              if (temperature != null && temperature >= -15 && temperature <= 50) {
                planetType = "Habitable" // Potentially habitable
                requiresWater = true // Must find water to complete
              } else {
                planetType = "Terrestrial"
              }
            }
          }

          const typeConfirmed = planetType !== "Unsurveyed"

          // Step 3: Check for clouds OR mineral deposits (either one counts)
          const { data: cloudData } = await supabase
            .from("classifications")
            .select("id")
            .eq("author", session.user.id)
            .in("classificationtype", ["satellite-planetFour", "cloud"])
            .eq("classificationConfiguration->>parentPlanetLocation", String(anomalyId))
            .limit(1)

          const cloudsFound = Boolean(cloudData && cloudData.length > 0)

          const { data: mineralData } = await supabase
            .from("mineralDeposits")
            .select("id")
            .eq("owner", session.user.id)
            .eq("anomaly", anomalyId)
            .limit(1)

          const mineralsFound = Boolean(mineralData && mineralData.length > 0)
          const cloudsOrDepositsFound = cloudsFound || mineralsFound

          // Step 4: Water found (only check for potentially habitable planets)
          let waterFound = false
          if (requiresWater) {
            const { data: waterData } = await supabase
              .from("mineralDeposits")
              .select("id, mineralconfiguration")
              .eq("owner", session.user.id)
              .eq("anomaly", anomalyId)

            // Check if any deposit contains water-related minerals
            waterFound = Boolean(
              waterData && 
              waterData.some((deposit: any) => {
                const config = deposit.mineralconfiguration
                const type = config?.type?.toLowerCase() || ""
                return type.includes("water") || type.includes("ice") || type.includes("h2o")
              })
            )
          }

          // Determine if planet is complete
          let isComplete = false
          if (typeConfirmed && cloudsOrDepositsFound) {
            if (requiresWater) {
              // Potentially habitable terrestrial - needs water to be complete
              isComplete = waterFound
            } else {
              // Gaseous or non-habitable terrestrial - just needs clouds/deposits
              isComplete = true
            }
          }

          // Calculate completion percentage based on required steps
          let totalSteps: boolean[]
          if (requiresWater) {
            // Potentially habitable terrestrial: discovered, surveyed, type confirmed, clouds/deposits, water
            totalSteps = [discovered, surveyed, typeConfirmed, cloudsOrDepositsFound, waterFound]
          } else {
            // Gaseous or non-habitable terrestrial: discovered, surveyed, type confirmed, clouds/deposits
            totalSteps = [discovered, surveyed, typeConfirmed, cloudsOrDepositsFound]
          }
          
          const completedSteps = totalSteps.filter(Boolean).length
          const completionPercentage = (completedSteps / totalSteps.length) * 100

          return {
            classificationId: classification.id,
            planetName,
            anomalyId,
            planetType,
            isComplete,
            completionSteps: {
              discovered,
              surveyed,
              typeConfirmed,
              cloudsOrDepositsFound,
              waterFound,
            },
            completionPercentage,
            requiresWater,
          }
        })
      )

      // Sort by completion percentage (highest first)
      completions.sort((a, b) => b.completionPercentage - a.completionPercentage)

      setPlanets(completions)
      
      // Set the most complete planet as default
      if (completions.length > 0) {
        setSelectedPlanetId(completions[0].classificationId)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error calculating planet completions:", error)
      setLoading(false)
    }
  }

  const selectedPlanet = planets.find(p => p.classificationId === selectedPlanetId)

  if (!session?.user?.id) {
    return null
  }

  if (loading) {
    return (
      <Card className="p-4 bg-[#1e2a3a]/80 border-[#2c4f64]">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#5fcbc3]" />
          <span className="text-sm text-[#b8c5d6]">Loading planets...</span>
        </div>
      </Card>
    )
  }

  if (planets.length === 0) {
    return (
      <Card className="p-4 bg-[#1e2a3a]/80 border-[#2c4f64]">
        <div className="flex items-center gap-2 text-[#b8c5d6]">
          <Globe className="h-4 w-4" />
          <span className="text-sm">No planets discovered yet</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-[#1e2a3a]/80 border-[#2c4f64]">
      <div className="flex items-center gap-4">
        {/* Planet Icon */}
        <div className="flex-shrink-0">
          <Globe className="h-6 w-6 text-[#5fcbc3]" />
        </div>

        {/* Planet Selector */}
        <div className="flex-shrink-0 w-48">
          <Select
            value={selectedPlanetId?.toString() || ""}
            onValueChange={(value) => setSelectedPlanetId(Number(value))}
          >
            <SelectTrigger className="h-9 bg-[#2c4f64]/50 border-[#5fcbc3]/30 text-[#e4f4f4]">
              <SelectValue placeholder="Select a planet" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e2a3a] border-[#2c4f64]">
              {planets.map((planet) => (
                <SelectItem
                  key={planet.classificationId}
                  value={planet.classificationId.toString()}
                  className="text-[#e4f4f4] focus:bg-[#2c4f64]/50 focus:text-[#5fcbc3]"
                >
                  {planet.planetName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Bar and Percentage */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Progress
              value={selectedPlanet?.completionPercentage || 0}
              className="h-2 bg-[#2c4f64]/30"
            />
            <span className="text-sm font-semibold text-[#5fcbc3] whitespace-nowrap">
              {Math.round(selectedPlanet?.completionPercentage || 0)}%
            </span>
          </div>

          {/* Planet Type Badge */}
          {selectedPlanet && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedPlanet.planetType === "Habitable" 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : selectedPlanet.planetType === "Terrestrial"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : selectedPlanet.planetType === "Gaseous"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}>
                {selectedPlanet.planetType}
              </span>
              {selectedPlanet.isComplete && (
                <span className="text-xs text-[#5fcbc3] font-semibold">✓ Complete</span>
              )}
            </div>
          )}

          {/* Completion Steps Indicator */}
          {selectedPlanet && (
            <div className="mt-2 flex gap-1.5">
              <StepIndicator
                completed={selectedPlanet.completionSteps.discovered}
                label="Discovered"
              />
              <StepIndicator
                completed={selectedPlanet.completionSteps.surveyed}
                label="Surveyed"
              />
              <StepIndicator
                completed={selectedPlanet.completionSteps.typeConfirmed}
                label="Type Confirmed"
              />
              <StepIndicator
                completed={selectedPlanet.completionSteps.cloudsOrDepositsFound}
                label="Clouds/Deposits"
              />
              {selectedPlanet.requiresWater && (
                <StepIndicator
                  completed={selectedPlanet.completionSteps.waterFound}
                  label="Water Found"
                  required={true}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

interface StepIndicatorProps {
  completed: boolean
  label: string
  required?: boolean
}

function StepIndicator({ completed, label, required = false }: StepIndicatorProps) {
  return (
    <div
      className="group relative"
      title={`${label}: ${completed ? "Complete" : "Incomplete"}${required ? " (Required for completion)" : ""}`}
    >
      <div
        className={`h-1.5 w-8 rounded-full transition-colors ${
          completed 
            ? "bg-[#5fcbc3]" 
            : required 
            ? "bg-orange-500/50"
            : "bg-[#2c4f64]/50"
        }`}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
        <div className="bg-[#1e2a3a] border border-[#2c4f64] rounded px-2 py-1 text-xs text-[#e4f4f4] whitespace-nowrap">
          {label}
          {required && <span className="text-orange-400 ml-1">(Required)</span>}
        </div>
      </div>
    </div>
  )
}
