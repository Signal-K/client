import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, HelpCircleIcon, ChevronRight, CloudHail, HelpCircle, LightbulbIcon, LucideTestTubeDiagonal, Pickaxe, Telescope, TestTube2, TreeDeciduous, XCircle, Shapes, Expand, CameraIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import MissionPathway from "../Missions/Pathway";
import { useActivePlanet } from "@/context/ActivePlanet";

interface Mission {
    id: number | number[]; 
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    requiredItem?: number;
    tableEntry?: string;
    tableColumn?: string;
};

interface DialogueStep {
    text: string
    requiredMissions: string[]
};

const astronomyMissions: Mission[] = [
    {
        id: [3000001, 20000004, 3000002],
        name: "Complete an astronomy mission using your telescope",
        description: "Click on the 'Telescope' structure to make some classifications",
        icon: Telescope,
        color: 'text-cyan-300',
        requiredItem: 3103,
    },
    {
        id: 200000015,
        name: "Research Disk Detector project",
        description: "Use your telescope to research the Disk Detector project, where you'll be able to discover early solar systems",
        icon: Shapes,
        color: 'text-purple-300',
        requiredItem: 3103,
    }
];

const biologistMissions: Mission[] = [
    {
        id: [3000004 | 3000004],
        name: "Classify some animals using your Biodome",
        description: "Click on the 'Biodome' structure to make some classifications",
        icon: TreeDeciduous,
        color: 'text-green-300',
        requiredItem: 3104,
    },
];

const meteorologyMissions: Mission[] = [
    {
        id: [3000010 | 20000007],
        name: "Study some weather events using your atmospheric probe",
        description: "Click on your LIDAR module to make some classifications",
        icon: CloudHail,
        color: 'text-blue-300',
        requiredItem: 3105,
    },
];

