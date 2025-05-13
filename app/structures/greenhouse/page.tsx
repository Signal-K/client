'use client';

import Home from "@/app/page";
import ChatGPTImageClassifier from "@/app/tests/pleaseWork";
import GameNavbar from "@/components/Layout/Tes";
import { GreenhouseResearchStations } from "@/components/Structures/Missions/Biologists/ResearchStations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BeanIcon, BuildingIcon, CameraIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function GreenhouseBiodomeOnEarthPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [activeComponent, setActiveComponent] = useState<React.ReactNode | null>(null);

  if (!session) return <Home />;

  const buttons = [
    {
      icon: <BeanIcon className="w-6 h-6 text-[#A3BE8C]" />,
      text: "My Greenhouse Stations",
      dynamicComponent: <GreenhouseResearchStations />,
    },
    {
      icon: <CameraIcon className="w-6 h-6 text-[#81A1C1]" />,
      text: "Scan animals around you",
      dynamicComponent: <ChatGPTImageClassifier />,
    },
  ];

  const handleComponentChange = (component: React.ReactNode) => {
    setActiveComponent(component);
  };

  const handleBack = () => {
    setActiveComponent(null);
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
            if (!open) {
              router.push("/");
            }
          }}
        >
          <DialogContent
            className="p-6 rounded-3xl text-white max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col justify-start"
            style={{
              background: "linear-gradient(135deg, rgba(216, 240, 224, 0.9), rgba(182, 235, 200, 0.85))",
              color: "#2E3440",
            }}
          >
            {/* Back button when showing dynamic content */}
            {activeComponent && (
              <div className="w-full flex justify-end">
                <button
                  onClick={handleBack}
                  className="text-[#4C566A] hover:text-[#BF616A] font-medium mb-2"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Content switcher */}
            <div className="flex-grow overflow-y-auto w-full">
              {activeComponent ? (
                <div className="w-full h-full">{activeComponent}</div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                      <h1 className="text-2xl font-bold text-[#2E3440]">Greenhouse</h1>
                    </div>
                  </div>

                  <div className="flex justify-center my-4">
                    <img
                      src="/assets/Items/Greenhouse.png"
                      alt="Greenhouse Biodome"
                      className="w-20 h-20"
                      width="80"
                      height="80"
                      style={{ aspectRatio: "80/80", objectFit: "cover" }}
                    />
                  </div>

                  <div className="gap-4 mt-6">
                    <div className="flex flex-col items-center my-4 space-y-4">
                      {buttons.map((button, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center bg-[#E5E9F0]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#ECEFF4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8FBCBB] cursor-pointer"
                          onClick={() => handleComponentChange(button.dynamicComponent)}
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
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};