"use client";

import React, { useState, useEffect } from "react";
import GameNavbar from "@/components/Layout/Tes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function MilestonesPage() {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const router = useRouter();

    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});

    const formatWeekDisplay = (index: number) => {
        if (index === 0) return "Current Week";
        if (index === 1) return "Last Week";
        return `${index} Weeks ago`;
    };

    useEffect(() => {
        fetch('/api/gameplay/milestones')
            .then(res => res.json())
            .then(data => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const sorted = [...data.playerMilestones].sort(
                    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
                );

                const currentIndex = sorted.findIndex(group => {
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
            endDate.setHours(23, 59, 59, 999);

            for (const milestone of data) {
                const { table, field, value } = milestone;

                let query = supabase
                    .from(table)
                    .select("*", { count: "exact" })
                    .gte("created_at", startDate.toISOString())
                    .lte("created_at", endDate.toISOString())
                    .eq(field, value);

                if (session.user?.id) {
                    query = query.eq("author", session.user.id);
                }

                const { count, error } = await query;
                if (!error && count !== null) {
                    progress[milestone.name] = count;
                }
            }

            setUserProgress(progress);
        };

        fetchProgress();
    }, [session, milestones, currentWeekIndex]);

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth background"
            />

            <div className="z-10 w-full">
                <GameNavbar />
            </div>

            <div className="flex flex-1 justify-center items-center px-4 py-8">
                <Dialog
                    defaultOpen
                    onOpenChange={(open) => {
                        if (!open) router.push("/");
                    }}
                >
                    <DialogContent
                        className="rounded-3xl text-white w-full max-w-screen-md lg:max-w-[1000px] h-[40vh] overflow-y-auto p-8 shadow-xl"
                        style={{
                            background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))",
                            color: "#1e293b",
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-4">
                            <h3 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
                                Weekly Milestones
                            </h3>
                        </div>

                        {/* Week Switcher */}
                        <div className="flex justify-between items-center mb-6">
                            <Button
                                variant='outline'
                                size="sm"
                                onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                                className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                                disabled={currentWeekIndex === 0}
                            >
                                <ChevronDown className="w-4 mr-1 h-4 rotate-90 text-white" />
                                <span className="text-white">Previous</span>
                            </Button>

                            <div className="text-base font-semibold text-[#63ebf9]">
                                {milestones.length > 0 ? formatWeekDisplay(currentWeekIndex) : "Loading Week"}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentWeekIndex(Math.min(milestones.length - 1, currentWeekIndex + 1))}
                                className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                                disabled={currentWeekIndex >= milestones.length - 1}
                            >
                                <span className="text-white">Next</span>
                                <ChevronDown className="w-4 h-4 ml-1 -rotate-90 text-white" />
                            </Button>
                        </div>

                        {/* Milestones */}
                        <div className="space-y-4">
                            {milestones.length > 0 ? (
                                <ul className="space-y-4">
                                    {milestones[currentWeekIndex]?.data.map((milestone: any, index: number) => {
                                        const current = userProgress[milestone.name] || 0;
                                        const total = milestone.requiredCount;
                                        const progressPercent = Math.min((current / total) * 100, 100);

                                        return (
                                            <li
                                                key={index}
                                                className="p-4 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm shadow-sm"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-medium text-sm sm:text-base text-white break-words">
                                                        {milestone.name}
                                                    </p>
                                                    <span className="text-xs text-gray-100">
                                                        {current}/{total} completed
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-300 bg-opacity-30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#22d3ee] to-[#7e22ce]"
                                                        style={{ width: `${progressPercent}%` }}
                                                    ></div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-center text-white">Loading milestones...</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};