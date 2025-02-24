"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GlassWaterIcon, PawPrintIcon, SnowflakeIcon } from "lucide-react";

const iconMap = {
    GlassWaterIcon: <GlassWaterIcon className="w-5 h-5" />,
    PawPrintIcon: <PawPrintIcon className="w-5 h-5" />,
    SnowflakeIcon: <SnowflakeIcon className="w-5 h-5" />,
};

const categoryMap = {
    WeatherBalloon: "Meteorological",
    Telescope: "Astronomy",
    Greenhouse: "Biological",
};

const MilestoneCard = () => {
    const [milestones, setMilestones] = useState<{ weekStart: string; data: any[] }[]>([]);
    const [communityMilestones, setCommunityMilestones] = useState<{ weekStart: string; data: any[] }[]>([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"player" | "community">("player");

    useEffect(() => {
        fetch("/api/gameplay/milestones")
            .then((res) => res.json())
            .then((data) => {
                const sortedPlayerMilestones = data.playerMilestones.sort((a: any, b: any) =>
                    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
                );
                const sortedCommunityMilestones = data.communityMilestones.sort((a: any, b: any) =>
                    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
                );
                setMilestones(sortedPlayerMilestones);
                setCommunityMilestones(sortedCommunityMilestones);

                const currentDate = new Date();
                const index = sortedPlayerMilestones.findIndex(
                    (m: any) =>
                        new Date(m.weekStart).getTime() <= currentDate.getTime() &&
                        currentDate.getTime() < new Date(m.weekStart).getTime() + 7 * 24 * 60 * 60 * 1000
                );
                setCurrentWeekIndex(index !== -1 ? index : 0);
            });
    }, []);

    const handleNextWeek = () => {
        if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
    };

    const handlePrevWeek = () => {
        if (currentWeekIndex < milestones.length - 1) setCurrentWeekIndex(currentWeekIndex + 1);
    };

    const milestonesToDisplay = activeTab === "player" ? milestones : communityMilestones;

    return (
        <Card className="p-4 w-full max-w-md bg-card border shadow-md rounded-lg">
            <CardContent className="flex flex-col gap-2 min-h-[180px]"> {/* Reduced min-height */}
                <h1 className="text-lg font-semibold text-blue-600">Weekly Missions</h1> {/* Reduced font size */}

                {/* Tab Buttons */}
                <div className="flex gap-3 mb-3">
                    <button
                        onClick={() => setActiveTab("player")}
                        className={`text-md font-medium ${activeTab === "player" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                    >
                        Player
                    </button>
                    <button
                        onClick={() => setActiveTab("community")}
                        className={`text-md font-medium ${activeTab === "community" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                    >
                        Community
                    </button>
                </div>

                {milestonesToDisplay.length > 0 ? (
                    <>
                        <h2 className="text-sm text-gray-700">Week of {milestonesToDisplay[currentWeekIndex].weekStart}</h2> {/* Reduced font size */}
                        <ul className="space-y-1">
                            {milestonesToDisplay[currentWeekIndex].data.map((milestone, index) => (
                                <li key={index} className="flex items-center gap-2 text-green-700 text-sm">
                                    {iconMap[milestone.icon as keyof typeof iconMap]}
                                    <p>{milestone.name}</p>
                                    <span className="text-xs text-gray-500">
                                        ({categoryMap[milestone.structure as keyof typeof categoryMap] || "Unknown"})
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between mt-2"> {/* Reduced margin */}
                            <button
                                onClick={handlePrevWeek}
                                disabled={currentWeekIndex === milestonesToDisplay.length - 1}
                                className="text-blue-500 disabled:text-gray-400"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextWeek}
                                disabled={currentWeekIndex === 0}
                                className="text-blue-500 disabled:text-gray-400"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Loading milestones...</p>
                )}
            </CardContent>
        </Card>
    );
};

export default MilestoneCard;