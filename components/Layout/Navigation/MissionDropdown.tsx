"use client"

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge, ChevronDown, Compass, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MissionsPopover({
    userProgress,
}: {
    userProgress: { [key: string]: number }
}) {
    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
    const [milestones, setMilestones] = useState<any[]>([]);
    
    const formatWeekDisplay = (index: number) => {
        const diff = milestones.length - 1 - index
        if (diff === 0) return "Current Week"
        if (diff === 1) return "Last Week"
        return `${diff} Weeks Ago`
    };

    useEffect(() => {
        fetch("/api/gameplay/milestones")
            .then((res) => res.json())
            .then((data) => {
                setMilestones(data.playerMilestones)
                setCurrentWeekIndex(data.playerMilestones.length - 1) // Default to latest week
            })
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="text-white px-2">
                <Trophy className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                <span className="ml-2 text-white">Milestones</span>
                <Badge className="ml-1 bg-amber-600 hover:bg-amber-600 text-white">3</Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border border-[#581c87] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                <div className="p-4">
                    <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] mb-4">
                        Weekly Milestones    
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                        Use the points you earn from these milestones to unlock new tech & upgrade your structures
                    </p>
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                            className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                            disabled={currentWeekIndex === 0}
                        >
                            <ChevronDown className="w-4 h-4 mr-1 rotate-90" /> Previous
                        </Button>
                        <div className="text-lg font-semibold text-[#63e8f9] text-center">
                            {milestones.length > 0 ? formatWeekDisplay(currentWeekIndex) : "Loading Week"}
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentWeekIndex(Math.min(milestones.length - 1, currentWeekIndex + 1))}
                            className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                            disabled={currentWeekIndex >= milestones.length - 1}
                        >
                            Next <ChevronDown className="w-4 h-4 ml-1 -roate-90" />
                        </Button>
                    </div>

                    {milestones.length > 0 ? (
                        <ul className="space-y-2">
                            {milestones[currentWeekIndex]?.data.map((milestone: any, index: number) => (
                                <li
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-1"
                                >
                                    <p className="truncate">{milestone.name}</p>
                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {userProgress[milestone.name] || 0}/{milestone.requiredCount} completed
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-white">Loading milestones...</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};