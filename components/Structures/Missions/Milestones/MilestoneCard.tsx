import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Milestone {
    name: string;
    structure: string;
    icon: string;
    table: "classifications" | "comments";
    field: "classificationtype" | "category";
    value: string;
    requiredCount: number;
};

interface WeekMilestones {
    weekStart: string;
    data: Milestone[];
};

export default function MilestoneCard() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
    const [communityMilestones, setCommunityMilestones] = useState<WeekMilestones[]>([]);
    const [userProgress, setUserProgress] = useState<{ [key: string]: number }>({});
    const [communityProgress, setCommunityProgress] = useState<{ [key: string]: number }>({});
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"player" | "community">("player");

    useEffect(() => {
        fetch("/api/gameplay/milestones")
          .then((res) => res.json())
          .then((data) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
    
            const sortedPlayerMilestones = [...data.playerMilestones]
              .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    
            const sortedCommunityMilestones = [...data.communityMilestones]
              .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    
            const latestPlayerIndex = sortedPlayerMilestones.findIndex((group) => {
              const start = new Date(group.weekStart);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              return today >= start && today <= end;
            });
    
            const latestCommunityIndex = sortedCommunityMilestones.findIndex((group) => {
              const start = new Date(group.weekStart);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              return today >= start && today <= end;
            });
    
            setMilestones(sortedPlayerMilestones);
            setCommunityMilestones(sortedCommunityMilestones);
            setCurrentWeekIndex(latestPlayerIndex !== -1 ? latestPlayerIndex : 0);
          });
    }, []);    

    useEffect(() => {
        if (!session || milestones.length === 0) return;

        const fetchProgress = async (isCommunity = false) => {
            const progress: { [key: string]: number } = {};
            const weekData = isCommunity ? communityMilestones : milestones;
            if (!weekData[currentWeekIndex]) return;

            const { weekStart, data } = weekData[currentWeekIndex];

            const startDate = new Date(weekStart);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            for (const milestone of data) {
                const { table, field, value } = milestone;

                let query = supabase
                    .from(table)
                    .select("*", { count: "exact" })
                    .gte("created_at", startDate.toISOString())
                    .lte("created_at", endDate.toISOString())
                    .eq(field, value);

                if (!isCommunity && session.user.id) {
                    query = query.eq("author", session.user.id);
                }

                const { count, error } = await query;
                if (!error && count !== null) {
                    progress[milestone.name] = count;
                }
            }

            if (isCommunity) {
                setCommunityProgress(progress);
            } else {
                setUserProgress(progress);
            }
        };

        fetchProgress(false);
        fetchProgress(true);
    }, [session, milestones, communityMilestones, currentWeekIndex]);

    const handleNextWeek = () => {
        if (currentWeekIndex < milestones.length - 1) setCurrentWeekIndex(currentWeekIndex + 1);
    };

    const handlePrevWeek = () => {
        if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
    };

    const formatWeekDisplay = (index: number) => {
        const diff = milestones.length - 1 - index;
        if (diff === 0) return "Current Week";
        if (diff === 1) return "Last Week";
        return `${diff} Weeks Ago`;
    };

    const activeMilestones = activeTab === "player" ? milestones : communityMilestones;
    const activeProgress = activeTab === "player" ? userProgress : communityProgress;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
            <Tabs defaultValue="player" value={activeTab} onValueChange={(val) => setActiveTab(val as "player" | "community")}>
                <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
                        Weekly Milestones
                    </h2>
                    <TabsList className="bg-[#1e293b] border border-[#6b21a8] w-full sm:w-auto">
                        <TabsTrigger value="player" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white w-1/2 sm:w-auto">
                            Yours
                        </TabsTrigger>
                        <TabsTrigger value="community" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white w-1/2 sm:w-auto">
                            Community
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevWeek}
                        className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white w-full sm:w-auto"
                        disabled={currentWeekIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="text-lg font-semibold text-[#67e8f9] text-center w-full sm:w-auto">
                        {activeMilestones.length > 0 ? formatWeekDisplay(currentWeekIndex) : "Loading Week"}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextWeek}
                        className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white w-full sm:w-auto"
                        disabled={currentWeekIndex >= activeMilestones.length - 1}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <TabsContent value="player" className="mt-0">
                    {milestones.length > 0 ? (
                        <ul className="space-y-2">
                            {milestones[currentWeekIndex]?.data.map((milestone, index) => (
                                <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-1">
                                    <p className="truncate">{milestone.name}</p>
                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {userProgress[milestone.name] || 0}/{milestone.requiredCount} completed
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center">Loading milestones...</p>
                    )}
                </TabsContent>

                <TabsContent value="community" className="mt-0">
                    {communityMilestones.length > 0 ? (
                        <ul className="space-y-2">
                            {communityMilestones[currentWeekIndex]?.data.map((milestone, index) => (
                                <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-1">
                                    <p className="truncate">{milestone.name}</p>
                                    <div className="text-xs text-gray-500 whitespace-nowrap">
                                        {communityProgress[milestone.name] || 0}/{milestone.requiredCount} completed
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center">Loading community milestones...</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};