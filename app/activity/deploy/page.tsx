'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import DeployTelescopeViewport from "@/src/components/ui/scenes/deploy/TelescopeViewportRange"
import { Button } from "@/src/components/ui/button"
import { useSession } from "@supabase/auth-helpers-react"
import { ArrowLeft, User, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/src/components/ui/switch"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"

export default function NewDeployPage() {
  const router = useRouter()
  const session = useSession()
  const { isDark, toggleDarkMode } = UseDarkMode()

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#002439] to-[#001a2a] overflow-hidden">
      <DeployTelescopeViewport />
    </div>
  );
};