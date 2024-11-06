import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CloudHail, HelpCircle, LightbulbIcon, LucideTestTubeDiagonal, Pickaxe, Telescope, TestTube2, TreeDeciduous } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import MissionPathway from "../Missions/Pathway";
import { useActivePlanet } from "@/context/ActivePlanet";

interface Mission {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    requiredItem?: number;
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
        requiredItem: 3103,
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
        requiredItem: 3104,
    },
];

const meteorologyMissions: Mission[] = [
    {
        id: 3000010 | 20000007,
        name: "Study some weather events using your atmospheric probe",
        description: "Click on your LIDAR module to make some classifications",
        icon: CloudHail,
        color: 'text-blue-300',
        requiredItem: 3105,
    },
];

const globalMissions: Mission[] = [
    {
        id: 200000015,
        name: "Research a new module",
        description: 'Click on your structure and then the "Research" tab to unlock new projects and data sources to contribute to!',
        icon: TestTube2,
        color: 'text-purple-300',
    },
    {
        id: 200000013,
        name: "Collect some fuel",
        description: "Click on the mining tab to visit some mineral deposits your probes have found and mine them for fuel",
        icon: Pickaxe,
        color: 'text-red-300',
    },
    {
        id: 30000001,
        name: "Discover a new planet",
        description: "Create and use a telescope to discover a new planet using the Planet Hunters module",
        icon: Telescope,
        color: 'text-purple-300',
    },
];

// Research station - walk the user through this. Then upload data, verify/vet (consensus), then we introduce travel. Add a "close"/swipe-down option so that the tutorial section can be hidden/minimised. Then we go through the guide for the different views....and determine the differentials from Pathway.tsx and this new list
// As well as researching for other projects/mission modules that aren't in `mission-selector`
// We'll also need to update this for different planets & chapters

const dialogueSteps: DialogueStep[] = [

];

const StructureMissionGuide = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [minimized, setMinimized] = useState(false);
    const [ownedItems, setOwnedItems] = useState<number[]>([]);
    const [scrollableMissions, setScrollableMissions] = useState<Mission[]>([]);

    const categories = [
        { missions: astronomyMissions, name: 'Astronomer' },
        { missions: biologistMissions, name: 'Biologist' },
        { missions: meteorologyMissions, name: 'Meteorologist' },
    ];

    useEffect(() => {
        async function fetchInventoryAndCompletedMissions() {
            if (!session?.user?.id || !activePlanet?.id) return;

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('item')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .in('item', [3103, 3104, 3105, 3106]);

                if (inventoryError) throw inventoryError;

                const ownedItems = inventoryData.map((inv: { item: number }) => inv.item);
                setOwnedItems(ownedItems);

                const { data: missionData, error: missionError } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id);

                if (missionError) throw missionError;

                const completedMissionIds = missionData.map((mission: { mission: number }) => mission.mission);
                setCompletedMissions(completedMissionIds);

                if (ownedItems.includes(3103)) {
                    setCurrentCategory(0); // Astronomy
                } else if (ownedItems.includes(3104)) {
                    setCurrentCategory(1); // Biology
                } else if (ownedItems.includes(3105)) {
                    setCurrentCategory(2); // Meteorology
                } else {
                    setCurrentCategory(Math.floor(Math.random() * categories.length)); // Random category if no specific items are owned
                }
            } catch (error) {
                console.error("Error fetching inventory or missions:", error);
            }

            setLoading(false);
        }

        fetchInventoryAndCompletedMissions();
    }, [session, activePlanet, supabase]);

    useEffect(() => {
        const missionsToDisplay = [
            ...categories[currentCategory].missions.slice(0, 2), // Get only the first 2 missions
            ...globalMissions.slice(0, 2), // Add 2 global missions
        ];
        setScrollableMissions(missionsToDisplay);
    }, [currentCategory]);

    const userHasRequiredItem = (requiredItem?: number) => {
        return requiredItem ? ownedItems.includes(requiredItem) : false;
    };

    return (
        <div className="p-4 max-w-6xl mx-auto font-mono">
            {minimized ? (
                <Button onClick={() => setMinimized(false)} className="bg-blue-600 text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>Help</span>
                </Button>
            ) : (
                <Card className="overflow-hidden relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-xl font-semibold text-gray-300">
                                Mission Guide for {categories[currentCategory].name} Pathway
                            </h2>
                            <Button
                                onClick={() => setMinimized(true)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                            >
                                Minimize
                            </Button>
                        </div>

                        <div className="flex justify-between mb-4">
                            <Button
                                onClick={() => setCurrentCategory((currentCategory - 1 + categories.length) % categories.length)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                                disabled={categories.length <= 1}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                onClick={() => setCurrentCategory((currentCategory + 1) % categories.length)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                                disabled={categories.length <= 1}
                            >
                                <ChevronRight />
                            </Button>
                        </div>

                        <div className="mb-4 p-4 border border-gray-600 rounded bg-gray-800 text-gray-200">
                            <p className="mt-1">
                                Welcome! Build structures like the Telescope to complete missions and expand your research.
                                Click the 'Guide' button to view your missions.
                            </p>
                        </div>

                        {/* Scrollable Missions Section */}
                        <div className="overflow-y-auto max-h-40 relative">
                            <div className="grid grid-cols-1 gap-4">
                                {scrollableMissions.map((mission) => (
                                    <div key={mission.id} className="flex">
                                        <Card
                                            className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                                                completedMissions.includes(mission.id) ? 'bg-gray-700' : 'bg-gray-800'
                                            } border border-gray-600 relative overflow-hidden w-full`}
                                        >
                                            <CardContent className="p-2 flex items-center">
                                                <mission.icon className={`w-6 h-6 mr-2 ${mission.color}`} />
                                                <div>
                                                    <h3 className={`font-semibold text-gray-300 ${completedMissions.includes(mission.id) ? 'line-through text-green-400' : ''}`}>
                                                        {mission.name}
                                                    </h3>
                                                    <p className="text-gray-400">{mission.description}</p>
                                                    {userHasRequiredItem(mission.requiredItem) && (
                                                        <span className="text-green-300 text-sm">Ready to complete!</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default StructureMissionGuide;