"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Power, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Structure, Mission } from "./types"
import { Card, CardContent, Bolt, StatusIndicator } from "./ui-elements"
import { renderDifficultyStars } from "./helpers"

interface ConfirmationStepProps {
  selectedMission: Mission
  selectedStructure: Structure
  isLoading: boolean
  onConfirm: () => void
  onBack: () => void
}

export const ConfirmationStep = ({
  selectedMission,
  selectedStructure,
  isLoading,
  onConfirm,
  onBack,
}: ConfirmationStepProps) => {
  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center"
    >
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        <Button variant="ghost" onClick={onBack} className="mb-8">
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
                  onClick={onBack}
                  className="border-primary/20 text-muted-foreground hover:bg-primary/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
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
  )
};