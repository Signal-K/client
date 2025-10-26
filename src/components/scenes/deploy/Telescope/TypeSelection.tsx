"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Telescope, Sun, Target, Info, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import React, { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export default function TypeSelection({
  onChooseType,
  onBack,
  session,
}: {
  onChooseType: (t: "stellar" | "planetary") => void
  onBack: () => void
  session?: any
}) {
  const supabase = useSupabaseClient()
  const [hasNGTSAccess, setHasNGTSAccess] = useState(false)

  useEffect(() => {
    const checkNGTSAccess = async () => {
      if (!session?.user?.id) return
      
      const { data } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id)
        .eq("tech_type", "ngtsAccess")
        .single()
      
      setHasNGTSAccess(!!data)
    }
    
    checkNGTSAccess()
  }, [session, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#002439] to-[#001a2a] flex items-center justify-center p-2 sm:p-4 py-4 sm:py-8 overflow-y-auto">
      <Card className="bg-[#002439]/95 border-2 border-[#78cce2] max-w-5xl w-full shadow-2xl backdrop-blur-sm my-2">
        <CardHeader className="text-center pb-3 sm:pb-6 px-3 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <Telescope className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-[#002439]" />
          </div>
          <CardTitle className="text-[#e4eff0] text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">Choose Your Mission Focus</CardTitle>
          <CardDescription className="text-[#78cce2] text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-snug sm:leading-relaxed px-2">
            Configure your telescope to specialize in different cosmic objects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-6 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <Card className="bg-[#005066]/30 border-2 border-[#ff6b6b]/40 hover:border-[#ff6b6b]/80 transition-all duration-300 cursor-pointer group hover:bg-[#005066]/50" 
                  onClick={() => onChooseType("stellar")}>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#ff6b6b] to-[#e55555] rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Sun className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-[#e4eff0] text-base sm:text-lg md:text-xl flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-3">
                  <span>Stellar Objects</span>
                  <Badge className="bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/40 self-start sm:self-auto text-xs">
                    Advanced
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[#ff6b6b] text-xs sm:text-sm">
                  Focus on stars and stellar phenomena
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                    <span>Circumstellar disks and debris</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                    <span>Protoplanetary structures</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                    <span>Stellar formation regions</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                    <span>Binary star interactions</span>
                  </div>
                </div>
                
                <div className="bg-[#ff6b6b]/10 p-2 sm:p-3 rounded-lg border border-[#ff6b6b]/20 mt-2 sm:mt-3">
                  <div className="text-[#ff6b6b] text-xs font-medium mb-0.5 sm:mb-1">🔬 RESEARCH FOCUS</div>
                  <div className="text-[#e4eff0] text-xs leading-snug sm:leading-relaxed">
                    Help astronomers understand star formation and stellar system evolution.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#005066]/30 border-2 border-[#78cce2]/40 hover:border-[#78cce2]/80 transition-all duration-300 cursor-pointer group hover:bg-[#005066]/50"
                  onClick={() => onChooseType("planetary")}>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#002439]" />
                </div>
                <CardTitle className="text-[#e4eff0] text-base sm:text-lg md:text-xl flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-3">
                  <span>Planetary Objects</span>
                  <Badge className="bg-[#78cce2]/20 text-[#78cce2] border border-[#78cce2]/40 self-start sm:self-auto text-xs">
                    Popular
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[#78cce2] text-xs sm:text-sm">
                  Hunt for exoplanets and asteroids
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                    <span>Exoplanet transit detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                    <span>Minor planet identification</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                    <span>Active asteroid tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4eff0]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                    <span>Planetary system analysis</span>
                  </div>
                </div>
                
                <div className="bg-[#78cce2]/10 p-2 sm:p-3 rounded-lg border border-[#78cce2]/20 mt-2 sm:mt-3">
                  <div className="text-[#78cce2] text-xs font-medium mb-0.5 sm:mb-1">🪐 DISCOVERY MISSION</div>
                  <div className="text-[#e4eff0] text-xs leading-snug sm:leading-relaxed">
                    Search for potentially habitable worlds and catalog small bodies.
                  </div>
                </div>

                {hasNGTSAccess && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2 sm:p-3 rounded-lg border border-purple-400/30 mt-2 sm:mt-3 animate-pulse-subtle">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <div className="text-purple-400 text-xs font-medium">NGTS DATA UNLOCKED</div>
                    </div>
                    <div className="text-[#e4eff0] text-xs leading-snug sm:leading-relaxed">
                      Access to Next-Generation Transit Survey data from ESO's robotic telescope array in Chile. High-precision exoplanet transit measurements now available for mass and composition analysis.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#005066]/20 p-3 sm:p-4 md:p-6 rounded-xl border border-[#78cce2]/30">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#78cce2]/20 rounded-full flex items-center justify-center">
                <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-[#78cce2]" />
              </div>
              <h3 className="text-[#e4eff0] text-sm sm:text-base md:text-lg font-medium">Mission Information</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
              <div className="text-center">
                <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">⏱️</div>
                <div className="text-[#e4eff0] leading-tight">1 week monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">🎯</div>
                <div className="text-[#e4eff0] leading-tight">4 selected objects</div>
              </div>
              <div className="text-center">
                <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">📊</div>
                <div className="text-[#e4eff0] leading-tight">Real science</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2 sm:pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/20 text-sm h-9 sm:h-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
