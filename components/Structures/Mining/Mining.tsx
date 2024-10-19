"use client"

import { useState, useEffect } from 'react'
import { MineralDepositList } from './Deposits'
import { ControlPanel } from './ControlPanel'
import { TopographicMap } from './TopographicMap'
import { Inventory } from './Inventory'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useActivePlanet } from '@/context/ActivePlanet'
import { Info } from 'lucide-react'

export type MineralDeposit = {
  id: string;
  mineral: string; 
  quantity: number;
  availableAmount: number;
  level: number;
  uses: string[];
  position: { x: number; y: number };
};

type Rover = {
  id: string
  name: string
  speed: number
  efficiency: number
  miningLevel: number
};

export function MiningComponentComponent() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const { activePlanet } = useActivePlanet()

  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([])
  const [rovers, setRovers] = useState<Rover[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<MineralDeposit | null>(null)
  const [selectedRover, setSelectedRover] = useState<Rover | null>(null)
  const [roverPosition, setRoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [isMining, setIsMining] = useState(false)
  const [hasMission200000013, setHasMission200000013] = useState(false)

  useEffect(() => {
    setRovers([
      { id: '1', name: 'Rover A', speed: 10, efficiency: 0.8, miningLevel: 1 },
      { id: '2', name: 'Rover B', speed: 15, efficiency: 0.7, miningLevel: 2 },
    ])
  }, [])

  useEffect(() => {
    const fetchDeposits = async () => {
      const { data, error } = await supabase
        .from('mineralDeposits')
        .select('id, mineralconfiguration')
        .eq('owner', session?.user.id)
        .eq('anomaly', activePlanet?.id)
        .limit(3);
  
      if (error) {
        console.error('Error fetching mineral deposits:', error)
        return
      };
  
      const formattedDeposits = data?.map((deposit) => ({
        id: deposit.id,
        mineral: deposit.mineralconfiguration.mineral || "Unknown",
        quantity: deposit.mineralconfiguration.quantity || 0, 
        availableAmount: deposit.mineralconfiguration.availableAmount || 0, 
        level: deposit.mineralconfiguration.level || 1,
        uses: deposit.mineralconfiguration.uses || [],
        position: deposit.mineralconfiguration.position || { x: 0, y: 0 }, 
      }))
  
      setMineralDeposits(formattedDeposits || [])
    }
  
    if (session) {
      fetchDeposits()
    }
  }, [session, activePlanet?.id, supabase])
  
  const handleDepositSelect = (deposit: MineralDeposit) => {
    setSelectedDeposit(deposit)
  };

  const handleRoverSelect = (rover: Rover) => {
    setSelectedRover(rover)
  };

  useEffect(() => {
    if (!session) return;
    const fetchMission = async () => {
      try {
        const { data, error } = await supabase
          .from("missions")
          .select("*")
          .eq("user", session.user.id)
          .eq("mission", 200000013)
          .single();
  
        if (error) {
          console.error("Error fetching mission 200000013:", error);
          return;
        };
  
        setHasMission200000013(data !== null);
      } catch (error: any) {
        console.error("Error fetching mission 200000013: ", error);
      };
    }

    fetchMission();
  }, [session, supabase]);

  const handleStartMining = async () => {
    if (selectedDeposit && selectedRover && session) {
      setIsMining(true);
      setRoverPosition({ x: 50, y: 50 });
  
      const duration = 5000;
      const startTime = Date.now();
  
      const animateRover = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
  
        setRoverPosition({
          x: 50 + (selectedDeposit.position.x - 50) * progress,
          y: 50 + (selectedDeposit.position.y - 50) * progress,
        });
  
        if (progress < 1) {
          requestAnimationFrame(animateRover);
        } else {
          setTimeout(async () => {
            setRoverPosition({ x: 50, y: 50 });
            setIsMining(false);
  
            // Mining logic: Insert or update inventory
            const { mineral, quantity } = selectedDeposit;
  
            try {
              const { data: existingItem, error: fetchError } = await supabase
                .from('inventory')
                .select('*')
                .eq('item', mineral)
                .eq('owner', session.user.id)
                .single();
  
              if (fetchError) {
                console.error('Error fetching inventory item:', fetchError);
              };

              const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 200000013,
              };

              if (!hasMission200000013) {
                const { error: updateMissionError } = await supabase
                  .from("missions")
                  .insert([missionData]);

              if (updateMissionError) {
                console.error("Error updating mission 200000013: ", updateMissionError);
              };
            }
  
              if (existingItem) {
                // Update the existing item quantity
                const newQuantity = existingItem.quantity + quantity;
                const { error: updateError } = await supabase
                  .from('inventory')
                  .update({ quantity: newQuantity })
                  .eq('id', existingItem.id);
  
                if (updateError) {
                  console.error('Error updating inventory:', updateError);
                } else {
                  console.log(`Updated inventory item. New quantity: ${newQuantity}`);
                }
              } else {
                // Insert a new inventory item
                const { error: insertError } = await supabase
                  .from('inventory')
                  .insert({
                    item: mineral,
                    owner: session.user.id,
                    quantity,
                    anomaly: activePlanet?.id,
                    time_of_deploy: new Date().toISOString(),
                  });
  
                if (insertError) {
                  console.error('Error inserting new inventory item:', insertError);
                } else {
                  console.log('Inserted new inventory item');
                }
              }
            } catch (error) {
              console.error('Error during mining process:', error);
            }
          }, 5000); // Simulate mining completion delay
        }
      };
  
      requestAnimationFrame(animateRover);
    };
  };  

  return (
    <div className="flex flex-col text-[#F7F5E9] bg-[#1D2833] max-w-4xl mx-auto">
      <div className="flex-1 p-4 overflow-hidden flex flex-col space-y-4">
        <div className="flex-shrink-0">
          <TopographicMap 
            deposits={mineralDeposits} 
            roverPosition={roverPosition}
            selectedDeposit={selectedDeposit}
          />
        </div>
        <div className="bg-[#2C4F64] text-[#F7F5E9] p-4 shadow-lg rounded flex-shrink-0">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            Inventory
            {/* <Tooltip content="Your current resources"> */}
              <Info className="ml-2 h-4 w-4" />
            {/* </Tooltip> */}
          </h2>
          <Inventory />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#2C4F64] rounded-lg p-4 shadow-lg overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              Mineral Deposits
              {/* <Tooltip content="Select a deposit to mine"> */}
                <Info className="ml-2 h-4 w-4" />
              {/* </Tooltip> */}
            </h2>
            <MineralDepositList 
              deposits={mineralDeposits} 
              onSelect={handleDepositSelect} 
              selectedDeposit={selectedDeposit}
            />
          </div>
          <div className="bg-[#2C4F64] rounded-lg p-4 shadow-lg overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              Control Panel
              {/* <Tooltip content="Select a rover and start mining"> */}
                <Info className="ml-2 h-4 w-4" />
              {/* </Tooltip> */}
            </h2>
            <ControlPanel 
              rovers={rovers}
              selectedRover={selectedRover}
              onRoverSelect={handleRoverSelect}
              onStartMining={handleStartMining}
              isMining={isMining}
            />
          </div>
        </div>
      </div>
    </div>
  );
};