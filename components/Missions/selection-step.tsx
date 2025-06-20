"use client"

import { motion } from "framer-motion"
import { ChevronRight, Power, Wifi, Database, Settings, BarChart3, Layers, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Structure } from "./types"
import { Card, CardContent, Bolt, StatusIndicator, DeviceButton } from "./ui-elements";
import { getDifficultyColor, getStructureStatusColor } from "./helpers"

interface SelectionStepProps {
  structures: Structure[]
  onStructureClick: (structure: Structure) => void
}

export const SelectionStep = ({ structures, onStructureClick }: SelectionStepProps) => {
  return (
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
            onClick={() => onStructureClick(structure)}
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
                    <span className={`text-sm font-semibold ${structure.iconColor}`}>{structure.specialty}</span>
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
  );
};