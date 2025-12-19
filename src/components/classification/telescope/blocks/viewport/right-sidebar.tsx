"use client"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from "@/src/components/ui/card"
import { projects } from "@/src/shared/data/projects"
import { Progress } from "@/src/components/ui/progress"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import type { DatabaseClassification } from "../types"
import { Star, Target, Clock, CheckCircle, AlertCircle, TrendingUp, Eye } from "lucide-react"

interface RightSidebarProps {
  anomalies: any[]
  classifications: any[]
  allClassifications: any[]
  filteredAnomalies: any[]
  availableMissions: any[]
  selectedProject: any | null
  selectedAnomaly: any | null
  getSectorAnomaliesForProject: (projectId: string | null) => any[]
  handleViewClassification: (classification: any) => void
  onClassify?: () => void
}

export function RightSidebar({
  anomalies,
  classifications,
  allClassifications,
  filteredAnomalies,
  availableMissions,
  selectedProject,
  selectedAnomaly,
  getSectorAnomaliesForProject,
  handleViewClassification,
  onClassify,
}: RightSidebarProps) {
  // Calculate statistics
  const totalAnomalies = anomalies.length
  const totalClassified = classifications.length
  const classificationRate = totalAnomalies > 0 ? (totalClassified / totalAnomalies) * 100 : 0

  const recentClassifications = allClassifications.slice(0, 5).map((c) => {
    const anomaly = anomalies.find((a) => a.id === `db-${c.anomaly}`)
    return { ...c, anomalyName: anomaly?.name || `Anomaly ${c.anomaly}` }
  })

  return (
    <div 
      className="hidden lg:flex lg:flex-col lg:w-80 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 80, 102, 0.95)", borderLeft: "1px solid rgba(120, 204, 226, 0.3)" }}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Selected Anomaly Details */}
        {selectedAnomaly && (
          <div 
            className="p-4 border-b flex-shrink-0"
            style={{ 
              borderColor: "rgba(120, 204, 226, 0.3)", 
              background: "linear-gradient(to right, #001a29, #002439)" 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider">SELECTED TARGET</h3>
              <Badge 
                className="text-xs font-mono"
                style={{ backgroundColor: "rgba(120, 204, 226, 0.2)", color: "#78cce2", border: "1px solid rgba(120, 204, 226, 0.3)" }}
              >
                {selectedAnomaly.type?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <div style={{ color: "#78cce2" }} className="text-xs font-mono mb-1">DESIGNATION</div>
                <div style={{ color: "#e4eff0" }} className="font-mono text-sm">{selectedAnomaly.name || `Anomaly ${selectedAnomaly.id}`}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div style={{ color: "#78cce2" }} className="font-mono mb-1">SECTOR</div>
                  <div style={{ color: "#e4eff0" }} className="font-mono">{selectedAnomaly.sector || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ color: "#78cce2" }} className="font-mono mb-1">PROJECT</div>
                  <div style={{ color: "#e4eff0" }} className="font-mono">{selectedAnomaly.project || 'Unknown'}</div>
                </div>
              </div>
              {!selectedAnomaly.classified && onClassify && (
                <button
                  onClick={onClassify}
                  className="w-full py-2 px-3 text-xs font-mono rounded transition-colors"
                  style={{
                    backgroundColor: "rgba(120, 204, 226, 0.2)",
                    color: "#78cce2",
                    border: "1px solid rgba(120, 204, 226, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)";
                  }}
                >
                  CLASSIFY TARGET
                </button>
              )}
              {selectedAnomaly.classified && (
                <div className="text-center py-2">
                  <CheckCircle className="h-4 w-4 mx-auto mb-1" style={{ color: "#78cce2" }} />
                  <div style={{ color: "#78cce2" }} className="text-xs font-mono">CLASSIFIED</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Statistics */}
        <div 
          className="p-4 border-b flex-shrink-0"
          style={{ 
            borderColor: "rgba(120, 204, 226, 0.3)", 
            background: "linear-gradient(to right, #002439, #005066)" 
          }}
        >
        <h3 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider mb-3">OBSERVATORY STATISTICS</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="border backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: "#78cce2" }} />
                <div>
                  <div style={{ color: "#e4eff0" }} className="font-bold text-lg">{totalAnomalies}</div>
                  <div style={{ color: "#78cce2" }} className="text-xs font-mono">Total Anomalies</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: "#78cce2" }} />
                <div>
                  <div style={{ color: "#e4eff0" }} className="font-bold text-lg">{totalClassified}</div>
                  <div style={{ color: "#78cce2" }} className="text-xs font-mono">Classified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span style={{ color: "#78cce2" }} className="text-xs font-mono">Classification Progress</span>
            <span style={{ color: "#e4eff0" }} className="text-xs font-mono">{classificationRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={classificationRate} 
            className="h-2" 
            style={{ backgroundColor: "rgba(120, 204, 226, 0.3)" }}
          />
        </div>
      </div>

      {/* Current Sector Details */}
      <div 
        className="p-4 border-b flex-shrink-0"
        style={{
          borderColor: "rgba(120, 204, 226, 0.3)",
          background: "linear-gradient(to right, rgba(0, 80, 102, 0.5), transparent)",
        }}
      >
        <h3 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider mb-3">SECTOR ANALYSIS</h3>
        <Card 
          className="border backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
        >
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span style={{ color: "#78cce2" }}>Visible Targets:</span>
              <span style={{ color: "#e4eff0" }}>{filteredAnomalies.length}</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span style={{ color: "#78cce2" }}>Classified:</span>
              <span style={{ color: "#78cce2" }}>{filteredAnomalies.filter((a) => a.classified).length}</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span style={{ color: "#78cce2" }}>Pending:</span>
              <span style={{ color: "#4e7988" }}>{filteredAnomalies.filter((a) => !a.classified).length}</span>
            </div>
            {selectedProject && (
              <div className="flex justify-between text-sm font-mono pt-2" style={{ borderTop: "1px solid rgba(120, 204, 226, 0.3)" }}>
                <span style={{ color: "#78cce2" }}>Project Targets:</span>
                <span style={{ color: "#e4eff0" }}>{getSectorAnomaliesForProject(selectedProject.id).length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Missions - Hidden */}
      {/* 
      <div 
        className="p-4 border-b flex-shrink-0"
        style={{
          borderColor: "rgba(120, 204, 226, 0.3)",
          background: "linear-gradient(to right, rgba(0, 80, 102, 0.5), transparent)",
        }}
      >
        <h3 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider mb-3">ACTIVE MISSIONS</h3>
        <div className="space-y-2">
          {availableMissions.slice(0, 3).map((mission) => (
            <Card 
              key={mission.id} 
              className="border backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div style={{ color: "#e4eff0" }} className="text-sm font-mono font-medium mb-1">{mission.name}</div>
                    <div style={{ color: "#78cce2" }} className="text-xs font-mono mb-2">{mission.description}</div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs font-mono"
                        style={{ borderColor: "#78cce2", color: "#78cce2" }}
                      >
                        {mission.reward} XP
                      </Badge>
                      <div className="flex items-center gap-1 text-xs font-mono" style={{ color: "#78cce2" }}>
                        <Clock className="h-3 w-3" />
                        {mission.timeLimit}
                      </div>
                    </div>
                  </div>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#4e7988" }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      */}

      {/* Recent Classifications */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div 
          className="p-4 border-b flex-shrink-0"
          style={{ borderColor: "rgba(120, 204, 226, 0.3)" }}
        >
          <h3 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider mb-3">RECENT CLASSIFICATIONS</h3>
        </div>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {recentClassifications.map((classification) => (
              <Card
                key={classification.id}
                className="border backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
                onClick={() => handleViewClassification(classification)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div style={{ color: "#e4eff0" }} className="text-sm font-mono font-medium mb-1">{classification.anomalyName}</div>
                      <div style={{ color: "#78cce2" }} className="text-xs font-mono mb-2">
                        Classified as {classification.classificationtype}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-mono"
                          style={{ borderColor: "#78cce2", color: "#78cce2" }}
                        >
                          {classification.classificationtype}
                        </Badge>
                        <div style={{ color: "#78cce2" }} className="text-xs font-mono">
                          {new Date(classification.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 flex-shrink-0" style={{ color: "#78cce2" }} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {recentClassifications.length === 0 && (
              <div className="text-center py-8">
                <Star className="h-8 w-8 mx-auto mb-2" style={{ color: "#4e7988" }} />
                <div style={{ color: "#78cce2" }} className="text-sm font-mono">No classifications yet</div>
                <div style={{ color: "#e4eff0" }} className="text-xs font-mono mt-1">Start classifying anomalies to see them here</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Performance Metrics */}
      <div 
        className="p-4 border-t flex-shrink-0"
        style={{ borderColor: "rgba(120, 204, 226, 0.3)" }}
      >
        <Card 
          className="border backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
        >
          <CardHeader className="pb-2">
            <CardTitle style={{ color: "#e4eff0" }} className="text-sm font-mono flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#78cce2" }} />
              PERFORMANCE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span style={{ color: "#78cce2" }}>Accuracy Rate:</span>
              <span style={{ color: "#78cce2" }}>94.2%</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span style={{ color: "#78cce2" }}>Classifications Today:</span>
              <span style={{ color: "#e4eff0" }}>{classifications.length}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span style={{ color: "#78cce2" }}>Streak:</span>
              <span style={{ color: "#4e7988" }}>7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}