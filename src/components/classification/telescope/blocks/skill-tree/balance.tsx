"use client"

import { Badge } from "@/src/components/ui/badge"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

interface StardustBalanceProps {
  userId: string
  onBalanceUpdate?: (balance: number) => void
}

export function StardustBalance({ userId: _userId, onBalanceUpdate }: StardustBalanceProps) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchBalance() {
      setLoading(true)
      try {
        const res = await fetch("/api/gameplay/research/summary")
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || "Failed to load stardust balance")

        const computedBalance = Number(payload?.availableStardust || 0)
        if (!cancelled) {
          setBalance(computedBalance)
          onBalanceUpdate?.(computedBalance)
        }
      } catch (error) {
        console.error("Error fetching stardust balance:", error)
        if (!cancelled) {
          setBalance(0)
          onBalanceUpdate?.(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchBalance()
    return () => {
      cancelled = true
    }
  }, [onBalanceUpdate])

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
}

