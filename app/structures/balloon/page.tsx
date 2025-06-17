'use client';

import Home from "@/app/page";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  BuildingIcon,
  CameraOffIcon,
  CloudCogIcon,
  CloudDrizzleIcon,
  MicroscopeIcon,
  RssIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import GameNavbar from "@/components/Layout/Tes";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function WeatherBalloonOnEarthPage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  if (!session) return <Home />;

  const actions = [
    {
      icon: <MicroscopeIcon className="w-6 h-6 text-[#B48EAD]" />,
      text: "Research",
      route: "research",
    },
  ];

  const buttons = [
    {
      icon: <CloudCogIcon className="w-6 h-6 text-[#88C0D0]" />,
      text: "Search your clouds",
      route: "clouds",
    },
    {
      icon: <CloudDrizzleIcon className="w-6 h-6 text-[#81A1C1]" />,
      text: "Map storms on gas planets",
      route: "storms",
    },
    {
      icon: <RssIcon className="w-6 h-6 text-[#D08770]" />,
      text: "Identify landmarks on terrestrial planets",
      route: "landmarks",
    },
    {
      icon: <CameraOffIcon className="w-6 h-6 text-[#EBCB8B]" />,
      text: "Map the surface of planets",
      route: "surface",
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
                  <h1 className="text-2xl font-bold text-[#2E3440]">Weather Balloon</h1>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <img
                  src="/assets/Items/WeatherBalloon.png"
                  alt="Weather Balloon"
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
                    onClick={() => router.push(`/structures/balloon/${action.route}`)}
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
                      onClick={() => router.push(`/structures/balloon/${button.route}`)}
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