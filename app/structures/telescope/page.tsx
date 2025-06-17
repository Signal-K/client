'use client'

import { useRouter } from "next/navigation";
import Home from "@/app/page";
import GameNavbar from "@/components/Layout/Tes";
import AstronomyResearch from "@/components/Research/AstronomyItems";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";
import {
  BuildingIcon,
  MoonStarIcon,
  SunIcon,
  TelescopeIcon,
  TestTubeDiagonalIcon,
  Trophy
} from "lucide-react";

export default function TelescopeOnEarthPage() {
  const session = useSession();
  const router = useRouter();

  if (!session) return <Home />;

  const actions = [
    {
      icon: <Trophy className="w-6 h-6 text-[#D08770]" />,
      text: "Upgrades",
      onClick: () => {
        // Still show upgrades locally (not a redirect)
        router.push("/upgrades/astronomy"); // Optional: You can route this dynamically too
      },
    },
  ];

  const buttons = [
    {
      icon: <TelescopeIcon className="w-6 h-6 text-[#88C0D0]" />,
      text: "Discover planets",
      route: "planet-hunters",
    },
    {
      icon: <SunIcon className="w-6 h-6 text-[#EBCB8B]" />,
      text: "Sunspot data",
      route: "sunspots",
    },
    {
      icon: <TestTubeDiagonalIcon className="w-6 h-6 text-[#B48EAD]" />,
      text: "Find early solar systems",
      route: "disk-detective",
    },
    {
      icon: <MoonStarIcon className="w-6 h-6 text-[#A3BE8C]" />,
      text: "Discover asteroids",
      route: "daily-minor-planet",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />

      <div className="w-full">
        <GameNavbar />
      </div>

      <div className="flex flex-row space-y-4">
        <Dialog
          defaultOpen
          onOpenChange={(open) => {
            if (!open) {
              router.push("/");
            }
          }}
        >
          <DialogContent
            className="p-6 rounded-3xl text-white max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col justify-start"
            style={{
              background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))",
              color: "#2E3440",
            }}
          >
            <div className="flex-grow overflow-y-auto w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                  <h1 className="text-2xl font-bold text-[#2E3440]">Telescope</h1>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <img
                  src="/assets/Items/TransitingTelescope.png"
                  alt="Telescope"
                  className="w-20 h-20"
                  width="80"
                  height="80"
                  style={{ aspectRatio: "80/80", objectFit: "cover" }}
                />
              </div>

              <div className="flex items-center justify-center my-4 space-x-4">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={action.onClick}
                  >
                    {action.icon}
                    <p className="text-xs text-[#4C566A]">{action.text}</p>
                  </div>
                ))}
              </div>

              <div className="gap-4 mt-6">
                <div className="flex flex-col items-center my-4 space-y-4">
                  {buttons.map((button, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center bg-[#D8DEE9]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#E5E9F0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81A1C1] cursor-pointer"
                      onClick={() => router.push(`/structures/telescope/${button.route}`)}
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};