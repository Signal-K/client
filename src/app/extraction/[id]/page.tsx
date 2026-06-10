"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ExtractionScene } from "@/src/components/deployment/extraction/ex-scene"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import UseDarkMode from "@/src/hooks/useDarkMode"
import { usePageData } from "@/src/hooks/usePageData"
import { getExtractionDepositAction, completeExtractionAction } from "@/src/app/actions/gameplay";

export default function ExtractionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthUser()
  const { isDark, toggleDarkMode } = UseDarkMode()
  const { activityFeed, otherClassifications } = usePageData()

  const [deposit, setDeposit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    async function fetchDeposit() {
      if (!params.id) return

      try {
        const result = await getExtractionDepositAction(Number(params.id));
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDeposit(result.deposit ?? null);
      } catch (err) {
        console.error("Error fetching deposit:", err)
        setError("Failed to load mineral deposit")
      } finally {
        setLoading(false)
      }
    }

    fetchDeposit()
  }, [params.id, user])

  const handleExtractionComplete = async (extractedQuantity: number, purity: number) => {
    if (!user?.id || !deposit) return

    try {
      const result = await completeExtractionAction({ depositId: deposit.id, extractedQuantity, purity });
      if (!result.ok) {
        console.error("Error adding to mineral inventory:", result.error);
        alert("Failed to save to inventory. Please try again.");
        return
      }

      setTimeout(() => { router.push("/inventory") }, 3000)
    } catch (err) {
      console.error("Error completing extraction:", err)
      alert("An unexpected error occurred. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((open) => !open)}
          activityFeed={activityFeed}
          otherClassifications={otherClassifications}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading mineral deposit...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !deposit) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((open) => !open)}
          activityFeed={activityFeed}
          otherClassifications={otherClassifications}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive text-lg">{error || "Deposit not found"}</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Determine project type from mineral configuration
  const mineralType = deposit.mineral_configuration.type
  let projectType: "P4" | "cloudspotting" | "JVH" | "AI4M" = "AI4M"

  if (["dust", "soil", "water-vapour"].includes(mineralType)) {
    projectType = "P4"
  } else if (["water-ice", "co2-ice"].includes(mineralType)) {
    projectType = "cloudspotting"
  } else if (["metallic-hydrogen", "metallic-helium", "methane", "ammonia"].includes(mineralType)) {
    projectType = "JVH"
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />
      <div className="flex-1 overflow-y-auto pt-16">
        <ExtractionScene
          id={deposit.id}
          mineralConfiguration={deposit.mineral_configuration}
          location={deposit.location}
          discoveryId={deposit.discovery}
          roverName={deposit.rover_name}
          projectType={projectType}
          onExtractionComplete={handleExtractionComplete}
        />
      </div>
    </div>
  )
};
