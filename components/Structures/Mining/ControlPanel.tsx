import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Truck } from 'lucide-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useActivePlanet } from '@/context/ActivePlanet'
import LaunchpadStatus from '../Launchpad/LaunchpadStatus'

type MineralDeposit = {
  id: string;
  name: string;
  quantity: number;
};

type Rover = {
  id: string;
  name: string;
  speed: number;
  efficiency: number;
  miningLevel: number;
};

type Props = {
  rovers: Rover[];
  selectedRover: Rover | null;
  onRoverSelect: (rover: Rover) => void;
  onStartMining: () => void;
  isMining: boolean;
  selectedDeposit: MineralDeposit | null; 
};

export function ControlPanel({
  rovers = [],
  selectedRover,
  onRoverSelect,
  onStartMining,
  isMining,
  selectedDeposit,
}: Props) {
  const [speed, setSpeed] = useState(10);
  const [efficiency, setEfficiency] = useState(0.8);
  const [miningLevel, setMiningLevel] = useState(1);

  useEffect(() => {
    if (selectedRover) {
      setSpeed(selectedRover.speed);
      setEfficiency(selectedRover.efficiency);
      setMiningLevel(selectedRover.miningLevel);
    }
  }, [selectedRover]);

  const handleRoverSelect = (rover: Rover) => {
    onRoverSelect(rover);
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#2C4F64] mb-4">Control Panel</h2>
      <div className="overflow-y-auto flex-grow pr-2">
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-[#303F51]">Select Rover</h3>
          <div className="grid grid-cols-2 gap-2">
            {rovers.map(rover => (
              <div
                key={rover.id}
                className={`p-2 rounded-lg cursor-pointer ${
                  selectedRover?.id === rover.id
                    ? "bg-[#85DDA2] text-[#303F51]"
                    : "bg-[#F7F5E9] hover:bg-[#B9E678] hover:text-[#1D2833]"
                }`}
                onClick={() => handleRoverSelect(rover)}
              >
                <div className="flex items-center space-x-2">
                  <Truck className="text-[#FFE3BA]" />
                  <span className="font-bold text-[#303F51]">{rover.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Now you can use selectedDeposit */}
        {selectedDeposit && (
          <div>
            <h3 className="font-bold mb-2 text-[#303F51]">Selected Deposit</h3>
            <p>
              Name: {selectedDeposit.name}, Quantity: {selectedDeposit.quantity}
            </p>
          </div>
        )}

        <AddMineralDeposits />

        <LaunchpadStatus />

        <Button
          onClick={onStartMining}
          disabled={isMining || !selectedRover}
          className="w-full mt-4 bg-[#5FCBC3] text-white hover:bg-[#85DDA2]"
        >
          {isMining ? "Mining..." : "Start Mining"}
        </Button>
      </div>
    </div>
  );
}

function AddMineralDeposits() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

  const [isLoading, setIsLoading] = useState(false);
  const mineral = 19;

  const handleAddDeposits = async () => {
    setIsLoading(true);

    try {
      const deposits = Array.from({ length: 3 }, () => ({
        anomaly: activePlanet.id ? Number(activePlanet.id) : null,
        owner: session?.user.id,
        mineralconfiguration: {
          mineral: mineral,
          quantity: Math.floor(Math.random() * 100) + 1,
        },
      }));

      const { data, error } = await supabase
        .from("mineralDeposits")
        .insert(deposits);

      if (error) {
        console.error("Error inserting mineral deposits: ", error.message);
        throw error;
      };

      console.log("Mineral deposits added:", data);
    } catch (error) {
      console.error("Error adding mineral deposits:", error);
    } finally {
      setIsLoading(false);
    };
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-[#F7F5E9] rounded-lg shadow">
      <h3 className="font-bold text-[#303F51]">Add Mineral Deposits</h3>
      <Button
        onClick={handleAddDeposits}
        disabled={isLoading}
        className="bg-[#85DDA2] text-white hover:bg-[#5FCBC3]"
      >
        {isLoading ? 'Adding...' : 'Add 3 Deposits'}
      </Button>
    </div>
  );
};