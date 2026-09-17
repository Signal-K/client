'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { AvatarGenerator } from "@/components/Account/Avatar"
import DeployTelescopeViewport from "@/components/(scenes)/deploy/TelescopeViewportRange"
import { Button } from "@/components/ui/button"
import { useSession } from "@supabase/auth-helpers-react"

export default function NewDeployPage() {
  const router = useRouter()
  const session = useSession()

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#E5EEF4] to-[#D8E5EC] overflow-hidden">
      {/* Header */}
      <div className="relative h-[220px] w-full bg-black/70 flex items-center justify-between px-6">
        {/* Background image */}
        <Image
          src="/assets/Backdrops/Earth.png"
          alt="Cover"
          fill
          className="absolute inset-0 object-cover opacity-30"
        />
        {/* Foreground content */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden">
            <AvatarGenerator author={session?.user.id || ""} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Deploy Telescope</h2>
            <p className="text-sm text-white/80">TESS Mission Interface</p>
          </div>
        </div>
        <div className="relative z-10">
          <Button
            variant="outline"
            className="text-white border-white/70 bg-[#78cce2] hover:bg-white hover:text-[#002439]"
            onClick={() => router.push("/")}
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full overflow-y-auto">
        <DeployTelescopeViewport />
      </div>
    </div>
  )
};