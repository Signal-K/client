"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  CloudSun,
  Leaf,
  Telescope,
  Globe,
  Wind,
  Target,
  Search,
  Eye,
  Zap,
  Shield,
  Award,
  Sparkles,
  Power,
  Wifi,
  AlertCircle,
  BarChart3,
  Cpu,
  Database,
  Layers,
  Settings,
  RefreshCw,
} from "lucide-react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/context/ActivePlanet"
import { Button } from "@/components/ui/button"

// Create our own simplified Card components
const Card = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) => (
  <div onClick={onClick} className={`rounded-lg border bg-card shadow-sm ${className}`}>
    {children}
  </div>
)

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => <div className={`${className}`}>{children}</div>

// Decorative bolt component
const Bolt = ({ className = "" }: { className?: string }) => (
  <div className={`w-3 h-3 rounded-full bg-secondary/70 border border-secondary/30 ${className}`}></div>
)

// Status indicator component
const StatusIndicator = ({ active = true, className = "" }: { active?: boolean; className?: string }) => (
  <div className="flex items-center space-x-1">
    <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
    <span className="text-xs text-muted-foreground">{active ? "Online" : "Offline"}</span>
  </div>
)

// Device button component
const DeviceButton = ({
  icon: Icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors ${className}`}
  >
    <Icon className="w-4 h-4 mb-1 text-muted-foreground" />
    <span className="text-xs text-muted-foreground">{label}</span>
  </button>
)

interface Mission {
  name: string
  icon: React.ElementType
  description: string
  identifier: string
  techId: number
  tutorialMission: number
  activeStructure: number
  sourceLink?: string
  status?: "active" | "maintenance" | "offline"
  difficulty?: number
  estimatedTime?: string
}

interface Structure {
  name: string
  icon: React.ElementType
  description: string
  bgGradient: string
  iconColor: string
  inventoryItemId: number
  specialty: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status?: "operational" | "limited" | "offline"
  powerLevel?: number
  systemVersion?: string
}

interface Project {
  name: string
  description: string
  identifier: string
  sourceLink: string
  icon: React.ElementType
  techId: number
  tutorialMission: number
  activeStructure: number
  status?: "active" | "maintenance" | "offline"
  difficulty?: number
  estimatedTime?: string
}

const structures: Structure[] = [
  {
    name: "Refracting Telescope",
    icon: Telescope,
    description: "Browse & classify space-based observations & classifications",
    specialty: "Deep Space Explorer",
    difficulty: "Beginner",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
    inventoryItemId: 3103,
    status: "operational",
    powerLevel: 87,
    systemVersion: "v3.2.1",
  },
  {
    name: "Biodome",
    icon: Leaf,
    description: "For xenobiologists studying alien life forms",
    specialty: "Life Sciences Specialist",
    difficulty: "Intermediate",
    bgGradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
    inventoryItemId: 3104,
    status: "operational",
    powerLevel: 92,
    systemVersion: "v2.8.5",
  },
  {
    name: "Atmospheric Probe",
    icon: CloudSun,
    description: "For climatologists analyzing extraterrestrial atmospheres",
    specialty: "Climate Researcher",
    difficulty: "Advanced",
    bgGradient: "from-purple-500/10 to-primary/10",
    iconColor: "text-primary",
    inventoryItemId: 3105,
    status: "limited",
    powerLevel: 64,
    systemVersion: "v4.0.2",
  },
]

const projects: Record<string, Project[]> = {
  "Refracting Telescope": [
    {
      name: "Planet Hunting",
      description: "Discover real planets in our galactic community",
      identifier: "telescope-tess",
      sourceLink: "https://www.zooniverse.org/projects/mschwamb/planet-hunters-ngts",
      icon: Globe,
      techId: 3103,
      tutorialMission: 3000001,
      activeStructure: 3103,
      status: "active",
      difficulty: 2,
      estimatedTime: "4-6 hrs",
    },
    {
      name: "Asteroid Detection",
      description: "Discover new asteroids everyday in your telescope's data",
      identifier: "telescope-minorPlanet",
      sourceLink: "https://www.zooniverse.org/projects/fulsdavid/the-daily-minor-planet",
      icon: Target,
      techId: 3103,
      tutorialMission: 20000004,
      activeStructure: 3103,
      status: "active",
      difficulty: 3,
      estimatedTime: "2-3 hrs",
    },
    {
      name: "Sunspot observations",
      description: "Help diagnose our sun's health problems and behaviour",
      identifier: "telescope-sunspots",
      sourceLink: "https://www.zooniverse.org/projects/teolixx/sunspot-detectives",
      icon: Zap,
      techId: 3103,
      tutorialMission: 3000002,
      activeStructure: 3103,
      status: "maintenance",
      difficulty: 4,
      estimatedTime: "5-8 hrs",
    },
  ],
  Biodome: [
    {
      name: "Wildwatch Burrowing Owls",
      description:
        "Document and understand the developmental milestones of Otey Mesa burrowing owls through your observation satellites",
      identifier: "zoodex-burrowingOwl",
      sourceLink: "zooniverse.org/projects/sandiegozooglobal/wildwatch-burrowing-owl/",
      icon: Eye,
      techId: 3104,
      tutorialMission: 3000004,
      activeStructure: 3104,
      status: "active",
      difficulty: 2,
      estimatedTime: "3-5 hrs",
    },
    {
      name: "Iguanas from Above",
      description: "Help us count Galapagos Marine Iguanas from aerial photographs taken by your satellite network",
      identifier: "zoodex-iguanasFromAbove",
      sourceLink: "https://www.zooniverse.org/projects/andreavarela89/iguanas-from-above",
      icon: Search,
      techId: 3104,
      tutorialMission: 3000004,
      activeStructure: 3104,
      status: "active",
      difficulty: 1,
      estimatedTime: "2-4 hrs",
    },
  ],
  "Atmospheric Probe": [
    {
      name: "Martian Cloud Survey",
      description: "Model cloud behaviour on Mars (and similar exoplanet candidates)",
      identifier: "lidar-martianClouds",
      sourceLink: "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars",
      icon: Wind,
      techId: 3105,
      tutorialMission: 3000010,
      activeStructure: 3105,
      status: "active",
      difficulty: 3,
      estimatedTime: "4-7 hrs",
    },
    {
      name: "Vortex Hunter",
      description: "Identify and manipulate features & fluid dynamics in gaseous planets like Jupiter",
      identifier: "lidar-jovianVortexHunter",
      sourceLink: "zooniverse.org/projects/ramanakumars/jovian-vortex-hunter/",
      icon: Shield,
      techId: 3105,
      tutorialMission: 20000007,
      activeStructure: 3105,
      status: "offline",
      difficulty: 5,
      estimatedTime: "6-10 hrs",
    },
  ],
}

type Step = "intro" | "selection" | "mission" | "confirmation" | "complete"

export default function MissionSelector() {
  const { activePlanet, updatePlanetLocation } = useActivePlanet()
  const supabase = useSupabaseClient()
  const session = useSession()

  const [currentStep, setCurrentStep] = useState<Step>("intro")
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep("selection")
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleStructureClick = (structure: Structure) => {
    setSelectedStructure(structure)
    setSelectedMission(null)
    setConfirmationMessage("")
    setCurrentStep("mission")
  }

  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission)
    setConfirmationMessage("")
    setCurrentStep("confirmation")
  }

  const insertAdditionalStarterItems = async (chosenId: number) => {
    if (!session) return

    const starterItemIds = [3105, 3104, 3103]
    const otherItemIds = starterItemIds.filter((id) => id !== chosenId)

    const additionalInserts = otherItemIds.map((itemId) => ({
      owner: session.user.id,
      item: itemId,
      anomaly: activePlanet?.id || 30,
      quantity: 1,
      notes: "Starter item added alongside mission item",
      configuration: { Uses: 10, "missions unlocked": [] },
    }))

    const { error } = await supabase.from("inventory").insert(additionalInserts)

    if (error) {
      console.error("Failed to insert additional items:", error.message)
    }
  }

  const handleConfirmMission = async () => {
    if (!session || !selectedMission) return

    setIsLoading(true)
    const chosenItemId = selectedMission.activeStructure

    const structureCreationData = {
      owner: session.user.id,
      item: chosenItemId,
      anomaly: activePlanet?.id || 30,
      quantity: 1,
      notes: "Created for user's first classification mission",
      configuration: {
        Uses: 10,
        "missions unlocked": [selectedMission.identifier],
      },
    }

    try {
      updatePlanetLocation(30)

      await supabase.from("inventory").insert([structureCreationData])
      await insertAdditionalStarterItems(chosenItemId)

      setConfirmationMessage(`Mission "${selectedMission.name}" confirmed!`)
      setCurrentStep("complete")

      // Refresh the page after a short delay to show the completion message
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error: any) {
      setConfirmationMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === "mission") {
      setCurrentStep("selection")
      setSelectedStructure(null)
    } else if (currentStep === "confirmation") {
      setCurrentStep("mission")
      setSelectedMission(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getMissionStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "offline":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStructureStatusColor = (status: string | undefined) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800 border-green-200"
      case "limited":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "offline":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const Star = ({ className = "" }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )

  const renderDifficultyStars = (difficulty: number | undefined) => {
    if (!difficulty) return null
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < difficulty ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Subtle background elements */}
      <div className="squiggly-shape sci-fi-shape-1 bg-primary/5"></div>
      <div className="squiggly-shape sci-fi-shape-2 bg-accent/5"></div>
      <div className="squiggly-shape sci-fi-shape-3 bg-secondary/5"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {currentStep === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[80vh] flex items-center justify-center text-center"
            >
              <div className="space-y-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto relative">
                  <Sparkles className="w-12 h-12 text-primary-foreground" />
                  {/* Decorative bolts */}
                  <Bolt className="absolute top-2 left-2" />
                  <Bolt className="absolute top-2 right-2" />
                  <Bolt className="absolute bottom-2 left-2" />
                  <Bolt className="absolute bottom-2 right-2" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choose Your Research Path</h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Select your specialization and begin your scientific journey
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Selection Step */}
          {currentStep === "selection" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Research Stations</h2>
                <p className="text-lg text-muted-foreground">Choose your primary research facility</p>
              </div>

              <div className="squiggly-divider"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {structures.map((structure, index) => (
                  <motion.div
                    key={structure.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStructureClick(structure)}
                    className="cursor-pointer"
                  >
                    <Card
                      className={`border-2 hover:border-primary/50 transition-all h-[28rem] md:h-[32rem] bg-gradient-to-br ${structure.bgGradient} relative overflow-hidden`}
                    >
                      {/* Decorative bolts */}
                      <Bolt className="absolute top-3 left-3" />
                      <Bolt className="absolute top-3 right-3" />
                      <Bolt className="absolute bottom-3 left-3" />
                      <Bolt className="absolute bottom-3 right-3" />

                      {/* Status bar */}
                      <div className="absolute top-0 left-0 right-0 bg-black/10 backdrop-blur-sm p-2 flex justify-between items-center text-xs border-b border-white/10">
                        <StatusIndicator active={structure.status === "operational"} />
                        <span className="text-muted-foreground">{structure.systemVersion}</span>
                      </div>

                      <CardContent className="p-6 md:p-8 h-full flex flex-col relative z-10 pt-12">
                        <div className="text-center mb-6">
                          <div
                            className={`w-20 h-20 ${structure.iconColor.replace("text-", "bg-").replace("-600", "-600/20")} rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 relative`}
                          >
                            <structure.icon className={`w-10 h-10 ${structure.iconColor}`} />
                            {/* Power indicator */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                              <Power className="w-3 h-3 text-primary" />
                            </div>
                          </div>
                          <h3 className={`text-2xl font-bold text-foreground mb-2`}>{structure.name}</h3>
                          <div className="flex flex-wrap justify-center gap-2 mb-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(structure.difficulty)}`}
                            >
                              {structure.difficulty}
                            </span>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStructureStatusColor(structure.status)}`}
                            >
                              {structure.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <p className="text-muted-foreground text-center">{structure.description}</p>

                          {/* System status display */}
                          <div className="bg-black/5 rounded-md p-3 border border-white/10">
                            <div className="text-xs text-muted-foreground mb-1">System Status</div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs">Power</span>
                              <span className="text-xs font-medium">{structure.powerLevel}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${structure.powerLevel}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Wifi className="w-3 h-3 mr-1" />
                                <span>Connected</span>
                              </div>
                              <div className="flex items-center">
                                <Database className="w-3 h-3 mr-1" />
                                <span>Storage: 64%</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <span className={`text-sm font-semibold ${structure.iconColor}`}>
                              {structure.specialty}
                            </span>
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="grid grid-cols-4 gap-2 mt-4 border-t border-white/10 pt-4">
                          <DeviceButton icon={Settings} label="Config" />
                          <DeviceButton icon={BarChart3} label="Stats" />
                          <DeviceButton icon={Layers} label="Data" />
                          <DeviceButton icon={RefreshCw} label="Sync" />
                        </div>

                        <div className="flex justify-center mt-4">
                          <Button
                            className={`bg-${structure.iconColor.replace("text-", "")} hover:bg-${structure.iconColor.replace("text-", "")}/90 text-white`}
                          >
                            Select Station
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mission Selection Step */}
          {currentStep === "mission" && selectedStructure && (
            <motion.div
              key="mission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack} className="flex items-center">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Stations
                </Button>
                <div className="text-center flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{selectedStructure.name}</h2>
                  <p className="text-muted-foreground">Available Missions</p>
                </div>
                <div className="w-24 hidden md:block"></div>
              </div>

              <div className="squiggly-divider"></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {projects[selectedStructure.name]?.map((mission, index) => (
                  <motion.div
                    key={mission.identifier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMissionClick(mission)}
                    className="cursor-pointer"
                  >
                    <Card className="border-2 hover:border-primary/50 transition-all h-auto md:h-64 bg-card/50 backdrop-blur-sm relative">
                      {/* Decorative bolts */}
                      <Bolt className="absolute top-3 left-3" />
                      <Bolt className="absolute top-3 right-3" />
                      <Bolt className="absolute bottom-3 left-3" />
                      <Bolt className="absolute bottom-3 right-3" />

                      {/* Status indicator */}
                      <div className="absolute top-0 right-0 m-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getMissionStatusColor(mission.status)}`}
                        >
                          {mission.status}
                        </span>
                      </div>

                      <CardContent className="p-6 md:p-8 h-full flex flex-col md:flex-row">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4 md:mb-0 md:mr-6 flex-shrink-0 relative">
                          <mission.icon className="w-8 h-8 text-muted-foreground" />
                          {/* Power indicator */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-card rounded-full flex items-center justify-center border border-border">
                            <Power className="w-2 h-2 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between mb-2">
                            <h4 className="text-xl font-semibold text-foreground">{mission.name}</h4>
                            {renderDifficultyStars(mission.difficulty)}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{mission.description}</p>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-auto">
                            <div className="flex items-center">
                              <Cpu className="w-3 h-3 mr-1" />
                              <span>ID: {mission.identifier.substring(0, 8)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Est. time: {mission.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Confirmation Step */}
          {currentStep === "confirmation" && selectedMission && selectedStructure && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[80vh] flex items-center justify-center"
            >
              <div className="w-full max-w-3xl mx-auto text-center space-y-8">
                <Button variant="ghost" onClick={handleBack} className="mb-8">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Missions
                </Button>

                <Card className="p-6 md:p-12 border-2 border-primary/20 bg-card/80 backdrop-blur-sm relative">
                  {/* Decorative bolts */}
                  <Bolt className="absolute top-3 left-3" />
                  <Bolt className="absolute top-3 right-3" />
                  <Bolt className="absolute bottom-3 left-3" />
                  <Bolt className="absolute bottom-3 right-3" />

                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 bg-black/10 backdrop-blur-sm p-2 flex justify-between items-center text-xs border-b border-white/10">
                    <StatusIndicator />
                    <span className="text-muted-foreground">MISSION-CONF-{Math.floor(Math.random() * 10000)}</span>
                  </div>

                  <CardContent className="pt-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Confirm Your Selection</h2>

                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 space-y-4 md:space-y-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 relative`}
                          >
                            <selectedStructure.icon className={`w-10 h-10 ${selectedStructure.iconColor}`} />
                            {/* Power indicator */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                              <Power className="w-3 h-3 text-primary" />
                            </div>
                          </div>
                          <span className="text-sm mt-2">{selectedStructure.name}</span>
                        </div>

                        <ChevronRight className="w-6 h-6 text-muted-foreground transform md:rotate-0 rotate-90" />

                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center relative">
                            <selectedMission.icon className="w-10 h-10 text-muted-foreground" />
                            {/* Status indicator */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border">
                              <AlertCircle className="w-3 h-3 text-yellow-500" />
                            </div>
                          </div>
                          <span className="text-sm mt-2">{selectedMission.name}</span>
                        </div>
                      </div>

                      <div className="bg-black/5 rounded-md p-4 border border-white/10 text-left">
                        <h3 className="text-xl font-semibold text-foreground mb-2">{selectedMission.name}</h3>
                        <p className="text-muted-foreground mb-4">{selectedMission.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Research Station</p>
                            <p className="font-medium text-foreground">{selectedStructure.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
                            <p className="font-medium text-foreground">{selectedMission.estimatedTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                            <div>{renderDifficultyStars(selectedMission.difficulty)}</div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-medium text-foreground capitalize">{selectedMission.status}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          className="border-primary/20 text-muted-foreground hover:bg-primary/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmMission}
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              Begin Mission
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[80vh] flex items-center justify-center text-center"
            >
              <div className="space-y-8">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto relative">
                  <Award className="w-12 h-12 text-white" />
                  {/* Decorative bolts */}
                  <Bolt className="absolute top-2 left-2" />
                  <Bolt className="absolute top-2 right-2" />
                  <Bolt className="absolute bottom-2 left-2" />
                  <Bolt className="absolute bottom-2 right-2" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Mission Confirmed!</h1>
                  <p className="text-xl text-muted-foreground mb-2">{confirmationMessage}</p>
                  <p className="text-muted-foreground">Your research station is ready. Welcome to the team!</p>
                  <p className="text-sm text-muted-foreground mt-4">Refreshing page in 3 seconds...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Missing component definition
const Clock = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)