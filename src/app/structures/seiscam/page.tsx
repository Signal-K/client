'use client'

import React, { useEffect } from "react"
import { useSession } from "@/src/lib/auth/session-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import {
  BuildingIcon,
  CameraOffIcon,
  MicroscopeIcon,
  RssIcon,
} from "lucide-react"
import MainHeader from "@/src/components/layout/Header/MainHeader"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"

export default function SeiscamOnEarthPage() {
  const router = useRouter()
  const session = useSession()
  const { isDark, toggleDarkMode } = UseDarkMode()

  // useEffect(() => {
  //   if (!session) {
  //     router.push("/")
  //   }
  // }, [session, router])

  const actions = [
    {
      icon: <MicroscopeIcon className="w-6 h-6 text-[#B48EAD]" />,
      text: "Research",
      href: "/research",
    },
  ]

  const buttons = [
    {
      icon: <RssIcon className="w-6 h-6 text-[#D08770]" />,
      text: "Identify landmarks on terrestrial planets",
      href: "/structures/balloon/landmarks",
    },
    {
      icon: <CameraOffIcon className="w-6 h-6 text-[#EBCB8B]" />,
      text: "Map the surface of planets",
      href: "/structures/balloon/surface",
    },
  ]

  return (
    <div className="relative min-h-screen w-full">
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

      <div className="pt-20 flex flex-row space-y-4">
        <Dialog
          defaultOpen
          onOpenChange={(open) => {
            if (!open) {
              router.push("/")
            }
          }}
        >
          <DialogContent
            className="p-6 rounded-3xl text-white max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col justify-start"
            style={{
              background:
                "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))",
              color: "#2E3440",
            }}
          >
            <div className="flex-grow overflow-y-auto w-full">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                  <h1 className="text-2xl font-bold text-[#2E3440]">SEISCAM</h1>
                </div>

                <img
                  src="/assets/Items/miningstation.png"
                  alt="Weather Balloon"
                  className="w-20 h-20"
                  width="80"
                  height="80"
                  style={{ aspectRatio: "80/80", objectFit: "cover" }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center my-4 space-x-4">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => router.push(action.href)}
                  >
                    {action.icon}
                    <p className="text-xs text-[#4C566A]">{action.text}</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center my-4 space-y-4">
                {buttons.map((button, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center bg-[#D8DEE9]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#E5E9F0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81A1C1] cursor-pointer"
                    onClick={() => router.push(button.href)}
                    style={{ width: "100%", maxWidth: "240px" }}
                  >
                    <div className="flex items-center justify-center">
                      <div className="flex-shrink-0">{button.icon}</div>
                      <p className="ml-2 text-sm text-[#3B4252]">{button.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
