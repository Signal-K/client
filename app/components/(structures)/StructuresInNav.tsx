import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlacedStructureSingle } from "../_[archive]/(structures)/Single";
import { OwnedItem, UserStructure } from "../_[archive]/(structures)/StructureModal";

interface AllStructuresProps {
  itemsPerPage: number;
}; 

// CREATE A BUTTON THAT POPULATES THE PLANET WITH THE STRUCTURES, POINT, IMPROVE TUTORIAL INSIDE THE STRUCTURES, POST CARD, SHARE (AND CREATE TICKET IN JIRA FOR THIS, MENTION OLD TICKETS)

// INSERT PROFILE COMPLETION INTO THE MISSION/ONBOARDING

// GET NEW TOOLTIPS & SIMPLIFY STRUCTURE MODAL TUTORIALS

// ONBOARDING - GIVE USER SIMPLE TASKS TO START WITH!

export const AllStructures = ({ itemsPerPage }: AllStructuresProps) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchData() {
            if (session && activePlanet) {
                try {
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('owner', session.user.id)
                        .eq('anomaly', activePlanet.id);

                    if (ownedItemsError) {
                        throw ownedItemsError;
                    }

                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);

                        const response = await fetch('/api/gameplay/inventory');
                        if (!response.ok) {
                            throw new Error('Failed to fetch item details from the API');
                        }
                        const itemDetailsData: UserStructure[] = await response.json();

                        if (itemDetailsData) {
                            const structuresData: { ownedItem: OwnedItem; structure: UserStructure }[] = itemDetailsData
                                .filter(itemDetail => itemDetail.ItemCategory === 'Structure' && itemIds.includes(itemDetail.id) && itemDetail.id !== 12)
                                .map(itemDetail => {
                                    const ownedItem = ownedItemsData.find(ownedItem => ownedItem.item === itemDetail.id);
                                    const structure: UserStructure = {
                                        id: itemDetail.id,
                                        name: itemDetail.name,
                                        icon_url: itemDetail.icon_url,
                                        description: itemDetail.description,
                                        cost: itemDetail.cost,
                                        ItemCategory: itemDetail.ItemCategory,
                                        parentItem: itemDetail.parentItem,
                                        itemLevel: itemDetail.itemLevel,
                                        item: 0
                                    };
                                    return { ownedItem: ownedItem || { id: '', item: '', quantity: 0, sector: '' }, structure };
                                });
                            setUserStructures(structuresData);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        }

        fetchData();
    }, [session, activePlanet, supabase]);

    // Function to handle previous button click
    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
    };

    // Function to handle next button click
    const handleNext = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + itemsPerPage, userStructures.length - itemsPerPage));
    };

    return (
        <div className="p-4 relative">
            <div className="relative">
                <div className="grid gap-4 grid-cols-3 md:grid-cols-3">
                    {userStructures.slice(currentIndex, currentIndex + itemsPerPage).map(({ ownedItem, structure }, index) => (
                        <PlacedStructureSingle
                            key={structure.id}
                            ownedItem={ownedItem}
                            structure={structure}
                            style={{
                                position: 'relative',
                                transform: `translate(-50%, -50%)`,
                            }}
                        />
                    ))}
                </div>
                {currentIndex > 0 && (
                    <button
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={handlePrevious}
                    >
                        &#8592;
                    </button>
                )}
                {currentIndex + itemsPerPage < userStructures.length && (
                    <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={handleNext}
                    >
                        &#8594;
                    </button>
                )}
            </div>
        </div>
    );
};
