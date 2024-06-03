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
import { AllAutomatons } from '../Automatons/Automaton';

interface InventoryItem {
    id: number;
    item: string;
    owner: string | undefined;
    quantity?: number;
    anomaly: string | undefined;
};

type CustomSkillType = SkillType & { unlocked?: boolean };

const initialData: CustomSkillType[] = [
  {
    id: '12',
    title: 'Telescope Signal Receiver',
    tooltip: {
      content:
        'The base telescope. Provides a base that can then have other add-ons built on top, as well as serving as the base for all off-planet observatories.',
    },
    children: [
      {
        id: '14',
        title: 'Transiting Telescope',
        tooltip: {
          content:
            'An add-on to your telescope base (12) that allows users to view transits',
        },
        children: [],
      },
      {
        id: '24',
        title: 'Surveyor',
        tooltip: {
          content:
            <>'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly',
            <AllAutomatons />
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
        'Allows vehicles to dock to them, provides a method for deployment',
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

        fetchUnlockedItems();
    }, [session?.user.id, activePlanet?.id]);
    
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
                        collapsible
                        description="A list of structures"
                    />
                )}
            </SkillTreeGroup>
        </SkillProvider>
    );
}