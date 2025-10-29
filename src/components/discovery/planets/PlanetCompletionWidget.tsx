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

interface PlanetCompletion {
  classificationId: number
  planetName: string
  anomalyId: number
  completionSteps: {
    discovered: boolean // Step 1: Classification exists
    surveyed: boolean // Step 2: Has stats (radius, density, etc)
    cloudsFound: boolean // Step 3: Has cloud classifications
    mineralsFound: boolean // Step 4: Has mineral deposits
    waterFound: boolean // Step 5: Has water (not yet implemented)
  }
  completionPercentage: number
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

          // Step 2: Surveyed (has stats from satellite deployment)
          const surveyed = Boolean(
            classification.anomaly?.radius ||
            classification.anomaly?.density ||
            classification.anomaly?.mass ||
            classification.anomaly?.gravity
          )

          // Step 3: Clouds found (satellite-planetFour or cloud classifications)
          const { data: cloudData } = await supabase
            .from("classifications")
            .select("id")
            .eq("author", session.user.id)
            .in("classificationtype", ["satellite-planetFour", "cloud"])
            .eq("classificationConfiguration->>parentPlanetLocation", String(anomalyId))
            .limit(1)

          const cloudsFound = Boolean(cloudData && cloudData.length > 0)

          // Step 4: Minerals found (mineralDeposits for this planet)
          const { data: mineralData } = await supabase
            .from("mineralDeposits")
            .select("id")
            .eq("owner", session.user.id)
            .eq("anomaly", anomalyId)
            .limit(1)

          const mineralsFound = Boolean(mineralData && mineralData.length > 0)

          // Step 5: Water found (not yet implemented)
          const waterFound = false

          // Calculate completion percentage
          const steps = [discovered, surveyed, cloudsFound, mineralsFound, waterFound]
          const completedSteps = steps.filter(Boolean).length
          const completionPercentage = (completedSteps / steps.length) * 100

          return {
            classificationId: classification.id,
            planetName,
            anomalyId,
            completionSteps: {
              discovered,
              surveyed,
              cloudsFound,
              mineralsFound,
              waterFound,
            },
            completionPercentage,
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
                completed={selectedPlanet.completionSteps.cloudsFound}
                label="Clouds"
              />
              <StepIndicator
                completed={selectedPlanet.completionSteps.mineralsFound}
                label="Minerals"
              />
              <StepIndicator
                completed={selectedPlanet.completionSteps.waterFound}
                label="Water"
              />
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
}

function StepIndicator({ completed, label }: StepIndicatorProps) {
  return (
    <div
      className="group relative"
      title={`${label}: ${completed ? "Complete" : "Incomplete"}`}
    >
      <div
        className={`h-1.5 w-8 rounded-full transition-colors ${
          completed ? "bg-[#5fcbc3]" : "bg-[#2c4f64]/50"
        }`}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
        <div className="bg-[#1e2a3a] border border-[#2c4f64] rounded px-2 py-1 text-xs text-[#e4f4f4] whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  )
}
