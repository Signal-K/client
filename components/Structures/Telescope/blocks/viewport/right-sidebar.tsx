"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from "@/components/ui/card"
import { projects } from "@/data/projects"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DatabaseClassification } from "../types"
import { Star, Target, Clock, CheckCircle, AlertCircle, TrendingUp, Eye } from "lucide-react"

interface RightSidebarProps {
  anomalies: any[]
  classifications: any[]
  allClassifications: any[]
  filteredAnomalies: any[]
  availableMissions: any[]
  selectedProject: any | null
  getSectorAnomaliesForProject: (projectId: string | null) => any[]
  handleViewClassification: (classification: any) => void
}

export function RightSidebar({
  anomalies,
  classifications,
  allClassifications,
  filteredAnomalies,
  availableMissions,
  selectedProject,
  getSectorAnomaliesForProject,
  handleViewClassification,
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
    <div className="hidden lg:flex lg:flex-col lg:w-80 bg-[#2E3440] border-l border-[#4C566A] overflow-hidden">
      {/* Statistics */}
      <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
        <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Observatory Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[#3B4252] border-[#4C566A]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#88C0D0]" />
                <div>
                  <div className="text-[#ECEFF4] font-bold text-lg">{totalAnomalies}</div>
                  <div className="text-[#D8DEE9] text-xs">Total Anomalies</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#3B4252] border-[#4C566A]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#A3BE8C]" />
                <div>
                  <div className="text-[#ECEFF4] font-bold text-lg">{totalClassified}</div>
                  <div className="text-[#D8DEE9] text-xs">Classified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#D8DEE9] text-xs">Classification Progress</span>
            <span className="text-[#88C0D0] text-xs">{classificationRate.toFixed(1)}%</span>
          </div>
          <Progress value={classificationRate} className="h-2 bg-[#4C566A]" />
        </div>
      </div>

      {/* Current Sector Details */}
      <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
        <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Sector Analysis</h3>
        <Card className="bg-[#3B4252] border-[#4C566A]">
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#D8DEE9]">Visible Targets:</span>
              <span className="text-[#88C0D0]">{filteredAnomalies.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#D8DEE9]">Classified:</span>
              <span className="text-[#A3BE8C]">{filteredAnomalies.filter((a) => a.classified).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#D8DEE9]">Pending:</span>
              <span className="text-[#EBCB8B]">{filteredAnomalies.filter((a) => !a.classified).length}</span>
            </div>
            {selectedProject && (
              <div className="flex justify-between text-sm pt-2 border-t border-[#4C566A]">
                <span className="text-[#D8DEE9]">Project Targets:</span>
                <span className="text-[#88C0D0]">{getSectorAnomaliesForProject(selectedProject.id).length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Missions */}
      <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
        <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Active Missions</h3>
        <div className="space-y-2">
          {availableMissions.slice(0, 3).map((mission) => (
            <Card key={mission.id} className="bg-[#3B4252] border-[#4C566A]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-[#ECEFF4] text-sm font-medium mb-1">{mission.name}</div>
                    <div className="text-[#D8DEE9] text-xs mb-2">{mission.description}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#88C0D0] text-[#88C0D0] text-xs">
                        {mission.reward} XP
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-[#D8DEE9]">
                        <Clock className="h-3 w-3" />
                        {mission.timeLimit}
                      </div>
                    </div>
                  </div>
                  <AlertCircle className="h-4 w-4 text-[#EBCB8B] flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Classifications */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 border-b border-[#4C566A]">
          <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Recent Classifications</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {recentClassifications.map((classification) => (
              <Card
                key={classification.id}
                className="bg-[#3B4252] border-[#4C566A] cursor-pointer hover:bg-[#434C5E] transition-colors"
                onClick={() => handleViewClassification(classification)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-[#ECEFF4] text-sm font-medium mb-1">{classification.anomalyName}</div>
                      <div className="text-[#D8DEE9] text-xs mb-2">
                        Classified as {classification.classificationtype}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-[#A3BE8C] text-[#A3BE8C] text-xs">
                          {classification.classificationtype}
                        </Badge>
                        <div className="text-[#D8DEE9] text-xs">
                          {new Date(classification.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-[#88C0D0] flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {recentClassifications.length === 0 && (
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-[#4C566A] mx-auto mb-2" />
                <div className="text-[#D8DEE9] text-sm">No classifications yet</div>
                <div className="text-[#88C0D0] text-xs mt-1">Start classifying anomalies to see them here</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Performance Metrics */}
      <div className="p-4 border-t border-[#4C566A] flex-shrink-0">
        <Card className="bg-[#3B4252] border-[#4C566A]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#ECEFF4] text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#D8DEE9]">Accuracy Rate:</span>
              <span className="text-[#A3BE8C]">94.2%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#D8DEE9]">Classifications Today:</span>
              <span className="text-[#88C0D0]">{classifications.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#D8DEE9]">Streak:</span>
              <span className="text-[#EBCB8B]">7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
};