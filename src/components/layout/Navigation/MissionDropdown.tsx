"use client"

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Badge, ChevronDown, Trophy } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function MissionsPopover() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});

    const formatWeekDisplay = (index: number) => {
        if (index === 0) return "Current Week";
        if (index === 1) return "Last Week"; 
        return `${index} Weeks Ago`;
    };    

    useEffect(() => {
        fetch("/api/gameplay/milestones")
            .then((res) => res.json())
            .then((data) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const sorted = [...data.playerMilestones].sort(
                    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
                );

                const currentIndex = sorted.findIndex((group) => {
                    const start = new Date(group.weekStart);
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    return today >= start && today <= end;
                });

                setMilestones(sorted);
                setCurrentWeekIndex(currentIndex !== -1 ? currentIndex : 0);
            });
    }, []);

    useEffect(() => {
        if (!session || milestones.length === 0) return;

        const fetchProgress = async () => {
            const progress: { [key: string]: number } = {};
            const weekData = milestones[currentWeekIndex];

            if (!weekData) return;

            const { weekStart, data } = weekData;

            const startDate = new Date(weekStart);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999); // end of the week

            for (const milestone of data) {
                const { table, field, value } = milestone;

                let query = supabase
                    .from(table)
                    .select("*", { count: "exact" })
                    .eq(field, value)
                    .gte("created_at", startDate.toISOString())
                    .lte("created_at", endDate.toISOString());

                // Determine user column based on table
                const userField = ["votes", "classifications", "comments"].includes(table)
                    ? "user_id"
                    : "author";

                query = query.eq(userField, session.user.id);

                const { data: rows, count, error } = await query;

                if (!error && count !== null) {
                    progress[milestone.name] = count;
                };
            };

            setUserProgress(progress);
        };

        fetchProgress();
    }, [session, milestones, currentWeekIndex]);

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
                            Next <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
                        </Button>
                    </div>

                    {milestones.length > 0 ? (
                        <ul className="space-y-2">
                            {milestones[currentWeekIndex]?.data.map((milestone: any, index: number) => (
                                <li
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-1"
                                >
                                    <p className="text-sm break-words leading-snug">{milestone.name}</p>
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