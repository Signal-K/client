import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, XCircle, Expand, Telescope, TreeDeciduous, CloudHail, LightbulbIcon, LucideTestTubeDiagonal, CameraIcon, Shapes, PersonStandingIcon, Pickaxe, DiamondPercent, Rocket } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MissionInfoModal from "../Missions/MissionInfoModal";
import AllClassifications from "@/content/Starnet/YourClassifications";
import SwitchPlanet from "../(scenes)/travel/SolarSystem";
import { MiningComponentComponent } from "../(scenes)/mining/mining-component";
import DiscoveriesPage from "@/content/Classifications/minimalDiscoveries";
import FreeformUploadData from "../Projects/(classifications)/FreeForm";

export interface Mission {
    id: number | number[];
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    requiredItem?: number;
    tableEntry?: string;
    tableColumn?: string;
    voteOn?: string;
    modalContent?: React.ReactNode;
};

interface DialogueStep {
    text: string
    requiredMissions: string[]
};

const astronomyMissions: Mission[] = [
    {
        id: 3000001,
        name: "Complete an astronomy mission using your telescope",
        description: "Click on the 'Telescope' structure to make some classifications",
        icon: Telescope,
        color: 'text-cyan-300',
        requiredItem: 3103,
    },
    {
        id: 10001,
        name: "View your discoveries",
        description: "Vote on discoveries made by other players to help classify & audit them",
        icon: LightbulbIcon,
        color: 'text-yellow-300',
        modalContent: <DiscoveriesPage />,
    },
    {
        id: 200000015,
        name: "Research Disk Detector project",
        description: "Use your telescope to research the Disk Detector project, where you'll be able to discover early solar systems",
        icon: Shapes,
        color: 'text-purple-300',
        requiredItem: 3103,
    },
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
    {
        id: 10001,
        name: "View your discoveries",
        description: "Vote on discoveries made by other players to help classify & audit them",
        icon: LightbulbIcon,
        color: 'text-yellow-300',
        modalContent: <DiscoveriesPage />,
    },
];

