"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Bolt } from "./ui-elements"

export const IntroStep = () => {
  return (
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
  )
};