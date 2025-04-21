'use client';

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge, Bell } from "lucide-react";

export default function AlertsDropdown({
    hasNewAlert,
    newNotificationsCount,
    timeRemaining,
    alertMessage,
}: {
    hasNewAlert: boolean;
    newNotificationsCount: number;
    timeRemaining: string;
    alertMessage: string;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className="relative group">
                    <Bell className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <span className="ml-2 text-white">Alerts</span>
                    {hasNewAlert && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {newNotificationsCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border border-[#581c87] shadow-[0_0_15px_rgba(124,58,237,0.5)]"> 
                <div className="p-4">
                    <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] mb-4">
                        Daily Alert
                    </h2>
                    <div className="mt-4 text-center text-[#67e8f9] font-semibold">
                        <p>{alertMessage}</p>
                        <p className="mt-2 text-xs text-gray-500">Time remaining until next event: {timeRemaining}</p>
                    </div>
                </div>
            </PopoverContent> 
        </Popover>
    );
};