"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/context/ActivePlanet"

import { IntroStep } from "./intro-step"
import { SelectionStep } from "./selection-step"
import { MissionStep } from "./mission-step"
import { ConfirmationStep } from "./confirmation"
import { CompleteStep } from "./completed"
import { structures, projects } from "./structures"
import type { Structure, Mission } from "./types"

type Step = "intro" | "referral" | "selection" | "mission" | "confirmation" | "complete"

export default function MissionSelector() {
  const { activePlanet, updatePlanetLocation } = useActivePlanet()
  const supabase = useSupabaseClient()
  const session = useSession()

  const [currentStep, setCurrentStep] = useState<Step>("intro")
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // New referral code state
  const [referralCode, setReferralCode] = useState("")
  const [referralError, setReferralError] = useState<string | null>(null)
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep("referral")
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Handle referral code submit
  const handleReferralSubmit = async () => {
    if (!session || !referralCode.trim()) {
      setReferralError("Please enter a valid referral code or skip.")
      return
    }

    setIsSubmittingReferral(true)
    setReferralError(null)

    try {
      const { error } = await supabase.from("referrals").insert({
        referree_id: session.user.id,
        referral_code: referralCode.trim(),
      })

      if (error) {
        setReferralError("Failed to submit referral code. Please try again.")
        setIsSubmittingReferral(false)
        return
      }

      // Success, move to selection step
      setCurrentStep("selection")
    } catch (e) {
      setReferralError("An unexpected error occurred.")
      setIsSubmittingReferral(false)
    }
  }

  // Skip referral step
  const handleReferralSkip = () => {
    setReferralCode("")
    setReferralError(null)
    setCurrentStep("selection")
  }

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

  // Referral step UI
  const ReferralStep = () => (
    <div className="max-w-md mx-auto p-6 bg-[#2E3440] rounded-md border border-[#5E81AC] shadow-md">
      <h2 className="text-xl font-bold text-[#81A1C1] mb-4">Referral Code</h2>
      <p className="text-[#D8DEE9] mb-4">
        If you have a referral code, please enter it below. Otherwise, you can skip this step.
      </p>
      <input
        type="text"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
        placeholder="Enter referral code"
        className="w-full mb-2 px-3 py-2 rounded border border-[#81A1C1] bg-[#3B4252] text-[#ECEFF4] focus:outline-none focus:ring-2 focus:ring-[#88C0D0]"
        disabled={isSubmittingReferral}
      />
      {referralError && (
        <p className="text-red-400 mb-2">{referralError}</p>
      )}
      <div className="flex justify-between">
        <button
          onClick={handleReferralSkip}
          disabled={isSubmittingReferral}
          className="px-4 py-2 rounded bg-transparent border border-[#81A1C1] text-[#81A1C1] hover:bg-[#81A1C1] hover:text-[#2E3440] transition"
        >
          Skip
        </button>
        <button
          onClick={handleReferralSubmit}
          disabled={isSubmittingReferral}
          className="px-4 py-2 rounded bg-[#81A1C1] text-[#2E3440] hover:bg-[#88C0D0] transition"
        >
          {isSubmittingReferral ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative">
      {/* Subtle background elements */}
      <div className="squiggly-shape sci-fi-shape-1 bg-primary/5"></div>
      <div className="squiggly-shape sci-fi-shape-2 bg-accent/5"></div>
      <div className="squiggly-shape sci-fi-shape-3 bg-secondary/5"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {currentStep === "intro" && <IntroStep />}

          {/* Referral Step */}
          {currentStep === "referral" && <ReferralStep />}

          {/* Selection Step */}
          {currentStep === "selection" && (
            <SelectionStep structures={structures} onStructureClick={handleStructureClick} />
          )}

          {/* Mission Selection Step */}
          {currentStep === "mission" && selectedStructure && (
            <MissionStep
              selectedStructure={selectedStructure}
              projects={projects}
              onMissionClick={handleMissionClick}
              onBack={handleBack}
            />
          )}

          {/* Confirmation Step */}
          {currentStep === "confirmation" && selectedMission && selectedStructure && (
            <ConfirmationStep
              selectedMission={selectedMission}
              selectedStructure={selectedStructure}
              isLoading={isLoading}
              onConfirm={handleConfirmMission}
              onBack={handleBack}
            />
          )}

          {/* Complete Step */}
          {currentStep === "complete" && <CompleteStep confirmationMessage={confirmationMessage} />}
        </AnimatePresence>
      </div>
    </div>
  )
};