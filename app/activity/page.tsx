"use client"

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronRight,
  Gift,
  BrainCircuit,
  Zap,
} from "lucide-react"
import { AvatarGenerator } from "@/components/Account/Avatar"

interface Classification {
  id: number
  content: string | null
  created_at: string
  anomaly: number | null
  classificationtype: string
  author: string
}

interface Anomaly {
  id: number
  content: string | null
  anomalytype: string | null
}

interface Profile {
  id: string
  username: string
  location: number | null
  classificationPoints: number | null
}

export default function ProfileScreen() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [latestClassification, setLatestClassification] = useState<Classification | null>(null)
  const [recentAnomalies, setRecentAnomalies] = useState<Anomaly[]>([])

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, location, classificationPoints")
        .eq("id", session.user.id)
        .maybeSingle()

      setProfile(profileData)

      const { data: classifications } = await supabase
        .from("classifications")
        .select("*")
        .eq("author", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (classifications && classifications.length > 0) {
        setLatestClassification(classifications[0])
      }

      const classifiedIds = new Set(classifications?.map((c) => c.anomaly))

      const { data: anomalies } = await supabase
        .from("linked_anomalies")
        .select("anomaly(id, content, anomalytype)")
        .eq("author", session.user.id)

      if (anomalies) {
        const unclassified = anomalies
          .map((a: any) => Array.isArray(a.anomaly) ? a.anomaly[0] : a.anomaly)
          .filter((a: Anomaly) => a && !classifiedIds.has(a.id))
        setRecentAnomalies(unclassified)
      }
    }

    fetchData()
  }, [session])

  const backgroundImage = "/assets/Backdrops/Earth.png"

  return (
    <div className="h-screen w-full overflow-hidden text-foreground bg-gradient-to-b from-[#E5EEF4] to-[#D8E5EC] flex flex-col">
      {/* Top: Profile Section with Earth Background */}
      <div className="relative h-[220px] flex items-center px-6 bg-black/70">
        <Image
          src={backgroundImage}
          alt="Location Background"
          fill
          className="absolute inset-0 object-cover opacity-30"
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-white">
            <AvatarGenerator author={session?.user.id || ""} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.username ?? "Star Sailor"}</h2>
            <p className="text-muted-foreground text-sm">
              {profile?.classificationPoints ?? 0} Classification Points
            </p>
            {latestClassification && (
              <Link
                href={`/posts/${latestClassification.id}`}
                className="inline-flex items-center text-sm text-primary mt-1 hover:underline"
              >
                View your latest classification
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Panels */}
      <div className="flex-1 grid grid-rows-3 px-6 py-4 gap-4 max-h-[calc(100vh-220px)]">
        {/* Unclassified Discoveries */}
        <div className="bg-surface/80 rounded-lg shadow-md p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-accent w-5 h-5" />
            <h3 className="font-semibold text-lg">Unclassified Discoveries</h3>
          </div>
          {recentAnomalies.length > 0 ? (
            <ul className="space-y-1 text-sm overflow-auto">
              {recentAnomalies.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  className="p-2 bg-muted/10 rounded border border-border"
                >
                  <strong>{a.anomalytype}</strong>: {a.content ?? "No details"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No new anomalies awaiting classification.
            </p>
          )}
        </div>

        {/* Tech Tree */}
        <div className="bg-surface/80 rounded-lg shadow-md p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="text-info w-5 h-5" />
            <h3 className="font-semibold text-lg">Tech Tree</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="rounded bg-muted/10 px-2 py-1">🛰️ Starship Sensors</div>
            <div className="rounded bg-muted/10 px-2 py-1">🔬 Spectral Analysis</div>
            <div className="rounded bg-muted/10 px-2 py-1">🧠 Emergent Cognition</div>
          </div>
        </div>

        {/* Referral Program */}
        <div className="bg-surface/80 rounded-lg shadow-md p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-success w-5 h-5" />
            <h3 className="font-semibold text-lg">Referral Program</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Share your referral code to earn stardust when new explorers join.
          </p>
          <Link
            href="/referrals"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            View referral code
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}