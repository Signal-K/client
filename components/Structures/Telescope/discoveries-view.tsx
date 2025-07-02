"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Clock, Eye, SpaceIcon as Planet, Sun, Asterisk, Disc } from "lucide-react"
import type { Anomaly, Mission, Project } from "@/types/Structures/telescope";
import { projects } from "@/data/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface DiscoveriesViewProps {
  classifications: any[]
  allClassifications: any[]
  projectMissions: Mission[]
  selectedProject: Project | null
  onBack: () => void
  onViewAnomaly: (anomaly: Anomaly) => void
  showAllDiscoveries: boolean
  anomalies: Anomaly[] 
};

export function DiscoveriesView({
  classifications,
  allClassifications,
  projectMissions,
  selectedProject,
  onBack,
  onViewAnomaly,
  showAllDiscoveries,
  anomalies,
}: DiscoveriesViewProps) {
  const convertClassificationsToAnomalies = (classificationData: any[]): Anomaly[] => {
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
        "DiskDetective": "accretion_disc",
        "active-asteroid": "asteroid",
        "telescope-minorPlanet": "asteroid",
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

  const displayClassifications = showAllDiscoveries ? allClassifications : classifications
  const classifiedAnomalies = convertClassificationsToAnomalies(displayClassifications)
  const filteredAnomalies = classifiedAnomalies.filter((a) => !selectedProject || a.project === selectedProject.id)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "exoplanet":
        return <Planet className="h-4 w-4" />
      case "sunspot":
        return <Sun className="h-4 w-4" />
      case "asteroid":
        return <Asterisk className="h-4 w-4" />
      case "accretion_disc":
        return <Disc className="h-4 w-4" />
      default:
        return <Planet className="h-4 w-4" />
    };
  };

  const getAnomalyTypeLabel = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "Planet"
      case "sunspot":
        return "Sunspot"
      case "asteroid":
        return "Asteroid"
      case "accretion_disc":
        return "Accretion Disc"
      default:
        return type
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E3440] via-[#3B4252] to-[#434C5E] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button onClick={onBack} className="bg-[#5E81AC] text-white hover:bg-[#81A1C1]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Telescope
            </Button>
            <h1 className="text-2xl font-bold text-[#ECEFF4]">Discovery Archive</h1>
            <Badge className="bg-[#EBCB8B] text-[#2E3440]">
              {showAllDiscoveries ? "All Users" : "Your Discoveries"}
            </Badge>
          </div>

          {selectedProject && (
            <div className="bg-gradient-to-r from-[#3B4252] to-[#434C5E] border border-[#5E81AC] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ background: selectedProject.bgGradient }}
                >
                  {selectedProject.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#ECEFF4]">{selectedProject.name}</h2>
                  <p className="text-[#D8DEE9] text-sm">{selectedProject.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#ECEFF4]">
              <CheckCircle2 className="h-5 w-5 text-[#88C0D0]" />
              Classified Discoveries ({filteredAnomalies.length})
            </h3>

            {filteredAnomalies.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#3B4252] to-[#434C5E] border-[#5E81AC] text-center p-6">
                <p className="text-[#D8DEE9]">No discoveries yet.</p>
                <p className="text-[#D8DEE9] text-sm mt-1">Explore the telescope to find anomalies!</p>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredAnomalies.map((anomaly) => {
                  const project = projects.find((p) => p.id === anomaly.project)
                  const isOtherUser = showAllDiscoveries && "discoveredBy" in anomaly && anomaly.discoveredBy

                  return (
                    <Card
                      key={anomaly.id}
                      className="bg-gradient-to-r from-[#3B4252] to-[#434C5E] border-[#4C566A] hover:border-[#5E81AC] transition-colors"
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ background: project?.bgGradient }}
                            >
                              {getAnomalyIcon(anomaly.type)}
                            </div>
                            <div>
                              <CardTitle className="text-sm text-[#ECEFF4] flex items-center gap-2">
                                {anomaly.name}
                              </CardTitle>
                              <CardDescription className="text-xs text-[#D8DEE9] flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-[#5E81AC] text-[#88C0D0]">
                                  {(anomaly as any)?.dbData?.anomalySet || getAnomalyTypeLabel(anomaly.type)}
                                </Badge>
                                <span>•</span>
                                <span>{anomaly.sector}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onViewAnomaly(anomaly)}
                            className="bg-[#5E81AC] text-white hover:bg-[#81A1C1]"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#D8DEE9] mt-2">
                          <span>Classified: {anomaly.discoveryDate}</span>
                          <span>{project?.name}</span>
                        </div>
                        {(anomaly as any).classificationContent && (
                          <div className="text-xs text-[#D8DEE9] mt-2 p-2 bg-[#2E3440] rounded">
                            {(anomaly as any).classificationContent}
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#ECEFF4]">
              <Clock className="h-5 w-5 text-[#EBCB8B]" />
              Active Missions ({availableMissions.length})
            </h3>

            {availableMissions.length === 0 ? (
              <Card className="bg-gradient-to-br from-[#3B4252] to-[#434C5E] border-[#5E81AC] text-center p-6">
                <p className="text-[#D8DEE9]">No active missions.</p>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {availableMissions.map((mission) => {
                  const project = projects.find((p) => p.id === mission.project)
                  return (
                    <Card
                      key={mission.id}
                      className="bg-gradient-to-r from-[#3B4252] to-[#434C5E] border-[#4C566A] hover:border-[#EBCB8B] transition-colors"
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: project?.bgGradient }}
                            >
                              {mission.icon}
                            </div>
                            <div>
                              <CardTitle className="text-sm text-[#ECEFF4]">{mission.title}</CardTitle>
                              <CardDescription className="text-xs text-[#D8DEE9]">
                                {mission.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              mission.difficulty === "easy"
                                ? "border-[#A3BE8C] text-[#A3BE8C]"
                                : mission.difficulty === "medium"
                                  ? "border-[#EBCB8B] text-[#EBCB8B]"
                                  : "border-[#BF616A] text-[#BF616A]"
                            }`}
                          >
                            {mission.difficulty}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#D8DEE9] mt-2">
                          <div className="flex items-center gap-1">
                            {project?.icon}
                            <span>{project?.name}</span>
                          </div>
                          <div className="font-medium text-[#88C0D0]">{mission.reward}</div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};