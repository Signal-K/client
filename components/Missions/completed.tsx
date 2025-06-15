"use client"

import { motion } from "framer-motion"
import { Award } from "lucide-react"
import { Bolt } from "./ui-elements"

interface CompleteStepProps {
  confirmationMessage: string
}

export const CompleteStep = ({ confirmationMessage }: CompleteStepProps) => {
  return (
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
  )
};