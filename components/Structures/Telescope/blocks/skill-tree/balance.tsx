"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

interface StardustBalanceProps {
  userId: string
  onBalanceUpdate?: (balance: number) => void
};

interface TotalPointsRef {
  refreshPoints: () => void
  totalPoints: number
};

const TotalPoints = forwardRef<TotalPointsRef, { onPointsUpdate?: (points: number) => void; userId: string }>(
  (props, ref) => {
    const { onPointsUpdate, userId } = props
    const supabase = useSupabaseClient()
    const [planetHuntersPoints, setPlanetHuntersPoints] = useState(0)
    const [dailyMinorPlanetPoints, setDailyMinorPlanetPoints] = useState(0)
    const [ai4mPoints, setAi4mPoints] = useState(0)
    const [planetFourPoints, setPlanetFourPoints] = useState(0)
    const [jvhPoints, setJvhPoints] = useState(0)
    const [planktonPoints, setPlanktonPoints] = useState(0)
    const [cloudspottingPoints, setCloudspottingPoints] = useState(0)
    const [milestonePoints, setMilestonePoints] = useState(0)
    const [researchedPenalty, setResearchedPenalty] = useState(0)
    const [referralPoints, setReferralPoints] = useState(0)
    const [loading, setLoading] = useState(true)

    const totalPoints =
      planetHuntersPoints +
      dailyMinorPlanetPoints +
      ai4mPoints +
      planetFourPoints +
      jvhPoints +
      cloudspottingPoints +
      planktonPoints +
      milestonePoints +
      referralPoints -
      researchedPenalty

    useImperativeHandle(ref, () => ({
      refreshPoints: fetchAllPoints,
      totalPoints,
    }))

    const fetchReferralPoints = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single()

      if (profileError || !profileData?.referral_code) {
        setReferralPoints(0)
        return
      }

      const referralCode = profileData.referral_code

      const { count: referralsCount, error: referralCountError } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referral_code", referralCode)

      if (referralCountError) {
        setReferralPoints(0)
        return
      }

      const points = (referralsCount || 0) * 5
      setReferralPoints(points)
    }

    const fetchAllPoints = async () => {
      setLoading(true)

      const fetchResearchedPenalty = async () => {
        const { data, error } = await supabase.from("researched").select("*").eq("user_id", userId)
        if (error) return
        setResearchedPenalty((data?.length || 0) * 2)
      }

      const fetchPlanetHuntersPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", userId)

        const missionPoints = { 1: 2, 2: 1, 3: 2, 4: 1, 5: 1 }
        const mission1 = classifications?.length || 0
        const mission2 =
          classifications?.filter((c) => {
            const options = c.classificationConfiguration?.classificationOptions?.[""] || {}
            return !options["1"] && (options["2"] || options["3"] || options["4"])
          }).length || 0

        const { data: comments } = await supabase.from("comments").select("*").eq("author", userId)
        const mission3 = comments?.filter((c) => c.configuration?.planetType).length || 0

        const { data: votes } = await supabase.from("votes").select("*").eq("user_id", userId)
        const mission4 =
          votes?.filter((vote) => classifications?.some((c) => c.id === vote.classification_id)).length || 0

        const mission5 =
          comments?.filter(
            (comment) => comment.classification_id && classifications?.some((c) => c.id === comment.classification_id),
          ).length || 0

        const total =
          mission1 * missionPoints[1] +
          mission2 * missionPoints[2] +
          mission3 * missionPoints[3] +
          mission4 * missionPoints[4] +
          mission5 * missionPoints[5]

        setPlanetHuntersPoints(total)
      }

      const fetchDailyMinorPlanetPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("classificationtype", "telescope-minorPlanet")
          .eq("author", userId)

        const mission1 = classifications?.length || 0
        const mission2 =
          classifications?.filter((c) => {
            const options = c.classificationConfiguration?.classificationOptions?.[""] || {}
            return ["2", "3", "4"].some((opt) => options[opt]) && !options["1"]
          }).length || 0

        const { data: comments } = await supabase.from("comments").select("classification_id").eq("author", userId)
        const { data: votes } = await supabase.from("votes").select("classification_id").eq("user_id", userId)

        const ids = new Set(classifications?.map((c) => c.id))
        const mission3 =
          (comments?.filter((c) => ids.has(c.classification_id)).length || 0) +
          (votes?.filter((v) => ids.has(v.classification_id)).length || 0)

        const mission4 =
          classifications?.filter((c) => {
            const count = votes?.filter((v) => v.classification_id === c.id).length || 0
            return count > 4
          }).length || 0

        const total = mission1 * 2 + mission2 * 1 + mission3 * 1 + mission4 * 3
        setDailyMinorPlanetPoints(total)
      }

      const fetchAi4MPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", userId)
          .eq("classificationtype", "automaton-aiForMars")

        const { data: comments } = await supabase.from("comments").select("classification_id").eq("author", userId)

        const ids = classifications?.map((c) => c.id) || []
        const mission2 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0

        setAi4mPoints((classifications?.length || 0) + mission2)
      }

      const fetchPlanetFourPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "satellite-planetFour")
          .eq("author", userId)

        const { data: comments } = await supabase.from("comments").select("*").eq("author", userId)

        const mission1 = classifications?.length || 0
        const mission2 =
          comments?.filter((comment) => classifications?.some((c) => c.id === comment.classification_id)).length || 0

        setPlanetFourPoints(mission1 * 2 + mission2 * 2)
      }

      const fetchJvhPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", userId)
          .eq("classificationtype", "lidar-jovianVortexHunter")

        const { data: comments } = await supabase.from("comments").select("classification_id").eq("author", userId)

        const ids = classifications?.map((c) => c.id) || []
        const mission2 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0

        setJvhPoints((classifications?.length || 0) + mission2)
      }

      const fetchCloudspottingPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("author", userId)
          .eq("classificationtype", "cloud")

        const mission1 = classifications?.length || 0
        const mission2 =
          classifications?.filter((c) => {
            const options = c.classificationConfiguration?.classificationOptions?.[""] || {}
            return Object.values(options).some((v) => v === true)
          }).length || 0

        const { data: comments } = await supabase.from("comments").select("classification_id").eq("author", userId)

        const ids = classifications?.map((c) => c.id) || []
        const mission3 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0

        setCloudspottingPoints(mission1 + mission2 + mission3)
      }

      await Promise.all([
        fetchResearchedPenalty(),
        fetchPlanetHuntersPoints(),
        fetchDailyMinorPlanetPoints(),
        fetchAi4MPoints(),
        fetchPlanetFourPoints(),
        fetchJvhPoints(),
        fetchCloudspottingPoints(),
        fetchReferralPoints(),
      ])

      setLoading(false)
    }

    useEffect(() => {
      if (!userId) return
      fetchAllPoints()
    }, [userId, supabase])

    useEffect(() => {
      if (onPointsUpdate && !loading) {
        onPointsUpdate(totalPoints)
      }
    }, [totalPoints, loading, onPointsUpdate])

    return null
  },
)

TotalPoints.displayName = "TotalPoints"

export function StardustBalance({ userId, onBalanceUpdate }: StardustBalanceProps) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchStardustBalance()
  }, [userId])

  const fetchStardustBalance = async () => {
    setLoading(true)
    try {
      // This is a simplified version - you would integrate with your actual points system
      // For now, we'll calculate based on classifications
      const { data: classifications } = await supabase
        .from("classifications")
        .select("classificationtype")
        .eq("author", userId)

      // Simple calculation: 10 stardust per classification
      const calculatedBalance = (classifications?.length || 0) * 10

      setBalance(calculatedBalance)
      onBalanceUpdate?.(calculatedBalance)
    } catch (error) {
      console.error("Error fetching stardust balance:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Badge className="bg-[#4e7988]/50 text-[#78cce2] font-mono animate-pulse">
        <Sparkles className="h-4 w-4 mr-1" />
        Loading...
      </Badge>
    )
  }

  return (
    <Badge className="bg-[#78cce2]/20 text-[#78cce2] font-mono text-lg px-3 py-1">
      <Sparkles className="h-5 w-5 mr-2" />
      {balance.toLocaleString()} STARDUST
    </Badge>
  )
};