import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Star, Zap, Target } from 'lucide-react'

interface Mission {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
}

interface DialogueStep {
  text: string
  requiredMissions: string[]
}

const missions: Mission[] = [
  { id: 'M001', name: 'First Contact', description: 'Establish communication with an alien civilization', icon: Zap, color: 'text-yellow-400' },
  { id: 'M002', name: 'Stellar Cartography', description: 'Map an unexplored sector of the galaxy', icon: Star, color: 'text-blue-400' },
  { id: 'M003', name: 'Planetary Terraforming', description: 'Transform a barren planet into a habitable world', icon: Target, color: 'text-green-400' },
]

const dialogueSteps: DialogueStep[] = [
  { text: "Welcome, rookie! Your journey into the unknown begins here. Are you ready to make history?", requiredMissions: [] },
  { text: "Impressive work on your first contact mission! The galaxy is vast, and many more civilizations await discovery.", requiredMissions: ['M001'] },
  { text: "Your stellar cartography skills are unmatched! But remember, each map holds secrets yet to be uncovered.", requiredMissions: ['M002'] },
  { text: "A barren world transformed by your hands! You're shaping the future of our species, one planet at a time.", requiredMissions: ['M003'] },
  { text: "You've mastered communication and navigation. Now, it's time to create new homes among the stars!", requiredMissions: ['M001', 'M002'] },
  { text: "From first contact to new frontiers, you've come so far. The universe trembles with anticipation of your next move!", requiredMissions: ['M001', 'M002', 'M003'] },
]

export function MissionGuide() {
  const [completedMissions, setCompletedMissions] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const handleCompleteMission = (missionId: string) => {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions([...completedMissions, missionId])
    }
  }

  const handleNext = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, dialogueSteps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
  }

  const currentDialogue = dialogueSteps[currentStep]
  const isDialogueAvailable = currentDialogue.requiredMissions.every(mission => completedMissions.includes(mission))

  return (
    <div className="p-4 max-w-6xl mx-auto font-mono">
      <Card className="overflow-hidden relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row h-full text-gray-300">
            <div className="flex-grow sm:w-2/3 mb-4 sm:mb-0 sm:mr-4">
              <h1 className="text-2xl font-bold mb-2 text-gray-100 tracking-wider">
                Galactic Mission Guide
              </h1>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-800 p-3 rounded-lg border border-gray-600 relative overflow-hidden h-24 flex items-center"
                >
                  {isDialogueAvailable ? (
                    <p className="text-sm">{currentDialogue.text}</p>
                  ) : (
                    <p className="text-sm text-yellow-400">Complete more missions to unlock this guidance.</p>
                  )}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-full -mr-8 -mt-8 opacity-10"></div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between items-center mt-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-gray-400 text-xs">
                  Step {currentStep + 1} of {dialogueSteps.length}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === dialogueSteps.length - 1}
                  className="bg-blue-600 text-white hover:bg-blue-500 px-2 py-1 text-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="sm:w-1/3">
              <div className="grid grid-cols-1 gap-2">
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      completedMissions.includes(mission.id) ? 'bg-gray-700' : 'bg-gray-800'
                    } border border-gray-600 relative overflow-hidden`}
                    onClick={() => handleCompleteMission(mission.id)}
                  >
                    <CardContent className="p-2 flex items-center">
                      <mission.icon className={`w-6 h-6 mr-2 ${mission.color}`} />
                      <div>
                        <h3 className={`text-xs font-semibold ${mission.color}`}>{mission.name}</h3>
                        <p className="text-xs text-gray-400 truncate">{mission.description}</p>
                      </div>
                      {completedMissions.includes(mission.id) && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sci-fi background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMDAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzMzMzMzMzEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-20"></div>
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-pulse delay-150"></div>
            <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}