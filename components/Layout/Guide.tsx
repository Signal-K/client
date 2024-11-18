import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, Expand, Telescope, TreeDeciduous, CloudHail, LightbulbIcon, LucideTestTubeDiagonal, CameraIcon, Shapes, PersonStandingIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MissionInfoModal from "../Missions/MissionInfoModal";
import AllClassifications from "@/content/Starnet/YourClassifications";

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

    const categories = [
        { missions: astronomyMissions, name: 'Astronomer' },
        { missions: biologistMissions, name: 'Biologist' },
        { missions: meteorologyMissions, name: 'Meteorologist' },
    ];

    // For modals
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
    
                // Fetch completed missions
                const { data: missionData } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id);
    
                const completedMissionIds = missionData ? missionData.map((mission: { mission: number }) => mission.mission) : [];
    
                // Fetch specific votes based on mission's voteOn classification type
                const voteOnMissions = await Promise.all(globalMissions.map(async (mission) => {
                    if (mission.voteOn) {
                        const { data: specificVotes } = await supabase
                            .from('votes')
                            .select('*')
                            .eq("user_id", session.user.id)
                            .eq("classificationtype", mission.voteOn);  // Check vote classification type
    
                        if (specificVotes && specificVotes.length > 0) {
                            // If the user has voted on this classification, mark the mission as completed
                            if (Array.isArray(mission.id)) {
                                completedMissionIds.push(mission.id[0]);  // Pushing the first element if mission id is an array
                            } else {
                                completedMissionIds.push(mission.id);
                            }
                        }
                    }
                }));
    
                // Check tableEntry and tableColumn
                const additionalChecks = await Promise.all(globalMissions.map(async (mission) => {
                    if (mission.tableEntry && mission.tableColumn) {
                        const { data: tableData } = await supabase
                            .from(mission.tableEntry)
                            .select('*')
                            .eq(mission.tableColumn, session.user.id);
    
                        if (tableData && tableData.length > 0) {
                            // If table data exists, mark mission as completed
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
    
    useEffect(() => {
        const currentMissions = categories[currentCategory].missions;
    
        const filteredGlobalMissions = globalMissions.filter((mission) => {
            if (mission.requiredItem && !ownedItems.includes(mission.requiredItem)) {
                return false;
            }
            return true;
        });
    
        const missionsToDisplay = [
            ...currentMissions,
            ...filteredGlobalMissions,
        ];
    
        const uniqueMissions = [
            ...new Map(missionsToDisplay.map(mission => [Array.isArray(mission.id) ? mission.id[0] : mission.id, mission])).values(),
        ];
    
        setScrollableMissions(uniqueMissions);
    }, [currentCategory, ownedItems]);

    const [modalMissionContent, setModalMissionContent] = useState<React.ReactNode>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

    useEffect(() => {
        const currentMissions = categories[currentCategory].missions;

        const filteredGlobalMissions = globalMissions.filter((mission) => {
            if (mission.requiredItem && !ownedItems.includes(mission.requiredItem)) {
                return false;
            }
            return true;
        });

        const missionsToDisplay = [
            ...currentMissions,
            ...filteredGlobalMissions,
        ];

        const uniqueMissions = [
            ...new Map(missionsToDisplay.map(mission => [mission.id, mission])).values(),
        ];

        setScrollableMissions(uniqueMissions);
    }, [currentCategory, ownedItems]);

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
                        <h2 className="text-xl font-semibold text-gray-200">{categories[currentCategory].name}</h2>
                        <Button onClick={nextCategory} className="p-2 text-gray-300">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                    <AnimatePresence>
                    <div className="overflow-y-auto max-h-40 space-y-2">
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