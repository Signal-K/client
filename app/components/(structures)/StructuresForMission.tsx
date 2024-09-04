import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructuresConfig } from "@/constants/Structures/Properties";
import { IndividualStructureNoModal as IndividualStructure } from "@/app/components/(structures)/IndividualStructure";

interface CitizenScienceModule {
    id: number;
    name: string;
    level?: number; // aka chapter
    starterMission?: number; // used to determine if a user has started it
    structure: number;
};

interface Mission {
    id: number;
    name: string;
    description?: string;
    rewards?: number[];
    classificationModule?: string;
    structure: number;
    chapter?: number;
};

const modules: CitizenScienceModule[] = [
    {
        id: 1, name: "Planet Candidate Identification", level: 1, starterMission: 1372001, structure: 3103,
    },
    {
        id: 2, name: "Animal Observations", level: 1, starterMission: 1370202, structure: 3104,
    },
    {
        id: 21, name: "Animal uploader", level: 1, starterMission: 1370202, structure: 3104,
    },
    {
        id: 4, name: "Cloud identification", level: 1, starterMission: 137121301, structure: 3105,
    },
    {
        id: 5, name: "Map the terrain (of your planet)", level: 1, starterMission: 13714101, structure: 3102,
    },
];

interface MissionStructureDisplayProps {
    activeMission: number;
};

interface StructureConfig {
    name: string;
    title: string;
    labels: { text: string; variant: "default" | "secondary" | "destructive" }[];
    imageSrc: string;
    actions: any[];
    buttons: { icon: React.ReactNode; text: string; showInNoModal: boolean; dynamicComponent?: React.ReactNode; sizePercentage?: number }[];
}

export function MissionStructureDisplay({ activeMission }: MissionStructureDisplayProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [selectedStructure, setSelectedStructure] = useState<StructureConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStructureForMission() {
            if (!session?.user?.id || !activePlanet?.id) {
                setLoading(false);
                return;
            }

            try {
                // Find the corresponding module and structure based on the activeMission ID
                const module = modules.find(mod => mod.starterMission === activeMission);
                if (!module) {
                    setLoading(false);
                    return;
                }

                // Fetch the structure details based on the module's structure ID
                const structureId = module.structure;
                const config = StructuresConfig[structureId];

                // If structure is not defined in StructuresConfig, show "Structure not available"
                if (!config) {
                    setSelectedStructure({
                        name: "Structure not available",
                        title: "",
                        labels: [],
                        imageSrc: "/not-available.svg", // You can use any placeholder image
                        actions: [], // Ensure this is always an array
                        buttons: [], // Ensure this is always an array
                    });
                    setLoading(false);
                    return;
                }

                // Set the selected structure using the config
                setSelectedStructure({
                    name: config.name || "",
                    title: config.title || "", 
                    labels: config.labels || [], 
                    imageSrc: config.imageSrc || "/default-image.svg", 
                    actions: config.actions || [],
                    buttons: config.buttons.map(button => ({
                        ...button,
                        showInNoModal: button.showInNoModal || false, // Provide a default value for missing properties
                    })), 
                });

                // Insert the structure into the user's inventory if not already present
                const { error: insertError } = await supabase
                    .from('inventory')
                    .insert([
                        { owner: session.user.id, anomaly: activePlanet.id, item: structureId,
                             time_of_deploy: new Date().toISOString(),
                             configuration: {"Uses": 1},
                        },
                    ]);

                if (insertError) {
                    console.error("Error inserting structure into inventory:", insertError);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStructureForMission();
    }, [activeMission, session?.user?.id, activePlanet?.id, supabase]);

    const handleClose = () => {
        setTimeout(() => {
            setSelectedStructure(null);
        }, 100);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col space-y-4">
            {selectedStructure && (
                <IndividualStructure
                    key={selectedStructure.name}
                    name={selectedStructure.name}
                    title={selectedStructure.title}
                    labels={selectedStructure.labels.map(label => ({
                      text: label.text,
                      variant: label.variant
                    }))}
                    imageSrc={selectedStructure.imageSrc}
                    actions={selectedStructure.actions}
                    buttons={selectedStructure.buttons}
                    onClose={handleClose}
                />
            )}
        </div>
    );
};