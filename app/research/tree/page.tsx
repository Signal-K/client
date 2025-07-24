'use client'

import React, { useState, useEffect, useCallback } from "react"
import { Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SkillTree } from "@/components/Research/SkillTree/tree"
import { SkillIcons } from "@/components/Research/SkillTree/skill-node"
import { SkillTreeExpandedPanelOverlay } from "@/components/ui/panel-overlay"
import { SkillCategory, Skill } from "@/types/Reseearch/skill-tree"
import { isSkillUnlockable } from "@/utils/research/skill-utils"
import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { SkillTreeSection } from "@/components/Research/SkillTree/skill-tree-section"

interface ExpandedPanelState {
  type: "structures" | "notifications" | "discoveries" | "missions" | "tech_tree"
  data: any[] // The full data array for the specific panel
};

export default function SkillResearchPage() {
    const supabase = useSupabaseClient();
    const session = useSession()

  const [isDark, setIsDark] = useState(false)
  const [activeExpandedPanel, setActiveExpandedPanel] = useState<ExpandedPanelState | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true) // New loading state for auth
  const [classifiedPlanets, setClassifiedPlanets] = useState(0) // New state for classified planets
  const [discoveredAsteroids, setDiscoveredAsteroids] = useState(0) // New state for discovered asteroids
  const [loadingCounts, setLoadingCounts] = useState(true) // New loading state for counts
  const router = useRouter()

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDark])

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(prefersDark)
  }, [])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setIsAuthenticated(true)
      } else {
        router.push("/login")
      }
      setLoadingAuth(false)
    }
    checkAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push("/login")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  // Fetch classification counts
  const fetchClassificationCounts = useCallback(async () => {
    setLoadingCounts(true)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      const currentUserId = session?.user?.id

      if (!currentUserId) {
        console.warn("No user ID found. Classification count fetching skipped.")
        setLoadingCounts(false)
        return
      }

      // Fetch classified planets
      console.log("DEBUG: Fetching planets for user:", currentUserId, "with classificationtype: 'Planet'") // ADDED LOG
      const { count: planetCount, error: planetError } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", currentUserId)
        .eq("classificationtype", "planet") // Corrected to 'Planet'

      if (planetError) {
        console.error("Error fetching planet count:", planetError) // ADDED LOG
        throw planetError
      }
      setClassifiedPlanets(planetCount || 0)
      console.log("DEBUG: Classified Planets count:", planetCount) // ADDED LOG

      // Fetch discovered asteroids (using 'telescope-minorPlanet' as per schema)
      console.log(
        "DEBUG: Fetching asteroids for user:",
        currentUserId,
        "with classificationtype: 'telescope-minorPlanet'",
      ) // ADDED LOG
      const { count: asteroidCount, error: asteroidError } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", currentUserId)
        .eq("classificationtype", "telescope-minorPlanet")

      if (asteroidError) {
        console.error("Error fetching asteroid count:", asteroidError) // ADDED LOG
        throw asteroidError
      }
      setDiscoveredAsteroids(asteroidCount || 0)
      console.log("DEBUG: Discovered Asteroids count:", asteroidCount) // ADDED LOG
    } catch (error) {
      console.error("Error fetching classification counts:", error)
    } finally {
      setLoadingCounts(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchClassificationCounts()
    }
  }, [isAuthenticated, fetchClassificationCounts])

  const handleThemeToggle = () => {
    setIsDark((prev) => !prev)
  }

  const handleExpandPanel = (type: ExpandedPanelState["type"], data: any) => {
    setActiveExpandedPanel({ type, data })
  }

  const handleCloseExpandedPanel = () => {
    setActiveExpandedPanel(null)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error logging out:", error.message)
    } else {
      router.push("/login")
    }
  }

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">Redirecting to login...</div>
    )
  }

  if (!isAuthenticated) {
    return null // Or a loading spinner, as redirect is handled by useEffect
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Top Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 py-3 bg-card border-b border-border gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-chart-2" />
            <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
            <Moon className="w-4 h-4 text-chart-4" />
          </div>
            {/* Profile Dropdown Menu */}
            <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-accent text-sm font-medium transition-colors border border-border"
            aria-label="Back to Home"
            >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* User Classification Stats */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-center justify-around gap-4 text-sm">
          <div className="flex items-center gap-2 text-chart-2">
            <Globe className="w-5 h-5" />
            <span>Planets Classified:</span>
            <span className="font-bold text-lg">{loadingCounts ? "..." : classifiedPlanets}</span>
          </div>
          <div className="flex items-center gap-2 text-chart-3">
            <Moon className="w-5 h-5" />
            <span>Asteroids Discovered:</span>
            <span className="font-bold text-lg">{loadingCounts ? "..." : discoveredAsteroids}</span>
          </div>
        </div>

        <SkillTreeSection isFullTree={true} />
      </div>

      {/* Expanded Panel Overlay
      {activeExpandedPanel && (
        <SkillTreeExpandedPanelOverlay
          panelType={activeExpandedPanel.type}
          panelData={activeExpandedPanel.data}
          onClose={handleCloseExpandedPanel}
        />
      )} */}
    </div>
  )
};