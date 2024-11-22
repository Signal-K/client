import { useState, useEffect } from 'react';
import { MineralDepositList } from './mineral-deposit-list';
import { TopographicMap } from './topographic-map';
import { TerrainMap } from './terrain-map';
import { Inventory } from './Inventory';
import { Button } from "@/components/ui/button";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { MineralDeposit } from './mineral-deposit-list';

type Rover = {
  id: string
  name: string
  speed: number
  efficiency: number
  miningLevel: number
};

type InventoryItem = {
  id: string
  name: string
  amount: number
};

type Landmark = {
  id: string
  name: string
  description: string
  position: { x: number; y: number }
  isOpen: boolean
};

export function MiningComponentComponent() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();
  
  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([]);
  const [rover, setRover] = useState<Rover | null>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<MineralDeposit | null>(null)
  const [roverPosition, setRoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isMining, setIsMining] = useState(false)
  const [activeMap, setActiveMap] = useState<'2D' | '3D'>('2D')
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  useEffect(() => {
    const fetchLandmarks = async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        console.error("User or activePlanet is undefined.");
        return;
      }
  
      // Fetch inventory from Supabase
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("id, item, quantity")
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id)
        .gt("quantity", 0);
  
      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        return;
      }
  
      // Fetch all item details from API
      const res = await fetch('/api/gameplay/inventory');
      const items = await res.json();
  
      // Filter for structures and map to landmarks
      const structures = inventoryData
        ?.filter((inventoryItem) =>
          items.some(
            (item: { id: any; ItemCategory: string }) =>
              item.id === inventoryItem.item && item.ItemCategory === "Structure"
          )
        )
        .map((inventoryItem) => {
          const itemDetails = items.find(
            (item: { id: any }) => item.id === inventoryItem.item
          );
  
          return {
            id: inventoryItem.id.toString(),
            name: itemDetails?.name || "Unknown",
            description: itemDetails?.description || "No description available",
            position: itemDetails?.position || { x: Math.random() * 100, y: Math.random() * 100 }, // Default to random position
            isOpen: false,
          };
        });
  
      setLandmarks(structures || []);
    };
  
    fetchLandmarks();
  }, [session, activePlanet, supabase]);

  useEffect(() => {
    const fetchDepositsAndInventory = async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        console.error("User or activePlanet is undefined.");
        return;
      }
  
      // Fetch deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("mineralDeposits")
        .select("id, mineralconfiguration")
        .eq("owner", session?.user.id)
        .eq("anomaly", activePlanet?.id);
  
      if (depositsError) {
        console.error("Error fetching mineral deposits:", depositsError);
        return;
      }
  
      const formattedDeposits = deposits?.map((deposit, index) => ({
        id: `${deposit.id}-${index}`, // Ensure uniqueness
        name: deposit.mineralconfiguration.mineral || "Unknown",
        mineral: deposit.mineralconfiguration.mineral || "Unknown",
        amount: deposit.mineralconfiguration.quantity || 0,
        icon_url: deposit.mineralconfiguration.icon_url || "",
        level: deposit.mineralconfiguration.level || 1,
        uses: deposit.mineralconfiguration.uses || [],
        position: deposit.mineralconfiguration.position || { x: 50, y: 50 },
      }));
  
      setMineralDeposits(formattedDeposits || []);
  
      // Fetch inventory and filter structures
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("id, item, quantity")
        .eq("owner", session?.user.id)
        .eq("anomaly", activePlanet?.id)
        .gt("quantity", 0);
  
      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        return;
      }
  
      // Fetch all items from the API route
      const res = await fetch('/api/gameplay/inventory');
      const items = await res.json();
  
      // Filter inventory to include only items of type "Structure"
      const structures = inventoryData
        ?.filter((inventoryItem) =>
          items.some(
            (item: { id: any; ItemCategory: string; }) =>
              item.id === inventoryItem.item &&
              item.ItemCategory === "Structure"
          )
        )
        .map((inventoryItem) => {
          const itemDetails = items.find(
            (item: { id: any; }) => item.id === inventoryItem.item
          );
          return {
            id: inventoryItem.id.toString(),
            name: itemDetails?.name || "Unknown",
            description: itemDetails?.description || "",
            amount: inventoryItem.quantity || 0,
            icon_url: itemDetails?.icon_url || "",
            locationType: itemDetails?.locationType || "Unknown",
          };
        });
  
      setInventory(structures || []);
      setRover({
        id: "1",
        name: "Mars Rover",
        speed: 15,
        efficiency: 0.8,
        miningLevel: 2,
      });
    };
  
    fetchDepositsAndInventory();
  }, [session, activePlanet, supabase]);
  
  const handleDepositSelect = (deposit: MineralDeposit) => {
    console.log("Deposit selected:", deposit); // Debugging line
    setSelectedDeposit(deposit);
  };  

  const handleStartMining = () => {
    if (selectedDeposit && rover) {
      console.log("Starting mining:", selectedDeposit, rover); // Add this to check
      setIsMining(true);
      setRoverPosition({ x: 5, y: 5 }); // Start position
  
      const duration = 5000; // 5 seconds to reach deposit
      const startTime = Date.now();
  
      const animateRover = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
  
        setRoverPosition({
          x: 5 + (selectedDeposit.position.x - 5) * progress,
          y: 5 + (selectedDeposit.position.y - 5) * progress,
        });
  
        if (progress < 1) {
          requestAnimationFrame(animateRover);
        } else {
          // At deposit, start mining
          setTimeout(() => {
            setRoverPosition({ x: 5, y: 5 }); // Return to base
            setIsMining(false);
            updateInventory(selectedDeposit.name, 50); // Update Supabase with mined resources
            setSelectedDeposit(null); // Reset selected deposit
          }, 5000); // 5 seconds at deposit          
        }
      };
  
      requestAnimationFrame(animateRover);
    } else {
      console.error("No deposit selected or rover not available.");
    }
  };  

  const updateInventory = async (resourceName: string, minedAmount: number) => {
    if (!session?.user?.id || !activePlanet?.id) {
      console.error("User or activePlanet is undefined.");
      return;
    }
  
    const existingItem = inventory.find(item => item.name === resourceName);
  
    if (existingItem) {
      // Update existing item in inventory
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: existingItem.amount + minedAmount })
        .eq("id", existingItem.id)
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id);
  
      if (error) {
        console.error("Error updating inventory:", error);
      } else {
        setInventory(prev =>
          prev.map(item =>
            item.id === existingItem.id
              ? { ...item, amount: item.amount + minedAmount }
              : item
          )
        );
      }
    } else {
      // Insert new item into inventory
      const { data, error } = await supabase
        .from("inventory")
        .insert([
          {
            item: resourceName, // Map this to an ID if needed
            owner: session.user.id,
            quantity: minedAmount,
            anomaly: activePlanet.id,
            configuration: { Uses: 1 },
          },
        ])
        .select();
  
      if (error) {
        console.error("Error inserting new item into inventory:", error);
      } else {
        setInventory(prev => [
          ...prev,
          { id: data[0].id.toString(), name: resourceName, amount: minedAmount },
        ]);
      }
    }
  };  

  const toggleMap = () => {
    setActiveMap(prev => prev === '2D' ? '3D' : '2D')
  }

  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);

  const handleLandmarkClick = (id: string) => {
    console.log("Landmark clicked:", id);
    const landmark = landmarks.find((l) => l.id === id);
    if (landmark) {
      setActiveLandmark({ ...landmark, isOpen: true });
    }
  };  

  const closeModal = () => {
    if (activeLandmark) {
      setLandmarks((prev: Landmark[] = []) =>
        prev.map((landmark: Landmark) =>
          landmark.id === activeLandmark.id
            ? { ...landmark, isOpen: false }
            : landmark
        )
      );
      setActiveLandmark(null);
    }
  };  

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 text-[#2C4F64] flex flex-col">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold">Mars Mining Operation</h2>
        <Button
          onClick={toggleMap}
          variant="outline"
          className="text-[#2C4F64] hover:bg-[#5FCBC3]/20"
        >
          Switch to {activeMap === '2D' ? '3D' : '2D'} Map
        </Button>
      </div>
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-3/4 h-1/2 md:h-full relative">
          {activeMap === '2D' ? (
            <TopographicMap 
              deposits={mineralDeposits}
              roverPosition={roverPosition}
              selectedDeposit={selectedDeposit}
              landmarks={landmarks}
              onLandmarkClick={handleLandmarkClick} 
              onDepositSelect={handleDepositSelect}                    
            />
          ) : (
            <TerrainMap 
              deposits={mineralDeposits} 
              roverPosition={roverPosition}
              selectedDeposit={selectedDeposit}
              landmarks={landmarks}
              onLandmarkClick={handleLandmarkClick}
            />
          )}
        </div>
        <div className="w-full md:w-1/4 h-1/2 md:h-full overflow-y-auto bg-white bg-opacity-90 p-4">
          <div className="space-y-4">
            {selectedDeposit ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Selected Deposit: {selectedDeposit.name}</h3>
                <p>Amount: {selectedDeposit.amount} units</p>
                <Button 
  onClick={handleStartMining} 
  disabled={isMining}
  className="w-full mt-4"
>
  {isMining ? 'Mining...' : 'Start Mining'}
</Button>
              </div>
            ) : (
              <MineralDepositList 
                deposits={mineralDeposits} 
                onSelect={handleDepositSelect}
                selectedDeposit={selectedDeposit}
              />
            )}
          </div>
        </div>
      </div>
      <div className="bg-white bg-opacity-90 p-4 border-t border-gray-200">
        <Inventory />
      </div>
      {activeLandmark && (
        <LandmarkModal
          landmark={activeLandmark}
          isOpen={activeLandmark.isOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

type LandmarkModalProps = {
  landmark: Landmark | null;
  isOpen: boolean;
  onClose: () => void;
};

const LandmarkModal: React.FC<LandmarkModalProps> = ({ landmark, isOpen, onClose }) => {
  if (!isOpen || !landmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2">{landmark.name}</h2>
        <p className="text-gray-700">{landmark.description}</p>
      </div>
    </div>
  );
};