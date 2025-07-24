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

export default function NewDeployPage() {
  const router = useRouter()
  const session = useSession()
  const [isDark, setIsDark] = useState(false)

  const handleThemeToggle = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark", !isDark)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#E5EEF4] to-[#D8E5EC] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-6 py-3 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-md hover:bg-muted transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-chart-2" />
              <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
              <Moon className="w-4 h-4 text-chart-4" />
            </div>
            <div className="relative h-8 w-8 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-chart-3" />
              <span className="sr-only">User Menu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto pt-14">
        <DeployTelescopeViewport />
      </div>
    </div>
  );
};