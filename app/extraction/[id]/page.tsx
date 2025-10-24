"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ExtractionScene } from "@/src/components/deployment/extraction/ex-scene"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"

export default function ExtractionPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()

  const [deposit, setDeposit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      // Add to user inventory
      const { error: inventoryError } = await supabase.from("user_inventory").insert({
        user_id: session.user.id,
        item_id: deposit.mineralconfiguration.type,
        quantity: extractedQuantity,
        purity: purity,
        source_deposit: deposit.id,
        acquired_at: new Date().toISOString(),
      })

      if (inventoryError) {
        console.error("Error adding to inventory:", inventoryError)
        // If table doesn't exist, we'll handle gracefully
      }

      // Mark deposit as extracted (optional - could add an 'extracted' column)
      // For now, just navigate back
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      console.error("Error completing extraction:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading mineral deposit...</p>
        </div>
      </div>
    )
  }

  if (error || !deposit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
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
  )
};