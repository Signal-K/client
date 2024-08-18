import React, { useState, useEffect } from 'react';
import { StructureConfigurations } from '@/constants/Structures/Modals';
import { useMissions } from '@/context/MissionContext';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

export interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
  }
  
  export interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
  }
  
  export interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    recipe?: { [key: string]: number };
  }
  
  export interface ButtonConfig {
    icon: string | undefined;
    id: string;
    text: string;
    tooltip: string;
    action: () => void; // Action to be performed when the button is clicked
  }
  

interface StructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItem: OwnedItem;
  structure: UserStructure;
};

interface StructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItem: OwnedItem;
  structure: UserStructure;
}

const StructureModal: React.FC<StructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
  const { missions } = useMissions();
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/gameplay/inventory')
        .then((response) => response.json())
        .then((data: InventoryItem[]) => {
          const item = data.find((item) => item.id === structure.id);
          setInventoryItem(item || null);
        });
    }
  }, [isOpen, structure.id]);

  const config = StructureConfigurations[structure.id] || {};
  const defaultButtons = config.default?.buttons || [];
  const missionButtons = Object.keys(config)
    .filter((key) => !isNaN(Number(key)))  // Filter out the default key
    .map((missionId) => Number(missionId)) // Convert to numbers
    .filter((missionId) => missions.some((mission) => mission.id === missionId && mission.completed))
    .flatMap((completedMissionId) => config[completedMissionId]?.buttons || []);

  const buttonsToShow = [...defaultButtons, ...missionButtons];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-end justify-center bg-gray-800 bg-opacity-50 z-50 transition-transform duration-300 transform translate-y-0">
          <div className="bg-white w-full max-w-md h-5/6 rounded-t-lg shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-center mb-4">
              <img src={structure.icon_url} alt={structure.name} className="w-24 h-24" />
            </div>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-semibold">{structure.name}</h2>
              <p className="text-gray-600">{inventoryItem?.description}</p>
            </div>
            <div className="space-y-2">
              {buttonsToShow.map((button) => (
                <button
                  key={button.id}
                  className="flex items-center p-2 w-full bg-gray-100 rounded-md hover:bg-gray-200"
                  title={button.tooltip}
                  onClick={button.action}
                >
                  <img src={button.icon} alt={button.text} className="w-6 h-6 mr-2" />
                  <span>{button.text}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UserStructures: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();
  const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<UserStructure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id && activePlanet) {
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
                .filter(itemDetail => itemDetail.ItemCategory === 'Structure' && itemIds.includes(itemDetail.id))
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
                  return { ownedItem: ownedItem || { id: '', item: '', quantity: 0, sector: '', anomaly: 0 }, structure };
                });
              setUserStructures(structuresData);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      } else {
        console.error('User ID or active planet is missing');
      }
    };

    fetchData();
  }, [session, activePlanet, supabase]);

  const openModal = (structure: UserStructure) => {
    setSelectedStructure(structure);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStructure(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Structures on your planet</h2>
      <div className="grid gap-4 grid-cols-3 md:grid-cols-3">
        {userStructures.map(({ ownedItem, structure }) => (
          <div
            key={structure.id}
            onClick={() => openModal(structure)}
            className="cursor-pointer flex flex-col items-center"
          >
            <img src={structure.icon_url} alt={structure.name} className="w-16 h-16 mb-2" />
            <p className="text-center text-sm font-medium">{structure.name}</p>
          </div>
        ))}
      </div>

      {selectedStructure && (
        <StructureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          ownedItem={userStructures.find(({ structure }) => structure.id === selectedStructure.id)?.ownedItem || { id: '', item: '', quantity: 0, sector: '', anomaly: 0 }}
          structure={selectedStructure}
        />
      )}
    </div>
  );
};

export default UserStructures;