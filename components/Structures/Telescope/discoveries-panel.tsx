"use client"

import type { Anomaly, DiscoveryPanelPosition, Mission, Project } from "@/types/Structures/telescope"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { projects } from "@/data/projects";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Calendar, User } from "lucide-react"

interface DiscoveriesPanelProps {
  classifications: any[]
  anomalies: Anomaly[]
  onViewAnomaly: (anomaly: Anomaly) => void
  showAllDiscoveries: boolean
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void
};

export function DiscoveriesPanel({
  classifications = [],
  anomalies = [],
  onViewAnomaly,
  showAllDiscoveries,
  onNavigate,
}: DiscoveriesPanelProps) {
  const convertClassificationsToAnomalies = (classificationData: any[]): Anomaly[] => {
    // Ensure classificationData is an array
    if (!Array.isArray(classificationData)) {
      return []
    }

    return classificationData.map((classification) => {
      const dbAnomalyId = `db-${classification.anomaly}`
      const anomaly = anomalies.find((a) => a.id === dbAnomalyId)

      if (anomaly) {
        return {
          ...anomaly,
          classified: true,
          discoveryDate: new Date(classification.created_at).toLocaleDateString(),
          classificationId: classification.id,
          classificationContent: classification.content,
          discoveredBy: showAllDiscoveries ? `User${classification.author?.slice(-4)}` : undefined,
        }
      }

      const classificationTypeMap: Record<string, Anomaly["type"]> = {
        planet: "exoplanet",
        sunspot: "sunspot",
        asteroid: "asteroid",
        DiskDetective: "accretion_disc",
      }

      const projectMap: Record<Anomaly["type"], string> = {
        exoplanet: "planet-hunters",
        sunspot: "sunspots",
        asteroid: "daily-minor-planet",
        accretion_disc: "disk-detective",
      }

      const anomalyType = classificationTypeMap[classification.classificationtype] || "exoplanet"
      const anomalyProject = projectMap[anomalyType] || "planet-hunters"

      return {
        id: `classification-${classification.id}`,
        name: `ANOMALY-${classification.anomaly}`,
        type: anomalyType,
        project: anomalyProject,
        x: 50,
        y: 50,
        brightness: 1,
        size: 1,
        color: "#4FC3F7",
        sector: "Unknown Sector",
        shape: "circle" as const,
        pulseSpeed: 2,
        glowIntensity: 0.5,
        classified: true,
        discoveryDate: new Date(classification.created_at).toLocaleDateString(),
        classificationId: classification.id,
        classificationContent: classification.content,
        discoveredBy: showAllDiscoveries ? `User${classification.author?.slice(-4)}` : undefined,
      } as Anomaly & { classificationId: number; classificationContent: string; discoveredBy?: string }
    })
  }

  const classifiedAnomalies = convertClassificationsToAnomalies(classifications)

  return (
    <div className="absolute top-20 left-4 w-80 bg-gradient-to-br from-[#3B4252] to-[#2E3440] border-2 border-[#5E81AC] rounded-lg shadow-2xl z-30">
      <div className="p-4 border-b border-[#4C566A]">
        <h3 className="text-lg font-bold text-[#ECEFF4] mb-2">Recent Discoveries</h3>

        {/* Navigation Controls */}
        {onNavigate && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <Button
                size="sm"
                onClick={() => onNavigate("up")}
                className="bg-[#434C5E] hover:bg-[#4C566A] text-white p-2"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                size="sm"
                onClick={() => onNavigate("left")}
                className="bg-[#434C5E] hover:bg-[#4C566A] text-white p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-[#5E81AC] rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <Button
                size="sm"
                onClick={() => onNavigate("right")}
                className="bg-[#434C5E] hover:bg-[#4C566A] text-white p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                size="sm"
                onClick={() => onNavigate("down")}
                className="bg-[#434C5E] hover:bg-[#4C566A] text-white p-2"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div></div>
            </div>
          </div>
        )}

        <Badge className="bg-[#A3BE8C] text-[#2E3440]">{classifiedAnomalies.length} Classified</Badge>
      </div>

      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {classifiedAnomalies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#D8DEE9] text-sm">No discoveries yet</p>
            <p className="text-[#88C0D0] text-xs mt-1">Start exploring to find anomalies!</p>
          </div>
        ) : (
          classifiedAnomalies.slice(0, 10).map((anomaly) => {
            const project = projects.find((p) => p.id === anomaly.project)
            return (
              <Card
                key={anomaly.id}
                className="bg-[#3B4252] border-[#4C566A] hover:border-[#5E81AC] transition-colors cursor-pointer"
                onClick={() => onViewAnomaly(anomaly)}
              >
                <CardHeader className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ background: project?.bgGradient }}
                    >
                      <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xs text-[#ECEFF4]">{anomaly.name}</CardTitle>
                      <CardDescription className="text-xs text-[#D8DEE9]">{anomaly.sector}</CardDescription>
                    </div>
                    <Button size="sm" className="bg-[#5E81AC] hover:bg-[#81A1C1] text-white p-1">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-[#88C0D0]">
                      <Calendar className="h-3 w-3" />
                      <span>{anomaly.discoveryDate}</span>
                    </div>
                    {showAllDiscoveries && (anomaly as any).discoveredBy && (
                      <div className="flex items-center gap-1 text-[#B48EAD]">
                        <User className="h-3 w-3" />
                        <span>{(anomaly as any).discoveredBy}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
};