const communityExpeditions: Mission[] = [
    {
        id: 3500011,
        name: "Travel to Mars",
        description: "Join the community expedition to Mars, where you'll be able to use your scientific tooling & understanding to build mining settlements & infrastructure",
        icon: Pickaxe,
        color: 'text-red-300',
        modalContent: <SwitchPlanet />,
    },
    {
        id: 3500012,
        name: "Mine some resources",
        description: "Use the rovers you've travelled with to mine some anomalies you and the community have found on Mars. This will allow you to produce some materials & more structures for community use",
        icon: DiamondPercent,
        color: 'text-cyan-300',
        modalContent: <MiningComponentComponent />
    },
    {
        id: 3500013,
        name: "Return to Earth",
        description: "Complete your mission on Mars and return to Earth to continue your research and exploration with the new resources you've obtained from Mars with the rest of the community",
        icon: Rocket,
        color: 'text-green-300',
        modalContent: <SwitchPlanet />
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
    {
        id: 10001,
        name: "View your discoveries",
        description: "Vote on discoveries made by other players to help classify & audit them",
        icon: LightbulbIcon,
        color: 'text-yellow-300',
        modalContent: <DiscoveriesPage />,
    },
];

const globalMissions: Mission[] = [
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
    // {
    //     id: 2,
    //     name: "Vote & advise other's discoveries",
    //     description: "Click on the 'Discoveries' button to view and comment on other player\'s discoveries to determine their accuracy and attributes",
    //     icon: LucideTestTubeDiagonal,
    //     color: 'text-blue-300',
    //     tableEntry: 'comments',
    //     tableColumn: 'author',
    // },
    {
        id: 3,
        name: "Add your own data for review",
        description: "Click on the plus icon in the toolbar to add your own files that might be able to be part of a project, adding your own content and creations to our network",
        icon: CameraIcon,
        color: 'text-green-300',
        tableEntry: 'uploads',
        tableColumn: 'author',
        modalContent: <FreeformUploadData />,
    },
    {
        id: 4,
        name: "Vote on planet candidate classifications",
        description: "Other users, or maybe you, have discovered some potential planet candidates. Go to your Telescope structure, click 'View all discoveries', and vote to select which classifications are valid, which in turn will allow anomalies to be added to the ecosystem",
        icon: PersonStandingIcon,
        color: 'text-red-300',
        tableEntry: 'votes',
        tableColumn: 'user_id',
        voteOn: 'planet',
        modalContent: <AllClassifications initialType="planet" />,
    },
];

const StructureMissionGuide = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [ownedItems, setOwnedItems] = useState<number[]>([]);
    const [scrollableMissions, setScrollableMissions] = useState<Mission[]>([]);

    const [hideCompleted, setHideCompleted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);   
    const toggleHideCompleted = () => {
        setHideCompleted((prev) => !prev);
    };
    const toggleHeight = () => {
        setIsExpanded((prev) => !prev);
    };

    const categories = [
        { missions: astronomyMissions, name: 'Astronomer' },
        { missions: biologistMissions, name: 'Biologist' },
        { missions: meteorologyMissions, name: 'Meteorologist' },
        {
            missions: communityExpeditions,
            name: "Community Expeditions",
        },
    ];

    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    const handleMissionClick = (mission: Mission) => {
      setSelectedMission(mission);
    };
  
    const closeModal = () => {
      setSelectedMission(null);
    };

    useEffect(() => {
        async function fetchInventoryAndCompletedMissions() {
            if (!session?.user?.id || !activePlanet?.id) return;
    
            try {
                const { data: inventoryData } = await supabase
                    .from('inventory')
                    .select('item')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .in('item', [3103, 3104, 3105]);
    
                const ownedItems = inventoryData ? inventoryData.map((inv: { item: number }) => inv.item) : [];
                setOwnedItems(ownedItems);
    
                const { data: missionData } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id);
    
                const completedMissionIds = missionData ? missionData.map((mission: { mission: number }) => mission.mission) : [];
    
                const voteOnMissions = await Promise.all(globalMissions.map(async (mission) => {
                    if (mission.voteOn) {
                        const { data: specificVotes } = await supabase
                            .from('votes')
                            .select('*')
                            .eq("user_id", session.user.id)
                            .eq("classificationtype", mission.voteOn);  
    
                        if (specificVotes && specificVotes.length > 0) {
                            
                            if (Array.isArray(mission.id)) {
                                completedMissionIds.push(mission.id[0]); 
                            } else {
                                completedMissionIds.push(mission.id);
                            }
                        }
                    }
                }));
    
                const additionalChecks = await Promise.all(globalMissions.map(async (mission) => {
                    if (mission.tableEntry && mission.tableColumn) {
                        const { data: tableData } = await supabase
                            .from(mission.tableEntry)
                            .select('*')
                            .eq(mission.tableColumn, session.user.id);
    
                        if (tableData && tableData.length > 0) {
                            if (Array.isArray(mission.id)) {
                                completedMissionIds.push(mission.id[0]);  // Pushing the first element if mission id is an array
                            } else {
                                completedMissionIds.push(mission.id);
                            }
                        }
                    }
                }));
    
                setCompletedMissions(completedMissionIds);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching inventory or missions:", error);
                setLoading(false);
            }
        }
    
        fetchInventoryAndCompletedMissions();
    }, [session, activePlanet, supabase]);    

    const [modalMissionContent, setModalMissionContent] = useState<React.ReactNode>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

    useEffect(() => {
        const currentMissions = categories[currentCategory].missions;

        // Filter global missions based on ownership of required items
        const filteredGlobalMissions = globalMissions.filter((mission) => {
            if (mission.requiredItem && !ownedItems.includes(mission.requiredItem)) {
                return false;
            }
            return true;
        });

        // Determine missions to display based on the selected category
        const missionsToDisplay = currentCategory === 3
            ? [...currentMissions]
            : [
                ...currentMissions,
                ...filteredGlobalMissions,
                ...communityExpeditions,
            ];

        // Ensure missions are unique by ID
        const uniqueMissions = [
            ...new Map(missionsToDisplay.map((mission) => [Array.isArray(mission.id) ? mission.id[0] : mission.id, mission])).values(),
        ];

        // Apply completed missions filter
        const filteredMissions = hideCompleted
            ? uniqueMissions.filter((mission) => {
                const missionId = Array.isArray(mission.id) ? mission.id[0] : mission.id;
                return !completedMissions.includes(missionId);
            })
            : uniqueMissions;

        setScrollableMissions(filteredMissions);
    }, [currentCategory, ownedItems, hideCompleted]); 

    const nextCategory = () => {
        setCurrentCategory((prev) => (prev + 1) % categories.length);
    };

    const previousCategory = () => {
        setCurrentCategory((prev) => (prev - 1 + categories.length) % categories.length);
    };

    const renderMission = (mission: Mission) => {
        const missionId = Array.isArray(mission.id) ? mission.id[0] : mission.id;
        const isCompleted = completedMissions.includes(missionId);

        const handleMissionClick = () => {
            setModalMissionContent(mission.modalContent);
            setIsModalOpen(true);
        };

        return (
            <Card
                key={missionId}
                className={`cursor-pointer border mb-2 ${isCompleted ? "bg-gray-700" : "bg-gray-800"}`}
                onClick={handleMissionClick}
            >
                <CardContent className="p-4 flex items-center space-x-4">
                    <mission.icon className={`w-8 h-8 ${mission.color}`} />
                    <div>
                        <h3 className={`text-lg font-semibold ${isCompleted ? "text-green-500 line-through" : "text-gray-200"}`}>
                            {mission.name}
                        </h3>
                        <p className={`text-sm ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                            {mission.description}
                        </p>
                        {mission.modalContent && (
                            <Button variant="outline" className="mt-2">Action</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="p-4 max-w-6xl mx-auto font-mono">
            <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <Button onClick={previousCategory} className="p-2 text-gray-300">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <div className="flex items-center space-x-4">
                            <Button onClick={toggleHideCompleted} variant="outline" className="p-2 text-gray-300">
                                {hideCompleted ? "Show Completed" : "Hide Completed"}
                            </Button>
                        <h2 className="text-xl font-semibold text-gray-200">{categories[currentCategory].name}</h2>
                        <Button onClick={toggleHeight} variant="outline" className="p-2 text-gray-300">
                                {isExpanded ? "Shrink" : "Expand"}
                            </Button>
                        </div>
                        <Button onClick={nextCategory} className="p-2 text-gray-300">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                    <AnimatePresence>
                        <div
                            className={`overflow-y-auto ${isExpanded ? "max-h-80" : "max-h-40"} space-y-2 transition-all duration-300`}
                        >
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                scrollableMissions.map(renderMission)
                            )}
                        </div>
                    </AnimatePresence>
                </CardContent>
            </div>
            <MissionInfoModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                content={modalMissionContent}
            />
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
        {
            missions: communityExpeditions,
            name: "Community Expeditions",
        },
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
                    setCurrentCategory(Math.floor(Math.random() * categories.length));
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

// Research station - walk the user through this. Then upload data, verify/vet (consensus), then we introduce travel. Add a "close"/swipe-down option so that the tutorial section can be hidden/minimised. Then we go through the guide for the different views....and determine the differentials from Pathway.tsx and this new list
// As well as researching for other projects/mission modules that aren't in `mission-selector`
// We'll also need to update this for different planets & chapters

const dialogueSteps: DialogueStep[] = [

];