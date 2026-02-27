"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import PlanetViewer from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/planetViewer"
import { type PlanetConfig, defaultPlanetConfig } from "@/src/components/discovery/planets/planet-config"
import SettingsPanel from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/SettingsPanel"
import { Button } from "@/src/components/ui/button"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"

export default function PlanetGeneratorPage() {
  const router = useRouter()
  const params = useParams()
  const planetId = params?.id as string | undefined;

  const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDark, toggleDarkMode } = UseDarkMode()

  const handleConfigChange = (newConfig: Partial<PlanetConfig>) => {
    setPlanetConfig((prev) => ({ ...prev, ...newConfig }))
  }

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!planetId) {
        setError("No planet ID provided.")
        setLoading(false)
        return
      }

      try {
        const idAsNumber = Number.parseInt(planetId)
        if (isNaN(idAsNumber)) {
          throw new Error("Invalid planet ID")
        }

        const response = await fetch(`/api/gameplay/classifications/${idAsNumber}`, {
          cache: "no-store",
        })
        const payload = await response.json().catch(() => null)
        if (!response.ok || !payload?.classification) {
          throw new Error(payload?.error ?? "Failed to load planet data")
        }

        const data = payload.classification

        if (!data) {
          throw new Error("Planet not found")
        }

        let config = data.classificationConfiguration

        // Ensure it's parsed if Supabase returned it as a string
        if (typeof config === "string") {
          try {
            config = JSON.parse(config)
          } catch (err) {
            console.warn("Failed to parse classificationConfiguration JSON string:", err)
            config = {}
          }
        }

        if (config?.planetConfiguration) {
          setPlanetConfig(config.planetConfiguration)
        } else {
          console.log("No planetConfiguration found, using default.")
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching planet data:", err)
        setError(err instanceof Error ? err.message : "Failed to load planet data")
      } finally {
        setLoading(false)
      }
    }

    fetchPlanetData()
  }, [planetId])

  // Hide sidebar for this page
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidebar:collapse", { detail: { collapsed: true } }));
      window.localStorage.setItem("hideSidebar", "true");
    }
    return () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("hideSidebar");
        window.dispatchEvent(new CustomEvent("sidebar:collapse", { detail: { collapsed: false } }));
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center text-white">
        <div className="fixed inset-0 -z-10">
          <TelescopeBackground
            sectorX={0}
            sectorY={0}
            showAllAnomalies={false}
            isDarkTheme={isDark}
            variant="stars-only"
            onAnomalyClick={() => {}}
          />
        </div>
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={false}
          onToggleNotifications={() => {}}
          activityFeed={[]}
          otherClassifications={[]}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p>Loading planet data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center text-white">
        <div className="fixed inset-0 -z-10">
          <TelescopeBackground
            sectorX={0}
            sectorY={0}
            showAllAnomalies={false}
            isDarkTheme={isDark}
            variant="stars-only"
            onAnomalyClick={() => {}}
          />
        </div>
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={false}
          onToggleNotifications={() => {}}
          activityFeed={[]}
          otherClassifications={[]}
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />
      <div className="flex flex-col md:flex-row w-full h-full pt-20">
        {/* Planet Viewer */}
        <div className="w-full md:flex-1 h-1/2 md:h-full">
          <PlanetViewer planetConfig={planetConfig} onConfigChange={handleConfigChange} />
        </div>

        {/* Settings Panel */}
        <div className="w-full md:w-[400px] h-1/2 md:h-full border-t md:border-t-0 md:border-l border-gray-200 bg-slate-900 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-100">Planet Settings</h2>
              <span className="text-slate-400 text-sm">ID: {planetId}</span>
            </div>
            <SettingsPanel
              planetConfig={planetConfig}
              onChange={handleConfigChange}
              classificationId={Number.parseInt(planetId ?? "0")}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#D8DEE9] pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => router.push(`/structures/telescope`)}>
                  🧬 Back to Telescope
                </Button>
                <Button variant="ghost" onClick={() => router.push("/")}> 
                  🏠 Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
