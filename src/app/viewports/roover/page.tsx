"use client"

import dynamic from "next/dynamic"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"

const RoverViewportSection = dynamic(
  () => import("@/src/components/scenes/deploy/Rover/RoverSection"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-slate-400">Loading rover viewport...</div>,
  }
);

export default function RoverViewportExpandedPage() {
    const { isDark, toggleDarkMode } = UseDarkMode();

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
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
            <div className="pt-20 h-screen">
                <div className="h-[calc(100vh-80px)] min-h-0 overflow-hidden">
                    <RoverViewportSection />
                </div>
            </div>
        </div>
    );
};
