import React, { useEffect, useState, useCallback } from 'react';
import {
  SkillTreeGroup,
  SkillTree,
  SkillProvider,
  SkillType,
  SkillGroupDataType,
} from 'beautiful-skill-tree';
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CheckInventory, PlacedStructureSingle } from './Structure';

interface InventoryItem {
    id: number;
    item: string;
    owner: string | undefined;
    quantity?: number;
    anomaly: string | undefined;
};

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

type CustomSkillType = SkillType & { unlocked?: boolean };

const initialData: CustomSkillType[] = [
  {
    id: '12',
    title: 'Telescope Signal Receiver',
    tooltip: {
      content:
        <>
            'The base telescope. Provides a base that can then have other add-ons built on top, as well as serving as the base for all off-planet observatories.',
            <CheckInventory itemId={12} />
        </>
    },
    children: [
      {
        id: '14',
        title: 'Transiting Telescope',
        tooltip: {
          content:
            <>
                'An add-on to your telescope base (12) that allows users to view transits',
                <CheckInventory itemId={14} />
            </>
        },
        children: [],
      },
      {
        id: '24',
        title: 'Surveyor',
        tooltip: {
          content:
            <>
                'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly',
                <CheckInventory itemId={24} />
            </>
        },
        children: [],
      },
    ],
  },
  {
    id: '22',
    title: 'Vehicle Structure',
    tooltip: {
      content:
        <>
            'Allows vehicles to dock to them, provides a method for deployment',
            <CheckInventory itemId={22} />
        </>
    },
    children: [], // Can we link this into showing the user's automatons?
  },
];

type UnlockedSkillsType = { [key: string]: boolean };

export default function SkillTreeComp() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [unlockedItems, setUnlockedItems] = useState<InventoryItem[]>([]);
    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);

    useEffect(() => {
        async function fetchUnlockedItems() {
            const { data: inventoryData, error } = await supabase
               .from('inventory')
               .select('*')
               .eq('owner', session?.user.id)
               .eq('anomaly', activePlanet?.id);

            if (error) console.error(error);
            else setUnlockedItems(inventoryData || []);
        };

        async function fetchUserStructures() {
            if (session && activePlanet) {
                try {
                    // Fetch owned items from supabase
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('owner', session.user.id)
                        .eq('anomaly', activePlanet.id)
                        .eq('notes', 'Structure');

                    if (ownedItemsError) {
                        throw ownedItemsError;
                    }

                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);

                        // Fetch item details from the Next.js API
                        const response = await fetch('/api/gameplay/inventory');
                        if (!response.ok) {
                            throw new Error('Failed to fetch item details from the API');
                        }
                        const itemDetailsData: UserStructure[] = await response.json();

                        if (itemDetailsData) {
                            const structuresData: { ownedItem: OwnedItem; structure: UserStructure }[] = itemDetailsData
                                .filter(itemDetail => itemDetail.ItemCategory === 'Structure' && itemIds.includes(itemDetail.id))
                                .map(itemDetail => {
                                    const ownedItem = ownedItemsData.find(ownedItem => ownedItem.item === itemDetail.id);
                                    const structure: UserStructure = {
                                        id: itemDetail.id,
                                        item: itemDetail.id,
                                        name: itemDetail.name,
                                        icon_url: itemDetail.icon_url,
                                        description: itemDetail.description,
                                        cost: itemDetail.cost,
                                        ItemCategory: itemDetail.ItemCategory,
                                        parentItem: itemDetail.parentItem,
                                        itemLevel: itemDetail.itemLevel,
                                    };
                                    return { ownedItem: ownedItem || { id: '', item: '', quantity: 0, sector: '', anomaly: 0 }, structure };
                                });
                            setUserStructures(structuresData);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        }

        fetchUnlockedItems();
        fetchUserStructures();
    }, [session?.user.id, activePlanet?.id, supabase]);

    const unlockSkill = async (skillId: string) => {
        const newItem: InventoryItem = {
            id: Date.now(), // Using current timestamp as a placeholder for id
            item: skillId,
            owner: session?.user.id,
            anomaly: activePlanet?.id, 
        };

        const { error } = await supabase.from('inventory').insert([newItem]);
        if (error) console.error(error);
        else setUnlockedItems([...unlockedItems, newItem]);
    };

    return (
        <div className="p-4 relative">
            <SkillProvider>
                <SkillTreeGroup>
                    {({ skillCount }: SkillGroupDataType) => (
                        <SkillTree
                            treeId="first-tree"
                            title="Structure Tree"
                            data={initialData.map(skill => ({
                               ...skill,
                                unlocked: unlockedItems.some(item => item.item === skill.id.toString()),
                                onClick: () => unlockSkill(skill.id),
                            }))}
                            // description="A list of structures"
                        />
                    )}
                </SkillTreeGroup>
            </SkillProvider>
        </div>
    );
};