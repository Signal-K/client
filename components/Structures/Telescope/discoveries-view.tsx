"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, User, Star, ArrowLeft, Users, Sparkles, Target, CheckCircle2 } from "lucide-react";
import type { Anomaly, Project, Mission } from "@/types/Structures/telescope";
import { useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { projects } from "@/src/features/telescope/data/telescope/projects";

interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
}

interface DiscoveriesViewProps {
  classifications: DatabaseClassification[]
  allClassifications: DatabaseClassification[]
  projectMissions: Mission[]
  selectedProject: Project | null
  onBack: () => void
  onViewAnomaly: (anomaly: Anomaly) => void
  onViewClassification: (classification: DatabaseClassification) => void
  showAllDiscoveries: boolean
  setShowAllDiscoveries: (show: boolean) => void
  anomalies: Anomaly[]
}

export function DiscoveriesView({
  classifications,
  allClassifications,
  projectMissions,
  selectedProject,
  onBack,
  onViewAnomaly,
  onViewClassification,
  showAllDiscoveries,
  setShowAllDiscoveries,
  anomalies,
}: DiscoveriesViewProps) {
  const [activeTab, setActiveTab] = useState("discoveries")

  const getAnomalyForClassification = (classification: DatabaseClassification): Anomaly | null => {
    return anomalies.find((a) => a.id === `db-${classification.anomaly}`) || null
  }

  const getClassificationTypeColor = (type: string | null) => {
    switch (type) {
      case "planet":
        return "bg-[#a8d8ea]"
      case "sunspot":
        return "bg-[#ffd93d]"
      case "asteroid":
        return "bg-[#c7cedb]"
      case "disk":
        return "bg-[#b8e6b8]"
      default:
        return "bg-[#87ceeb]"
    }
  }

  const completedMissions = projectMissions.filter((m) => m.completed)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#1a1a2e]">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-[#a8d8ea]/20 bg-[#16213e]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Telescope
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#e8f4f8] font-mono">DISCOVERY ARCHIVE</h1>
              <p className="text-[#a8d8ea] text-sm font-mono">
                {selectedProject ? `${selectedProject.name.toUpperCase()} PROJECT` : "ALL PROJECTS"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#a8d8ea] text-[#1a1a2e] font-mono">{classifications.length} YOUR FINDS</Badge>
            <Badge className="bg-[#87ceeb] text-[#1a1a2e] font-mono">{allClassifications.length} TOTAL</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 lg:mx-6 mt-4 bg-[#16213e]/60 border border-[#a8d8ea]/20">
            <TabsTrigger
              value="discoveries"
              className="data-[state=active]:bg-[#a8d8ea] data-[state=active]:text-[#1a1a2e] text-[#e8f4f8] font-mono"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Your Discoveries
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-[#a8d8ea] data-[state=active]:text-[#1a1a2e] text-[#e8f4f8] font-mono"
            >
              <Users className="h-4 w-4 mr-2" />
              Global Archive
            </TabsTrigger>
            <TabsTrigger
              value="missions"
              className="data-[state=active]:bg-[#a8d8ea] data-[state=active]:text-[#1a1a2e] text-[#e8f4f8] font-mono"
            >
              <Target className="h-4 w-4 mr-2" />
              Missions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discoveries" className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {classifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 border-2 border-dashed border-[#a8d8ea]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-[#a8d8ea]/50" />
                </div>
                <h3 className="text-xl font-bold text-[#e8f4f8] mb-2 font-mono">NO DISCOVERIES YET</h3>
                <p className="text-[#a8d8ea] font-mono">Start exploring the cosmos to make your first discovery!</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {classifications.map((classification) => {
                  const anomaly = getAnomalyForClassification(classification)
                  return (
                    <Card
                      key={classification.id}
                      className="bg-[#16213e]/60 border border-[#a8d8ea]/20 hover:border-[#a8d8ea]/40 transition-all cursor-pointer backdrop-blur-sm"
                      onClick={() => onViewClassification(classification)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[#e8f4f8] text-lg font-mono">#{classification.id}</CardTitle>
                          <Badge
                            className={`${getClassificationTypeColor(
                              classification.classificationtype,
                            )} text-[#1a1a2e] font-mono`}
                          >
                            {classification.classificationtype?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-[#a8d8ea] font-mono">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(classification.created_at).toLocaleDateString()}</span>
                          </div>
                          {anomaly && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: anomaly.color,
                                  boxShadow: `0 0 8px ${anomaly.color}66`,
                                }}
                              />
                              <span className="text-[#e8f4f8] text-sm font-mono">{anomaly.name}</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (anomaly) onViewAnomaly(anomaly)
                            }}
                            className="w-full text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30 font-mono"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View in Telescope
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global" className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e8f4f8] font-mono">GLOBAL DISCOVERIES</h3>
              <Button
                onClick={() => setShowAllDiscoveries(!showAllDiscoveries)}
                className="bg-[#a8d8ea] text-[#1a1a2e] hover:bg-[#87ceeb] font-mono"
              >
                <Users className="h-4 w-4 mr-2" />
                All Users
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {allClassifications.slice(0, showAllDiscoveries ? undefined : 12).map((classification) => {
                const anomaly = getAnomalyForClassification(classification)
                return (
                  <Card
                    key={classification.id}
                    className="bg-[#16213e]/60 border border-[#a8d8ea]/20 hover:border-[#a8d8ea]/40 transition-all cursor-pointer backdrop-blur-sm"
                    onClick={() => onViewClassification(classification)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[#e8f4f8] text-lg font-mono">#{classification.id}</CardTitle>
                        <Badge
                          className={`${getClassificationTypeColor(
                            classification.classificationtype,
                          )} text-[#1a1a2e] font-mono`}
                        >
                          {classification.classificationtype?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-[#a8d8ea] font-mono">
                          <User className="h-4 w-4" />
                          <span>User {classification.author?.slice(0, 8) || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#a8d8ea] font-mono">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(classification.created_at).toLocaleDateString()}</span>
                        </div>
                        {anomaly && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: anomaly.color,
                                boxShadow: `0 0 8px ${anomaly.color}66`,
                              }}
                            />
                            <span className="text-[#e8f4f8] text-sm font-mono">{anomaly.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="missions" className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {/* Available Missions */}
            <div>
              <h3 className="text-lg font-bold text-[#e8f4f8] mb-4 font-mono flex items-center gap-2">
                <Target className="h-5 w-5 text-[#a8d8ea]" />
                ACTIVE MISSIONS
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {availableMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="bg-[#16213e]/60 border border-[#a8d8ea]/20 hover:border-[#a8d8ea]/40 transition-all backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[#e8f4f8] font-mono">{mission.name}</CardTitle>
                        <Badge className="bg-[#ffd93d] text-[#1a1a2e] font-mono">ACTIVE</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#a8d8ea] text-sm mb-4 font-mono">{mission.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[#e8f4f8] font-mono">
                          <Star className="h-4 w-4 text-[#ffd93d]" />
                          <span>{mission.reward} points</span>
                        </div>
                        <Badge className="bg-[#a8d8ea]/20 text-[#a8d8ea] font-mono">
                          {mission.progress || 0}/{mission.target}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed Missions */}
            {completedMissions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#e8f4f8] mb-4 font-mono flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#b8e6b8]" />
                  COMPLETED MISSIONS
                </h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {completedMissions.map((mission) => (
                    <Card
                      key={mission.id}
                      className="bg-[#16213e]/40 border border-[#b8e6b8]/20 backdrop-blur-sm opacity-75"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-[#e8f4f8] font-mono">{mission.name}</CardTitle>
                          <Badge className="bg-[#b8e6b8] text-[#1a1a2e] font-mono">COMPLETE</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[#a8d8ea] text-sm mb-4 font-mono">{mission.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-[#e8f4f8] font-mono">
                            <Star className="h-4 w-4 text-[#ffd93d]" />
                            <span>{mission.reward} points earned</span>
                          </div>
                          <Badge className="bg-[#b8e6b8]/20 text-[#b8e6b8] font-mono">
                            {mission.target}/{mission.target}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};