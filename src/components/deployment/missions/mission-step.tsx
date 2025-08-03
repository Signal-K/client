"use client"

import { motion } from "framer-motion"
import { ChevronLeft, Power, Cpu } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import type { Structure, Project } from "./types"
import { Card, CardContent, Bolt, Clock } from "./ui-elements"
import { getMissionStatusColor, renderDifficultyStars } from "./helpers"

interface MissionStepProps {
  selectedStructure: Structure
  projects: Record<string, Project[]>
  onMissionClick: (mission: Project) => void
  onBack: () => void
};

export const MissionStep = ({ selectedStructure, projects, onMissionClick, onBack }: MissionStepProps) => {
  return (
    <motion.div
      key="mission"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
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
            onClick={() => onMissionClick(mission)}
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
  );
};