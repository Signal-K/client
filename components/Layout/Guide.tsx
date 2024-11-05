import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CloudHail, HelpCircle, LightbulbIcon, Telescope, TreeDeciduous } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import MissionPathway from "../Missions/Pathway";

interface Mission {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
};

interface DialogueStep {
    text: string
    requiredMissions: string[]
};

const astronomyMissions: Mission[] = [
    {
        id: 3000001 | 20000004 | 3000002,
        name: "Complete an astronomy mission using your telescope",
        description: "Click on the 'Telescope' structure to make some classifications",
        icon: Telescope,
        color: 'text-cyan-300',
    },
    {
        id: 10000001,
        name: "This is a test mission",
        description: 'Not needed',
        icon: LightbulbIcon,
        color: 'text-yellow-300',
    },
];

const biologistMissions: Mission[] = [
    {
        id: 3000004 | 3000004,
        name: "Classify some animals using your Biodome",
        description: "Click on the 'Biodome' structure to make some classifications",
        icon: TreeDeciduous,
        color: 'text-green-300',
    },
];

const meteorologyMissions: Mission[] = [
    {
        id: 3000010 | 20000007,
        name: "Study some weather events using your atmospheric probe",
        description: "Click on your LIDAR module to make some classifications",
        icon: CloudHail,
        color: 'text-blue-300',
    },
];

// Research station - walk the user through this. Then upload data, verify/vet (consensus), then we introduce travel. Add a "close"/swipe-down option so that the tutorial section can be hidden/minimised. Then we go through the guide for the different views....and determine the differentials from Pathway.tsx and this new list
// As well as researching for other projects/mission modules that aren't in `mission-selector`

const dialogueSteps: DialogueStep[] = [

];

export default function StructureMissionGuide() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [minimized, setMinimized] = useState(false);  // State to handle minimization

    const categories = [
        { missions: astronomyMissions, name: 'Astronomer' },
        { missions: biologistMissions, name: 'Biologist' },
        { missions: meteorologyMissions, name: 'Meteorologist' },
    ];

    useEffect(() => {
        async function fetchCompletedMissions() {
            if (!session?.user?.id) return;

            const { data, error } = await supabase
                .from('missions')
                .select('mission')
                .eq('user', session.user.id);

            if (error) {
                console.error("Error fetching completed missions:", error);
            } else {
                const completedMissionIds = data.map((mission: { mission: number }) => mission.mission);
                setCompletedMissions(completedMissionIds);
            }

            setLoading(false);
        }

        fetchCompletedMissions();
    }, [session, supabase]);

    const handleNextCategory = () => {
        setCurrentCategory((prevCategory) => (prevCategory + 1) % categories.length);
    };

    const handlePreviousCategory = () => {
        setCurrentCategory((prevCategory) => (prevCategory - 1 + categories.length) % categories.length);
    };

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    return (
        <div className="p-4 max-w-6xl mx-auto font-mono">
            {minimized ? (
                <Button onClick={toggleMinimize} className="bg-blue-600 text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>Help</span>
                </Button>
            ) : (
                <Card className="overflow-hidden relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between mb-4 items-center">
                            {/* Mission Group Header */}
                            <h2 className="text-xl font-semibold text-gray-300">
                                Mission guide for {categories[currentCategory].name} pathway
                            </h2>

                            <Button
                                onClick={toggleMinimize}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                            >
                                Minimize
                            </Button>
                        </div>

                        <div className="flex justify-between mb-4">
                            <Button
                                onClick={handlePreviousCategory}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleNextCategory}
                                className="bg-blue-600 text-white hover:bg-blue-500 px-2 py-1 text-sm"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {loading ? (
                                <p>Loading missions...</p>
                            ) : (
                                categories[currentCategory].missions.map((mission) => (
                                    <Card
                                        key={mission.id}
                                        className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                                            completedMissions.includes(mission.id) ? 'bg-gray-700' : 'bg-gray-800'
                                        } border border-gray-600 relative overflow-hidden`}
                                    >
                                        <CardContent className="p-2 flex items-center">
                                            <mission.icon className={`w-6 h-6 mr-2 ${mission.color}`} />
                                            <div>
                                                <h3 className={`text-xs font-semibold ${mission.color}`}>{mission.name}</h3>
                                                {completedMissions.includes(mission.id) ? (
                                                    <p className="text-xs text-gray-400 line-through decoration-dotted decoration-green-400">
                                                        {mission.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-400">{mission.description}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};