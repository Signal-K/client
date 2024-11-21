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

const MINERALS = ['Iron', 'Copper', 'Coal', 'Nickel'];

const LANDMARKS: Landmark[] = [
  { id: '1', name: 'Base Camp', description: 'Main operations center for the mining colony.', position: { x: 10, y: 10 }, isOpen: false },
  { id: '2', name: 'Power Plant', description: 'Generates power for the entire mining operation.', position: { x: 80, y: 30 }, isOpen: false },
  { id: '3', name: 'Research Lab', description: 'Conducts studies on Martian geology and potential life.', position: { x: 30, y: 70 }, isOpen: false },
];

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
  const [landmarks, setLandmarks] = useState<Landmark[]>(LANDMARKS);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        console.error("User or activePlanet is undefined.");
        return;
      }
  
      const { data, error } = await supabase
        .from("mineralDeposits")
        .select('id, mineralconfiguration')
        .eq('owner', session?.user.id)
        .eq('anomaly', activePlanet?.id)
        .limit(4);
  
      if (error) {
        console.error("Error fetching mineral deposits:", error);
        return;
      }
  
      const formattedDeposits = data?.map((deposit) => ({
        id: deposit.id,
        name: deposit.mineralconfiguration.mineral || "Unknown",
        mineral: deposit.mineralconfiguration.mineral || "Unknown",
        amount: deposit.mineralconfiguration.quantity || 0, // Use 'amount'
        icon_url: deposit.mineralconfiguration.icon_url || "",
        level: deposit.mineralconfiguration.level || 1,
        uses: deposit.mineralconfiguration.uses || [],
        position: deposit.mineralconfiguration.position || { x: 50, y: 50 },
      }));
  
      setMineralDeposits(formattedDeposits || []);
    };
  
    fetchDeposits();
  }, [session, activePlanet, supabase]);  

  // useEffect(() => {
  //   const generateDeposits = () => {
  //     const deposits: MineralDeposit[] = []
  //     for (let i = 0; i < 4; i++) {
  //       const mineral = MINERALS[Math.floor(Math.random() * MINERALS.length)]
  //       deposits.push({
  //         id: `${i + 1}`,
  //         name: mineral,
  //         amount: Math.floor(Math.random() * 500) + 500,
  //         position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
  //       })
  //     }
  //     return deposits
  //   }

  //   setMineralDeposits(generateDeposits())
  //   setRover({ id: '1', name: 'Mars Rover', speed: 15, efficiency: 0.8, miningLevel: 2 })
  //   setInventory(MINERALS.map((mineral, index) => ({ id: `${index + 1}`, name: mineral, amount: 0 })))
  // }, [])

  const handleDepositSelect = (deposit: MineralDeposit) => {
    setSelectedDeposit(deposit)
  }

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
            updateInventory(selectedDeposit.name, 50); // Add mined resources to inventory
            setSelectedDeposit(null); // Reset selected deposit
          }, 5000); // 5 seconds at deposit
        }
      };
  
      requestAnimationFrame(animateRover);
    } else {
      console.error("No deposit selected or rover not available.");
    }
  };  

  const updateInventory = (resourceName: string, amount: number) => {
    setInventory(prev => prev.map(item => 
      item.name === resourceName ? { ...item, amount: item.amount + amount } : item
    ))
  }

  const toggleMap = () => {
    setActiveMap(prev => prev === '2D' ? '3D' : '2D')
  }

  const handleLandmarkClick = (id: string) => {
    setLandmarks(prev => prev.map(landmark => 
      landmark.id === id ? { ...landmark, isOpen: !landmark.isOpen } : landmark
    ))
  }

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
    </div>
  )
}