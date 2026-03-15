'use client'

import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import { BuildingIcon, CameraOffIcon, MicroscopeIcon, RssIcon } from "lucide-react"
import ViewportShell from "@/src/components/layout/ViewportShell"

export default function SeiscamOnEarthPage() {
  const router = useRouter()

  const buttons = [
    { icon: <RssIcon className="w-6 h-6 text-[#D08770]" />, text: "Identify landmarks on terrestrial planets", href: "/structures/balloon/landmarks" },
    { icon: <CameraOffIcon className="w-6 h-6 text-[#EBCB8B]" />, text: "Map the surface of planets", href: "/structures/balloon/surface" },
  ]

  return (
    <ViewportShell>
      <div className="pt-20 flex flex-row space-y-4">
        <Dialog defaultOpen onOpenChange={(open) => { if (!open) router.push("/") }}>
          <DialogContent
            className="p-6 rounded-3xl text-white max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col justify-start"
            style={{ background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))", color: "#2E3440" }}
          >
            <div className="flex-grow overflow-y-auto w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                  <h1 className="text-2xl font-bold text-[#2E3440]">SEISCAM</h1>
                </div>
                <img src="/assets/Items/miningstation.png" alt="SEISCAM" className="w-20 h-20" width="80" height="80" style={{ aspectRatio: "80/80", objectFit: "cover" }} />
              </div>

              <div className="flex items-center justify-center my-4 space-x-4">
                <div className="flex flex-col items-center cursor-pointer" onClick={() => router.push("/research")}>
                  <MicroscopeIcon className="w-6 h-6 text-[#B48EAD]" />
                  <p className="text-xs text-[#4C566A]">Research</p>
                </div>
              </div>

              <div className="flex flex-col items-center my-4 space-y-4">
                {buttons.map((button, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center bg-[#D8DEE9]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#E5E9F0] cursor-pointer"
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
    </ViewportShell>
  )
}
