'use client';

import { useRouter } from "next/navigation";
import Home from "@/app/page";
import GameNavbar from "@/components/Layout/Tes";
import { TelescopeDiskDetector } from "@/components/Projects/Telescopes/DiskDetector";
import SunspotSteps from "@/components/Projects/Telescopes/Sunspots/SunspotShell";
import DailyMinorPlanetMissions from "@/components/Structures/Missions/Astronomers/DailyMinorPlanet/DailyMinorPlanet";
import PlanetHuntersSteps from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetHunters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  BuildingIcon,
  MoonStarIcon,
  SunIcon,
  TelescopeIcon,
  TestTubeDiagonalIcon,
  Trophy
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AstronomyResearch from "@/components/Research/AstronomyItems";

export default function TelescopeOnEarthPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState<React.ReactNode | null>(null);
  const [modalSizePercentage, setModalSizePercentage] = useState(100);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!session) return <Home />;

  const buttons = [
    {
      icon: <TelescopeIcon className="w-6 h-6 text-[#88C0D0]" />,
      text: "Discover planets",
      dynamicComponent: <PlanetHuntersSteps />,
      classificationtype: "planet",
      sizePercentage: 95,
      showInNoModal: true,
    },
    {
      icon: <SunIcon className="w-6 h-6 text-[#EBCB8B]" />,
      text: "Sunspot data",
      dynamicComponent: <SunspotSteps />,
      classificationtype: "sunspot",
      sizePercentage: 60,
    },
    {
      icon: <TestTubeDiagonalIcon className="w-6 h-6 text-[#B48EAD]" />,
      text: "Find early solar systems",
      dynamicComponent: <TelescopeDiskDetector />,
      sizePercentage: 70,
    },
    {
      icon: <MoonStarIcon className="w-6 h-6 text-[#A3BE8C]" />,
      text: "Discover asteroids",
      dynamicComponent: <DailyMinorPlanetMissions />,
      sizePercentage: 95,
    },
  ];

  const actions = [
    {
      icon: <Trophy className="w-6 h-6 text-[#D08770]" />,
      text: "Upgrades",
      dynamicComponent: <AstronomyResearch />,
      sizePercentage: 100,
    },
  ];

  const handleActionClick = (
    actionText: string,
    component: React.ReactNode,
    sizePercentage: number = 100
  ) => {
    setActiveComponent(component);
    setModalSizePercentage(sizePercentage);
    setExpanded(true);
  };

  const handleButtonClick = (
    buttonText: string,
    component: React.ReactNode,
    sizePercentage: number = 100
  ) => {
    setActiveComponent(component);
    setModalSizePercentage(sizePercentage);
    setExpanded(true);
  };

  const handleClose = () => {
    setActiveComponent(null);
    setExpanded(false);
  };

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
            if (!open) router.push("/");
          }}
        >
          <div className="relative transition-all duration-500 ease-in-out">
            {!activeComponent && (
              <DialogContent
                className="p-6 rounded-3xl text-white max-w-3xl mx-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))',
                  color: '#2E3440',
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                    <h1 className="text-2xl font-bold text-[#2E3440]">Telescope</h1>
                  </div>
                </div>

                <div className="relative flex justify-center my-4">
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
                      onClick={() =>
                        handleActionClick(
                          action.text,
                          action.dynamicComponent,
                          action.sizePercentage
                        )
                      }
                    >
                      {action.icon}
                      <p className="text-xs text-[#4C566A]">{action.text}</p>
                    </div>
                  ))}
                </div>

                <div className="gap-4 mt-6">
                  <div className="flex flex-col items-center my-4 space-y-4">
                    {buttons.map((button, index) =>
                      button.showInNoModal !== false ? (
                        <div
                          key={index}
                          className="flex items-center justify-center bg-[#D8DEE9]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#E5E9F0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81A1C1] cursor-pointer"
                          onClick={() =>
                            handleButtonClick(
                              button.text,
                              button.dynamicComponent,
                              button.sizePercentage
                            )
                          }
                          style={{ width: "100%", maxWidth: "240px" }}
                        >
                          <div className="flex items-center justify-center">
                            <div className="flex-shrink-0">{button.icon}</div>
                            <p className="ml-2 text-sm text-[#3B4252]">{button.text}</p>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </DialogContent>
            )}

            {activeComponent && (
              <DialogContent
                className="p-6 rounded-3xl text-[#2E3440] mx-auto w-[95%] h-[95%] max-w-full max-h-[95%] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
                style={{
                  backgroundColor: "#ECEFF4",
                  border: "1px solid #D8DEE9",
                }}
              >
                <div className="relative flex flex-col items-center justify-center h-full">
                  <button
                    className="absolute top-4 right-4 text-[#4C566A] hover:text-[#BF616A]"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <div className="flex-grow flex justify-center items-center overflow-y-auto w-full">
                    {activeComponent}
                  </div>
                </div>
              </DialogContent>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};