const globalMissions: Mission[] = [
    // {
    //     id: 2000000015,
    //     name: "Research a new module",
    //     description: 'Click on your structure and then the "Research" tab to unlock new projects and data sources to contribute to!',
    //     icon: TestTube2,
    //     color: 'text-purple-300',
    // },
    // {
    //     id: 200000013,
    //     name: "Collect some fuel",
    //     description: "Click on the mining tab to visit some mineral deposits your probes have found and mine them for fuel",
    //     icon: Pickaxe,
    //     color: 'text-red-300',
    // },
    {
        id: 3000001,
        name: "Discover a new planet",
        description: "Create and use a telescope to discover a new planet using the Planet Hunters module",
        icon: Telescope,
        color: 'text-purple-300',
    },
    {
        id: 1,
        name: "Continue researching & investigating",
        description: "Keep researching new projects and building new structures, and wait for new missions and expeditions to be added",
        icon: LightbulbIcon,
        color: 'text-yellow-300',
    },
    {
        id: 2,
        name: "Vote & advise other's discoveries",
        description: "Click on the 'Discoveries' button to view and comment on other player\'s discoveries to determine their accuracy and attributes",
        icon: LucideTestTubeDiagonal,
        color: 'text-blue-300',
        tableEntry: 'comments',
        tableColumn: 'author',
    },
    {
        id: 3,
        name: "Add your own data for review",
        description: "Click on the plus icon in the toolbar to add your own files that might be able to be part of a project, adding your own content and creations to our network",
        icon: CameraIcon,
        color: 'text-green-300',
        tableEntry: 'uploads',
        tableColumn: 'author',
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
    const [showWelcome, setShowWelcome] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility

    // Categories with missions
    const categories = [
        { missions: astronomyMissions, name: 'Astronomer' },
        { missions: biologistMissions, name: 'Biologist' },
        { missions: meteorologyMissions, name: 'Meteorologist' },
    ];

    useEffect(() => {
        async function fetchInventoryAndCompletedMissions() {
            if (!session?.user?.id || !activePlanet?.id) return;

            try {
                // Fetch owned items
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('item')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .in('item', [3103, 3104, 3105]);

                if (inventoryError) throw inventoryError;

                const ownedItems = inventoryData.map((inv: { item: number }) => inv.item);
                setOwnedItems(ownedItems);

                // Fetch completed missions from the `missions` table
                const { data: missionData, error: missionError } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id);

                if (missionError) throw missionError;

                const completedMissionIds = missionData.map((mission: { mission: number }) => mission.mission);
                setCompletedMissions(completedMissionIds);

                // Set current category based on owned items
                if (ownedItems.includes(3103)) {
                    setCurrentCategory(0); // Astronomy
                } else if (ownedItems.includes(3104)) {
                    setCurrentCategory(1); // Biology
                } else if (ownedItems.includes(3105)) {
                    setCurrentCategory(2); // Meteorology
                } else {
                    setCurrentCategory(Math.floor(Math.random() * categories.length)); // Random category if no specific items are owned
                }

                setShowWelcome(completedMissionIds.length === 0);
            } catch (error) {
                console.error("Error fetching inventory or missions:", error);
            }

            setLoading(false);
        }

        fetchInventoryAndCompletedMissions();
    }, [session, activePlanet, supabase]);

    useEffect(() => {
        // Display category-specific missions followed by global missions
        const missionsToDisplay = [
            ...categories[currentCategory].missions, // Category missions
            ...globalMissions, // Global missions
        ];
        setScrollableMissions(missionsToDisplay);
    }, [currentCategory]);

    const renderMission = (mission: Mission) => {
        const missionId = Array.isArray(mission.id) ? mission.id[0] : mission.id;
        const isCompleted = completedMissions.includes(missionId);

        return (
            <Card
                key={missionId}  // Ensure key is a single number
                className={`cursor-pointer border border-gray-600 mb-2 ${isCompleted ? 'bg-gray-700' : 'bg-gray-800'}`}
            >
                <CardContent className="p-4 flex items-center space-x-4">
                    <mission.icon className={`w-8 h-8 ${mission.color}`} />
                    <div>
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-500 line-through' : 'text-gray-200'}`}>
                            {mission.name}
                        </h3>
                        <p className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                            {mission.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="p-4 max-w-6xl mx-auto font-mono">
            <div className="hidden md:block"> {/* Hide everything below md */}
                <Card className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                    <CardContent className="p-4">
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <Button onClick={() => setShowPopup(true)} className="text-gray-300 hover:text-white">
                                <HelpCircle className="w-6 h-6" />
                            </Button>
                            <Button
                                onClick={() => setMinimized(true)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                            >
                                Minimize
                            </Button>
                            {/* Expansion Button */}
                            <Button
                                onClick={() => setShowModal(true)}  // Show modal when clicked
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                            >
                                <Expand className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-xl font-semibold text-gray-200">
                                {categories[currentCategory].name} Missions
                            </h2>
                        </div>

                        {/* Scrollable Missions - Limit to 2.3 visible items */}
                        <div
                            className="overflow-y-auto max-h-[calc(2.3*4rem)]" // Limit the visible height to 2.3 items (each item ~4rem)
                        >
                            <div className="space-y-4">
                                {scrollableMissions.map(renderMission)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* On Mobile */}
            <div className="md:hidden"> {/* Show only on mobile */}
                <Card className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                    <CardContent className="p-4">
                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-xl font-semibold text-gray-200">Current Mission</h2>
                            <Button
                                onClick={() => setShowModal(true)}  // Show modal when clicked
                                className="text-gray-300 hover:text-white"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Display only the first mission on mobile */}
                        {scrollableMissions.length > 0 && renderMission(scrollableMissions[0])}

                    </CardContent>
                </Card>

                {/* Mission Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-20"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto my-24"
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                            >
                                <h2 className="text-2xl font-semibold text-gray-200">Mission List</h2>
                                <div className="space-y-4 mt-4">
                                    {scrollableMissions.map(renderMission)}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StructureMissionGuide;

export const StructureMissionGuideMobile = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
 
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [minimized, setMinimized] = useState(false);
    const [ownedItems, setOwnedItems] = useState<number[]>([]);
    const [scrollableMissions, setScrollableMissions] = useState<Mission[]>([]);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility

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
                    .in('item', [3103, 3104, 3105]);

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

                setShowWelcome(completedMissionIds.length === 0);

            } catch (error) {
                console.error("Error fetching inventory or missions:", error);
            }

            setLoading(false);
        }

        fetchInventoryAndCompletedMissions();
    }, [session, activePlanet, supabase]);

    useEffect(() => {
        // Display category-specific missions followed by global missions
        const missionsToDisplay = [
            ...categories[currentCategory].missions, // Category missions
            ...globalMissions, // Global missions
        ];
        setScrollableMissions(missionsToDisplay);
    }, [currentCategory]);

    const userHasRequiredItem = (requiredItem?: number) => {
        return requiredItem ? ownedItems.includes(requiredItem) : false;
    };

    const renderMission = (mission: Mission) => {
        const missionId = Array.isArray(mission.id) ? mission.id[0] : mission.id;
        const isCompleted = completedMissions.includes(missionId);
    
        return (
            <Card
                key={missionId}  // Ensure key is a single number
                className={`cursor-pointer border border-gray-600 mb-2 ${isCompleted ? 'bg-gray-700' : 'bg-gray-800'}`}
            >
                <CardContent className="p-4 flex items-center space-x-4">
                    <mission.icon className={`w-8 h-8 ${mission.color}`} />
                    <div>
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-500 line-through' : 'text-gray-200'}`}>
                            {mission.name}
                        </h3>
                        <p className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                            {mission.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };    

    return (
        <div className="p-4 max-w-6xl mx-auto font-mono">
            {minimized ? (
                <Button onClick={() => setMinimized(false)} className="bg-blue-600 text-white flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5" />
                    <span>Help</span>
                </Button>
            ) : (
                <Card className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                    <CardContent className="p-4">
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <Button onClick={() => setShowPopup(true)} className="text-gray-300 hover:text-white">
                                <HelpCircle className="w-6 h-6" />
                            </Button>
                            <Button
                                onClick={() => setMinimized(true)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-2 py-1 text-sm"
                            >
                                Minimize
                            </Button>
                            {/* Expansion Button */}
                            <Button
                                onClick={() => setShowModal(true)}  // Show modal when clicked
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                            >
                                <Expand className="w-6 h-6" />
                            </Button>
                        </div>
    
                        {showPopup && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                                <div className="bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-white">Welcome!</h2>
                                        <Button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-white">
                                            <XCircle className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <p className="mt-4 text-gray-300">
                                        Follow this mission guide for a walkthrough of different projects and actions. Use your research station (Plus icon) to unlock new projects and data sources.
                                    </p>
                                </div>
                            </div>
                        )}
    
                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-xl font-semibold text-gray-300">
                                Mission Guide for {categories[currentCategory].name} Pathway
                            </h2>
                        </div>
    
                        <div className="flex justify-between mb-4">
                            <Button
                                onClick={() => setCurrentCategory((currentCategory - 1 + categories.length) % categories.length)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                onClick={() => setCurrentCategory((currentCategory + 1) % categories.length)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-2"
                            >
                                <ChevronRight />
                            </Button>
                        </div>
    
                        <div className="max-h-45 overflow-y-auto">
                            {scrollableMissions.map(renderMission)}
                        </div>
                    </CardContent>
                </Card>
            )}
    
            {/* Modal for expanded view */}
            <AnimatePresence>
                {showModal && (  // Only show modal if showModal state is true
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20"
                    >
                        <div className="bg-gray-800 p-8 rounded-lg max-w-4xl w-full">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-white">Mission Guide</h2>
                                <Button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="mt-4 space-y-4">
                                {scrollableMissions.map(renderMission)} {/* Display expanded list of missions */}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};