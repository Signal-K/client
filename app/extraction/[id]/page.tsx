"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ExtractionScene } from "@/src/components/deployment/extraction/ex-scene"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { usePageData } from "@/hooks/usePageData"

export default function ExtractionPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()
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
        const { data, error } = await supabase.from("mineralDeposits").select("*").eq("id", params.id).single()

        if (error) throw error

        if (!data) {
          setError("Mineral deposit not found")
          return
        }

        // Check if user owns this deposit
        if (session?.user?.id && data.owner !== session.user.id) {
          setError("You don't have permission to extract this deposit")
          return
        }

        setDeposit(data)
      } catch (err) {
        console.error("Error fetching deposit:", err)
        setError("Failed to load mineral deposit")
      } finally {
        setLoading(false)
      }
    }

    fetchDeposit()
  }, [params.id, supabase, session])

  const handleExtractionComplete = async (extractedQuantity: number, purity: number) => {
    if (!session?.user?.id || !deposit) return

    try {
      // Add to user mineral inventory (extracted but unprocessed resources)
      const { error: inventoryError } = await supabase.from("user_mineral_inventory").insert({
        user_id: session.user.id,
        mineral_deposit_id: deposit.id,
        mineral_type: deposit.mineralconfiguration.type,
        quantity: extractedQuantity,
        purity: purity,
        extracted_at: new Date().toISOString(),
      })

      if (inventoryError) {
        console.error("Error adding to mineral inventory:", inventoryError)
        // Show error to user but don't block navigation
        alert("Failed to save to inventory. Please try again.")
        return
      }

      // Drain the deposit quantity to 0 in mineralDeposits table
      const updatedConfig = {
        ...deposit.mineralconfiguration,
        amount: 0,
        quantity: 0,
      }

      const { error: updateError } = await supabase
        .from("mineralDeposits")
        .update({ mineralconfiguration: updatedConfig })
        .eq("id", deposit.id)

      if (updateError) {
        console.error("Error updating deposit quantity:", updateError)
        // Continue anyway since the extraction was recorded
      }

      // Successfully extracted - navigate back after delay
      setTimeout(() => {
        router.push("/inventory")
      }, 3000)
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
  const mineralType = deposit.mineralconfiguration.type
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
          mineralConfiguration={deposit.mineralconfiguration}
          location={deposit.location}
          discoveryId={deposit.discovery}
          roverName={deposit.roverName}
          projectType={projectType}
          onExtractionComplete={handleExtractionComplete}
        />
      </div>
    </div>
  )
};