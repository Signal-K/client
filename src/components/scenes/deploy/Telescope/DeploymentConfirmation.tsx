"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { CheckCircle, Telescope, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import React from "react"
import { useRouter } from "next/navigation"

export default function DeploymentConfirmation({
  deploymentResult,
  onClose,
}: {
  deploymentResult: { anomalies: string[]; sectorName: string }
  onClose: () => void
}) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-[#002439] border-2 border-[#78cce2] max-w-2xl w-full mx-4 shadow-2xl">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#78cce2] hover:bg-[#78cce2]/20 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[#002439]" />
            </div>
            <div>
              <CardTitle className="text-[#e4eff0] text-2xl">Telescope Deployed Successfully!</CardTitle>
              <CardDescription className="text-[#78cce2] text-base">
                Your telescope is now monitoring sector {deploymentResult.sectorName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[#005066]/30 p-6 rounded-lg border border-[#78cce2]/30">
            <div className="flex items-center gap-3 mb-4">
              <Telescope className="h-6 w-6 text-[#78cce2]" />
              <span className="text-[#e4eff0] font-medium text-lg">Active Monitoring Targets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deploymentResult.anomalies.map((name, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-[#002439]/50 rounded border border-[#78cce2]/20">
                  <span className="text-[#78cce2] text-sm font-mono">{name}</span>
                  <Badge className="bg-[#78cce2]/20 text-[#78cce2] text-xs">
                    ● Active
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#78cce2]/10 p-6 rounded-lg border border-[#78cce2]/30">
            <h3 className="text-[#e4eff0] font-medium text-lg mb-3">What happens next?</h3>
            <div className="space-y-3 text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span className="text-[#e4eff0]">Your telescope will continuously monitor <strong>{deploymentResult.anomalies.length}</strong> potential exoplanet candidates</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span className="text-[#e4eff0]">When planet transits are detected, you'll receive notifications</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span className="text-[#e4eff0]">Classify the discoveries in the telescope interface to help confirm exoplanets</span>
              </div>
            </div>
            <p className="text-[#78cce2] text-sm mt-4 text-center border-t border-[#78cce2]/20 pt-3">
              🚀 You'll be redirected to the main dashboard shortly...
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => router.push('/structures/telescope')}
              size="lg"
              className="flex-1 bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] h-12 text-base font-medium"
            >
              <Telescope className="h-5 w-5 mr-3" />
              View Telescope Interface
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="flex-1 border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/20 h-12 text-base"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
