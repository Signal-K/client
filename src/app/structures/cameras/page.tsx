'use client';

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import { BuildingIcon, CloudCogIcon, MicroscopeIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

const ChatGPTImageClassifier = dynamic(
  () => import("@/src/components/classification/tools/image-classifier"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-slate-500">Loading classifier...</div>,
  }
);

export default function CameraAggregatesPage() {
    const session = useSession();

    const router = useRouter();

    const [activeComponent, setActiveComponent] = useState<React.ReactNode | null>(null);
    const { isDark, toggleDarkMode } = UseDarkMode();

    useEffect(() => {
        if (!session) {
            router.replace("/auth");
        }
    }, [session, router]);

    if (!session) {
        return null;
    }

    const buttons = [
        {
            icon: <MicroscopeIcon className="w-6 h-6 text-[#B48EAD]" />,
            text: "Animal tracker",
            dynamicComponent: <ChatGPTImageClassifier />,
        },
        {
            icon: <CloudCogIcon className="w-6 h-6 text-[#88C0D0]" />,
            text: "Storm chaser - coming soon",
        },
    ];

    const handleComponentChange = ( component: React.ReactNode ) => {
        setActiveComponent( component );
    };

    const handleBack = () => {
        setActiveComponent( null );
    };

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
                        {activeComponent ? (
                            <div className="w-full h-full">
                                {activeComponent}
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <BuildingIcon className="w-8 h-8 text-[#A3BE8C]" />
                                        <h1 className="text-2xl font-bold text-[#2E3440]">
                                            Your cameras (across all structures)
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex justify-center my-4">
                                    <img
                                        src='/assets/Items/cameras.png'
                                        alt="Your cameras"
                                        className="w-20 h-20"
                                        width='80'
                                        height='80'
                                        style={{
                                            aspectRatio: '80/80',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>

                                <div className="gap-4 mt-6">
                                    <div className="flex items-center justify-center my-4 space-x-4">
                                        {buttons.map((button, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center bg-[#D8DEE9]/60 text-[#2E3440] font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#E5E9F0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81A1C1] cursor-pointer"
                                                onClick={() => handleComponentChange(button.dynamicComponent)}
                                                style={{ width: "100%", maxWidth: "240px" }}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="flex-shrunk-0">{button.icon}</div>
                                                    <div className="ml-2 text-sm text-[#4C566A]">{button.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
