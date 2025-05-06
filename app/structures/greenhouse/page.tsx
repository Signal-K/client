'use client';

import Home from "@/app/page";
import ChatGPTImageClassifier from "@/app/tests/pleaseWork";
import GameNavbar from "@/components/Layout/Tes";
import { GreenhouseResearchStations } from "@/components/Structures/Missions/Biologists/ResearchStations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BeanIcon, BuildingIcon, CameraIcon } from "lucide-react";
import React, { useState, useRef } from "react";

export default function GreenhouseBiodomeOnEarthPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [expanded, setExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState<React.ReactNode | null>(null);
  const [modalSizePercentage, setModalSizePercentage] = useState(100);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!session) return <Home />;

  const buttons = [
    {
      icon: <BeanIcon className="w-6 h-6 text-[#A3BE8C]" />,
      text: "My Greenhouse Stations",
      dynamicComponent: <GreenhouseResearchStations />,
      sizePercentage: 80,
    },
    {
      icon: <CameraIcon className="w-6 h-6 text-[#81A1C1]" />,
      text: "Scan animals around you",
      dynamicComponent: <ChatGPTImageClassifier />,
      sizePercentage: 90,
    },
  ];

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
        <Dialog defaultOpen>
          <div className="relative transition-all duration-500 ease-in-out">
            {!activeComponent && (
              <DialogContent
                className="p-6 rounded-3xl text-white max-w-3xl mx-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(216, 240, 224, 0.9), rgba(182, 235, 200, 0.85))',
                  color: '#2E3440',
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                    <h1 className="text-2xl font-bold text-[#2E3440]">Greenhouse</h1>
                  </div>
                </div>

                <div className="relative flex justify-center my-4">
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
                    ))}
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