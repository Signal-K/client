"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"

export default function TipsPanel() {
  const supabase = useSupabaseClient()
  const session = useSession()

  const [showTips, setShowTips] = useState(false)
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    if (!session) return

    const checkHasCommentsOrVotes = async () => {
      const userId = session.user.id

      const { data: comments } = await supabase
        .from("comments")
        .select("id")
        .eq("author", userId)
        .limit(1)

      const { data: votes } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", userId)
        .limit(1)

      const hasInteracted = (comments?.length ?? 0) > 0 || (votes?.length ?? 0) > 0
      setShowTips(!hasInteracted)
    }

    const updateCountdown = () => {
      const now = new Date()

      // Convert to Melbourne time (UTC+10 or UTC+11)
      const utcOffset = now.getTimezoneOffset() / -60 // e.g. +10 for AEST
      const melbourneOffset = 10 // Standard (no DST support needed unless you want it)

      const melbourneNow = new Date(now.getTime() + (melbourneOffset - utcOffset) * 60 * 60 * 1000)

      const melbourneDay = melbourneNow.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const melbourneHour = melbourneNow.getUTCHours()
      const melbourneMinute = melbourneNow.getUTCMinutes()

      let daysUntilMonday = (8 - melbourneDay) % 7
      if (daysUntilMonday === 0 && (melbourneHour < 0 || (melbourneHour === 0 && melbourneMinute < 1))) {
        daysUntilMonday = 7
      }

      const nextReset = new Date(melbourneNow)
      nextReset.setUTCDate(melbourneNow.getUTCDate() + daysUntilMonday)
      nextReset.setUTCHours(14) // Melbourne 00:01 = UTC 14:01
      nextReset.setUTCMinutes(1)
      nextReset.setUTCSeconds(0)
      nextReset.setUTCMilliseconds(0)

      const msRemaining = nextReset.getTime() - melbourneNow.getTime()
      const hours = Math.floor(msRemaining / (1000 * 60 * 60))
      const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))

      setCountdown(`${hours}h ${minutes}m`)
    }

    checkHasCommentsOrVotes()
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [session, supabase])

  if (!showTips) return null

  return (
    <aside className="w-full lg:w-80 mt-6 lg:mt-0 lg:absolute lg:right-6 lg:top-24 bg-[#edf3ff] border-4 border-indigo-400 p-5 rounded-3xl shadow-2xl space-y-5 text-indigo-900">
      <h2 className="text-xl font-black tracking-tight uppercase">🧭 Mission Tips</h2>
      <ul className="space-y-3 font-semibold text-sm list-disc pl-6">
        <li>💬 Comment & work with other users - unlock more telescope uses</li>
        <li>👍 Upvote discoveries — 3 votes = 1 deploy</li>
        <li>🔭 Help others to unlock more missions || Whatever content/milestones go here</li>
      </ul>
      <div className="text-xs font-bold text-indigo-800 border-t pt-2">
        ⏳ New missions in: <span className="text-indigo-600">{countdown}</span>
      </div>
    </aside>
  );
};