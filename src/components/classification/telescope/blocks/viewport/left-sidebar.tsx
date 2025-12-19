"use client"

import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { projects } from "@/src/shared/data/projects"
import {
  Telescope,
  Archive,
  TreePine,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Star,
  Search,
  Crosshair,
  Power,
  Satellite,
  Activity,
  Eye,
  EyeOff,
  Scan,
  Zap,
  Radar,
  Settings,
} from "lucide-react"

interface LeftSidebarProps {
  currentSectorName: string
  filteredAnomalies: any[]
  classifications: any[]
  viewMode: string
  setViewMode: (mode: "viewport" | "discoveries" | "skill-tree") => void
  selectedProject: any | null
  selectProject: (project: any | null) => void
  handleNavigate: (direction: "up" | "down" | "left" | "right") => void
  getSectorAnomaliesForProject: (projectId: string | null) => any[]
  showAllAnomalies: boolean
  setShowAllAnomalies: (show: boolean) => void
};

export function LeftSidebar({
  currentSectorName,
  filteredAnomalies,
  classifications,
  viewMode,
  setViewMode,
  selectedProject,
  selectProject,
  handleNavigate,
  getSectorAnomaliesForProject,
  showAllAnomalies,
  setShowAllAnomalies,
}: LeftSidebarProps) {
  return (
    <div
      className="hidden lg:flex w-56 xl:w-64 flex-col backdrop-blur-sm flex-shrink-0 h-full overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 80, 102, 0.95)", borderRight: "1px solid rgba(120, 204, 226, 0.3)" }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex-shrink-0"
        style={{ borderColor: "rgba(120, 204, 226, 0.3)", background: "linear-gradient(to right, #002439, #005066)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(to bottom right, #78cce2, #4e7988)" }}
          >
            <Search className="h-5 w-5" style={{ color: "#002439" }} />
          </div>
          <div>
            <h1 style={{ color: "#e4eff0" }} className="font-bold text-sm tracking-wider">
              TELESCOPE
            </h1>
            <p style={{ color: "#78cce2" }} className="text-xs font-mono">
              {currentSectorName}
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="overflow-y-auto flex-1 min-h-0">
        <div
          className="p-4 border-b flex-shrink-0"
          style={{
            borderColor: "rgba(120, 204, 226, 0.3)",
            background: "linear-gradient(to right, rgba(0, 80, 102, 0.5), transparent)",
          }}
        >
          {/* <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#78cce2" }}></div>
              <span style={{ color: "#78cce2" }} className="font-mono">
                ONLINE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Power className="h-3 w-3" style={{ color: "#e4eff0" }} />
              <span style={{ color: "#e4eff0" }} className="font-mono">
                PWR: 98%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Satellite className="h-3 w-3" style={{ color: "#78cce2" }} />
              <span style={{ color: "#78cce2" }} className="font-mono">
                LINK: STABLE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" style={{ color: "#4e7988" }} />
              <span style={{ color: "#4e7988" }} className="font-mono">
                CPU: 67%
              </span>
            </div>
          </div> */}
          {/* <div style={{ color: "#78cce2" }} className="text-xs font-mono mb-2">
            Targets: {filteredAnomalies.length}/10
          </div>
          <Badge style={{ backgroundColor: "#78cce2", color: "#002439" }} className="text-xs px-2 py-1 font-mono">
            {classifications.length} CLASSIFIED
          </Badge> */}
        </div>

        {/* Navigation Controls */}
        {viewMode === "viewport" && (
          <Card
            className="m-4 border backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle style={{ color: "#e4eff0" }} className="text-sm font-mono flex items-center gap-2">
                <Crosshair className="h-4 w-4" style={{ color: "#78cce2" }} />
                SECTOR NAVIGATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("up")}
                  className="h-8 w-8 p-0 border"
                  style={{
                    color: "#78cce2",
                    borderColor: "rgba(120, 204, 226, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                    e.currentTarget.style.color = "#e4eff0"
                    e.currentTarget.style.borderColor = "#78cce2"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#78cce2"
                    e.currentTarget.style.borderColor = "rgba(120, 204, 226, 0.3)"
                  }}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("left")}
                  className="h-8 w-8 p-0 border"
                  style={{
                    color: "#78cce2",
                    borderColor: "rgba(120, 204, 226, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                    e.currentTarget.style.color = "#e4eff0"
                    e.currentTarget.style.borderColor = "#78cce2"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#78cce2"
                    e.currentTarget.style.borderColor = "rgba(120, 204, 226, 0.3)"
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{ background: "linear-gradient(to bottom right, #78cce2, #4e7988)" }}
                  ></div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("right")}
                  className="h-8 w-8 p-0 border"
                  style={{
                    color: "#78cce2",
                    borderColor: "rgba(120, 204, 226, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                    e.currentTarget.style.color = "#e4eff0"
                    e.currentTarget.style.borderColor = "#78cce2"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#78cce2"
                    e.currentTarget.style.borderColor = "rgba(120, 204, 226, 0.3)"
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("down")}
                  className="h-8 w-8 p-0 border"
                  style={{
                    color: "#78cce2",
                    borderColor: "rgba(120, 204, 226, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                    e.currentTarget.style.color = "#e4eff0"
                    e.currentTarget.style.borderColor = "#78cce2"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#78cce2"
                    e.currentTarget.style.borderColor = "rgba(120, 204, 226, 0.3)"
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Selection */}
        <Card
          className="m-4 border backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
        >
          <CardHeader className="pb-3">
            <CardTitle style={{ color: "#e4eff0" }} className="text-sm font-mono flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: "#78cce2" }} />
              PROJECT FILTER
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            <Button
              variant={!selectedProject ? "default" : "ghost"}
              className="w-full justify-start text-xs font-mono"
              style={{
                backgroundColor: !selectedProject ? "#78cce2" : "transparent",
                color: !selectedProject ? "#002439" : "#e4eff0",
                borderColor: !selectedProject ? "transparent" : "rgba(120, 204, 226, 0.3)",
              }}
              onClick={() => selectProject(null)}
              onMouseEnter={(e) => {
                if (!selectedProject) {
                  e.currentTarget.style.backgroundColor = "#e4eff0"
                } else {
                  e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedProject) {
                  e.currentTarget.style.backgroundColor = "#78cce2"
                } else {
                  e.currentTarget.style.backgroundColor = "transparent"
                }
              }}
            >
              <Star className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">ALL PROJECTS</span>
              <span className="ml-auto text-xs flex-shrink-0">({getSectorAnomaliesForProject(null).length})</span>
            </Button>

            {projects.map((project) => {
              const sectorCount = getSectorAnomaliesForProject(project.id).length
              const isSelected = selectedProject?.id === project.id

              return (
                <Button
                  key={project.id}
                  variant={isSelected ? "default" : "ghost"}
                  className="w-full justify-start text-xs font-mono"
                  style={{
                    backgroundColor: isSelected ? "#78cce2" : "transparent",
                    color: isSelected ? "#002439" : "#e4eff0",
                    borderColor: isSelected ? "transparent" : "rgba(120, 204, 226, 0.3)",
                  }}
                  onClick={() => selectProject(project)}
                  onMouseEnter={(e) => {
                    if (isSelected) {
                      e.currentTarget.style.backgroundColor = "#e4eff0"
                    } else {
                      e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.2)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isSelected) {
                      e.currentTarget.style.backgroundColor = "#78cce2"
                    } else {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
                      style={{ background: project.bgGradient }}
                    >
                      {project.icon}
                    </div>
                    <span className="flex-1 text-left truncate">{project.name.toUpperCase()}</span>
                    <span className="text-xs flex-shrink-0">({sectorCount})</span>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* View Options */}
        {viewMode === "viewport" && (
          <Card
            className="m-4 border backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle style={{ color: "#e4eff0" }} className="text-sm font-mono flex items-center gap-2">
                <Eye className="h-4 w-4" style={{ color: "#78cce2" }} />
                VIEW OPTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs font-mono h-8"
                style={{
                  backgroundColor: showAllAnomalies ? "rgba(120, 204, 226, 0.2)" : "transparent",
                  color: "#e4eff0",
                  borderColor: "rgba(120, 204, 226, 0.3)",
                  border: "1px solid rgba(120, 204, 226, 0.3)",
                }}
                onClick={() => setShowAllAnomalies(!showAllAnomalies)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(120, 204, 226, 0.3)"
                  e.currentTarget.style.borderColor = "#78cce2"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = showAllAnomalies ? "rgba(120, 204, 226, 0.2)" : "transparent"
                  e.currentTarget.style.borderColor = "rgba(120, 204, 226, 0.3)"
                }}
              >
                {showAllAnomalies ? <EyeOff className="h-3 w-3 mr-2" /> : <Eye className="h-3 w-3 mr-2" />}
                <span className="truncate">
                  {showAllAnomalies ? "HIDE BACKGROUND STARS" : "SHOW ALL ANOMALIES"}
                </span>
              </Button>
              {showAllAnomalies && (
                <div className="mt-2 text-xs font-mono" style={{ color: "#78cce2" }}>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#78cce2" }}></div>
                    <span>Your linked targets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(120, 204, 226, 0.4)" }}></div>
                    <span>Background stars (view only)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="p-4 space-y-2 flex-shrink-0">
          <Button
            onClick={() => setViewMode(viewMode === "viewport" ? "discoveries" : "viewport")}
            className="w-full font-mono text-sm py-2"
            style={{
              backgroundColor: "#78cce2",
              color: "#002439",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e4eff0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#78cce2")}
          >
            {viewMode === "viewport" ? (
              <>
                <Archive className="h-4 w-4 mr-2" />
                ACCESS ARCHIVE
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                RETURN TO SCOPE
              </>
            )}
          </Button>

          <Button
            onClick={() => setViewMode("skill-tree")}
            className="w-full font-mono text-sm py-2"
            style={{
              backgroundColor: "#4e7988",
              color: "#e4eff0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#78cce2"
              e.currentTarget.style.color = "#002439"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4e7988"
              e.currentTarget.style.color = "#e4eff0"
            }}
          >
            <TreePine className="h-4 w-4 mr-2" />
            RESEARCH & DEVELOPMENT
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="font-mono text-xs"
              style={{
                backgroundColor: "#4e7988",
                color: "#e4eff0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#78cce2"
                e.currentTarget.style.color = "#002439"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#4e7988"
                e.currentTarget.style.color = "#e4eff0"
              }}
            >
              <Scan className="h-3 w-3 mr-1" />
              SCAN
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs"
              style={{
                backgroundColor: "#005066",
                color: "#e4eff0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#78cce2"
                e.currentTarget.style.color = "#002439"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#005066"
                e.currentTarget.style.color = "#e4eff0"
              }}
            >
              <Zap className="h-3 w-3 mr-1" />
              BOOST
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs"
              style={{
                backgroundColor: "#4e7988",
                color: "#e4eff0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#78cce2"
                e.currentTarget.style.color = "#002439"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#4e7988"
                e.currentTarget.style.color = "#e4eff0"
              }}
            >
              <Radar className="h-3 w-3 mr-1" />
              RADAR
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs"
              style={{
                backgroundColor: "#005066",
                color: "#e4eff0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#78cce2"
                e.currentTarget.style.color = "#002439"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#005066"
                e.currentTarget.style.color = "#e4eff0"
              }}
            >
              <Settings className="h-3 w-3 mr-1" />
              CONFIG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}