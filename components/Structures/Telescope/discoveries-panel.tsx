"use client"

import type { Anomaly, DiscoveryPanelPosition, Mission, Project } from "@/types/Structures/telescope"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ChevronUp, ChevronDown, Grid3X3 } from "lucide-react"
import { projects } from "@/data/projects"

interface DiscoveriesPanelProps {
  discoveryPanelPosition: DiscoveryPanelPosition
  toggleDiscoveryPanel: () => void
  classifiedAnomalies: Anomaly[]
  projectMissions: Mission[]
  selectedProject: Project | null
}

export function DiscoveriesPanel({
  discoveryPanelPosition,
  toggleDiscoveryPanel,
  classifiedAnomalies,
  projectMissions,
  selectedProject,
}: DiscoveriesPanelProps) {
  if (discoveryPanelPosition === "hidden") return null

  return (
    <div
      className={`absolute left-0 right-0 z-10 bg-[#ECEFF4] border-t border-[#C2C8D2] transition-all duration-500 ${
        discoveryPanelPosition === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        height: "40vh",
        transform:
          discoveryPanelPosition === "bottom" ? "translateY(calc(100% - 60px))" : "translateY(calc(-100% + 60px))",
      }}
    >
      {/* Panel Handle */}
      <div
        className={`w-full h-15 bg-[#E5E9F0] border-b border-[#C2C8D2] flex items-center justify-center cursor-pointer hover:bg-[#D8DEE9] ${
          discoveryPanelPosition === "top" ? "order-last" : ""
        }`}
        onClick={toggleDiscoveryPanel}
      >
        <div className="flex items-center gap-2 text-sm text-[#4C566A]">
          <Grid3X3 className="h-4 w-4" />
          <span>Discoveries & Missions</span>
          {discoveryPanelPosition === "bottom" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Classified Anomalies */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2E3440]">
              <CheckCircle2 className="h-5 w-5 text-[#5E81AC]" />
              Classified Anomalies
            </h3>

            {classifiedAnomalies.filter((a) => !selectedProject || a.project === selectedProject.id).length === 0 ? (
              <p className="text-[#4C566A]">No anomalies classified yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {classifiedAnomalies
                  .filter((a) => !selectedProject || a.project === selectedProject.id)
                  .slice(0, 12) // Limit to prevent too many cards
                  .map((anomaly) => {
                    const project = projects.find((p) => p.id === anomaly.project)
                    return (
                      <Card
                        key={anomaly.id}
                        className="overflow-hidden hover:shadow-md transition-shadow bg-[#E5E9F0] border-[#C2C8D2]"
                      >
                        <div
                          className="h-3"
                          style={{
                            background: project?.bgGradient || "linear-gradient(to right, #D8DEE9, #C2C8D2)",
                          }}
                        />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm text-[#2E3440]">{anomaly.name}</CardTitle>
                            <Badge variant="outline" className="text-xs border-[#C2C8D2] text-[#4C566A]">
                              {anomaly.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs text-[#4C566A]">
                            {anomaly.sector} • {anomaly.discoveryDate}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Available Missions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2E3440]">
              <Clock className="h-5 w-5 text-[#5E81AC]" />
              Available Missions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectMissions.map((mission) => {
                const project = projects.find((p) => p.id === mission.project)
                return (
                  <Card
                    key={mission.id}
                    className={`${
                      mission.completed ? "opacity-70" : ""
                    } hover:shadow-md transition-shadow bg-[#E5E9F0] border-[#C2C8D2]`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              background: project?.bgGradient || "linear-gradient(to right, #D8DEE9, #C2C8D2)",
                            }}
                          >
                            {mission.icon}
                          </div>
                          <CardTitle className="text-base text-[#2E3440]">{mission.title}</CardTitle>
                        </div>
                        <Badge
                          variant={
                            mission.difficulty === "easy"
                              ? "outline"
                              : mission.difficulty === "medium"
                                ? "secondary"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {mission.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-[#4C566A]">{mission.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-[#4C566A]">
                          {project?.icon}
                          <span>{project?.name}</span>
                        </div>
                        <div className="font-medium text-[#5E81AC]">{mission.reward}</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
