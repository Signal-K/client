import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GlassWaterIcon, PawPrintIcon, SnowflakeIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

interface MilestoneCardProps {
    className?: string;
};

const MilestoneCard: React.FC<MilestoneCardProps> = ({ className }) => {
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
        <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
            <Tabs
                defaultValue="player"
                onValueChange={(value) => setActiveTab(value as "player" | "community")}
                className="w-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
                        Weekly Missions
                    </h2>
                    <TabsList className="bg-[#1e293b] border border-[#6b21a8]">
                        <TabsTrigger value="player" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white">
                            Yours
                        </TabsTrigger>
                        <TabsTrigger value="community" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white">
                            Community
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevWeek}
                        className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-lg font-semibold text-[#67e8f9]">
                        {milestonesToDisplay.length > 0 ? (
                            <>
                                {new Date(milestonesToDisplay[currentWeekIndex].weekStart).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })} - {new Date(milestonesToDisplay[currentWeekIndex].weekStart).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </>
                        ) : (
                            "Loading Week"
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextWeek}
                        className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                    {milestonesToDisplay.length > 0 ? (
                        <>
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
                        </>
                    ) : (
                        <p className="text-center">Loading milestones...</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MilestoneCard;