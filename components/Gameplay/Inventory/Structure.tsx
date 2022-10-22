// A component to show the structures on the user's active planet

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

interface StructureSingleProps {
    userStructure: UserStructure;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

export const StructureSingle: React.FC = () => { // <StructureSingleProps> = ({ userStructure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [structures, setStructures] = useState<UserStructure[]>([]);
    const [activeSector, setActiveSector] = useState<Number>();
    const [isCalloutOpen, setIsCalloutOpen] = useState(false);

    const fetchStructures = async () => {
        try {
            const { data, error } = await supabase
                .from('inventoryITEMS')
                .select('id, name, description, icon_url')
                .eq('ItemCategory', 'Structure');

            if (data) {
                const structuredData: UserStructure[] = data.map((item: any) => ({
                    id: item.id,
                    item: item.item, // Ensure the 'item' property is present
                    name: item.name,
                    icon_url: item.icon_url,
                    description: item.description
                }));
                setStructures(structuredData);
            };

            if (error) {
                console.error(error.message);
            }
        } catch (error: any) {
            console.error(error.message);
        }
    };

    const fetchUserSector = async () => { // Temporary function to determine where to put the structure. We haven't got this determined yet from a narrative standpoint
        try {
            const { data, error } = await supabase
                .from("basePlanetSectors")
                .select('id')
                .eq("anomaly", activePlanet?.id)
                .eq('owner', session?.user?.id)
                .limit(1);

            if (data && data.length > 0) {
                setActiveSector(data[0].id);
            }

            if (error) {
                console.error(error.message);
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const createInventoryUserEntry = async (structure: UserStructure) => {
        if (session && activePlanet?.id) {
            try {
                const { data, error } = await supabase
                    .from('inventoryUSERS')
                    .upsert([
                        {
                            item: structure.id,
                            owner: session?.user?.id,
                            quantity: 1,
                            planetSector: activeSector,
                        },
                    ]);

                if (data) {
                    console.log('Inventory user entry created: ', data);
                };

                if (error) {
                    console.log(error.message);
                };
            } catch (error: any) {
                console.log(error);
            };
        };
    };

    return (
        <p>{activePlanet?.id}</p>
    );
};