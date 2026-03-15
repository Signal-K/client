'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import ViewportShell from "@/src/components/layout/ViewportShell"
import DeployTelescopeViewport from "@/src/components/scenes/deploy/TelescopeViewportRange"

export default function NewDeployPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuthUser()
  const { isDark } = UseDarkMode()
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user?.id) { router.replace('/auth'); return; }

    fetch("/api/gameplay/profile/ensure", { method: "POST" })
      .catch(() => {})
      .finally(() => setProfileChecked(true));
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
    <ViewportShell>
      <DeployTelescopeViewport />
    </ViewportShell>
  );
}
