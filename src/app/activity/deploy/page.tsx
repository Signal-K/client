'use client'

import { useRouter } from "next/navigation"
import DeployTelescopeViewport from "@/src/components/scenes/deploy/TelescopeViewportRange"
import { useEffect, useState } from "react"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"

export default function NewDeployPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuthUser()
  const { isDark, toggleDarkMode } = UseDarkMode()
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user?.id) {
      router.replace('/auth');
      return;
    }

    const ensureProfile = async () => {
      try {
        const response = await fetch("/api/gameplay/profile/ensure", { method: "POST" });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          console.error("Error creating profile:", payload?.error || response.statusText);
        }
      } catch (error) {
        console.error("ensureProfile failed", error);
      } finally {
        setProfileChecked(true);
      }
    };

    ensureProfile();
  }, [isAuthLoading, router, user]);

  if (!profileChecked) {
    return (
      <div className={`h-screen w-full flex items-center justify-center ${
        isDark 
          ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
          : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
      } text-white text-lg`}>
        Preparing your profile...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
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
        <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
          <DeployTelescopeViewport />
        </div>
      </div>
    </div>
  );
};
