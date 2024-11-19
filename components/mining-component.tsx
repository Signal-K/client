import { useState, useEffect } from 'react';
import { MineralDepositList } from './Structures/Mining/Deposits';
import { ControlPanel } from './Structures/Mining/ControlPanel';
// import { TerrainMap } from './terrain-map';
import { Inventory } from './Inventory';

type MineralDeposit = {
  id: string
  name: string
  amount: number
  availableAmount: number
  level: number
  uses: string[]
  position: { x: number; y: number }
};

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

export function MiningComponentComponent() {
  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([])
  const [rovers, setRovers] = useState<Rover[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<MineralDeposit | null>(null)
  const [selectedRover, setSelectedRover] = useState<Rover | null>(null)
  const [roverPosition, setRoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isMining, setIsMining] = useState(false)
  const [activeMap, setActiveMap] = useState<'2D' | '3D'>('2D')

  useEffect(() => {
    setMineralDeposits([
      { id: '1', name: 'Iron', amount: 1000, availableAmount: 500, level: 1, uses: ['Construction', 'Tools'], position: { x: 200, y: 150 } },
      { id: '2', name: 'Copper', amount: 800, availableAmount: 400, level: 2, uses: ['Electronics', 'Wiring'], position: { x: 400, y: 300 } },
      { id: '3', name: 'Gold', amount: 500, availableAmount: 200, level: 3, uses: ['Electronics', 'Jewelry'], position: { x: 300, y: 200 } },
      { id: '4', name: 'Titanium', amount: 600, availableAmount: 300, level: 2, uses: ['Aerospace', 'Medical'], position: { x: 500, y: 250 } },
      { id: '5', name: 'Platinum', amount: 400, availableAmount: 150, level: 4, uses: ['Catalysts', 'Electronics'], position: { x: 150, y: 350 } },
    ])
    setRovers([
      { id: '1', name: 'Rover A', speed: 10, efficiency: 0.8, miningLevel: 1 },
      { id: '2', name: 'Rover B', speed: 15, efficiency: 0.7, miningLevel: 2 },
      { id: '3', name: 'Rover C', speed: 12, efficiency: 0.9, miningLevel: 3 },
      { id: '4', name: 'Rover D', speed: 18, efficiency: 0.6, miningLevel: 4 },
    ])
    setInventory([
      { id: '1', name: 'Iron', amount: 0 },
      { id: '2', name: 'Copper', amount: 0 },
      { id: '3', name: 'Gold', amount: 0 },
      { id: '4', name: 'Titanium', amount: 0 },
      { id: '5', name: 'Platinum', amount: 0 },
    ])
  }, [])

  const handleDepositSelect = (deposit: MineralDeposit) => {
    setSelectedDeposit(deposit)
  }

  const handleRoverSelect = (rover: Rover) => {
    setSelectedRover(rover)
  }

  const handleStartMining = () => {
    if (selectedDeposit && selectedRover) {
      setIsMining(true)
      setRoverPosition({ x: 50, y: 50 }) // Start position
      
      const duration = 5000 // 5 seconds to reach deposit
      const startTime = Date.now()
      
      const animateRover = () => {
        const elapsedTime = Date.now() - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        
        setRoverPosition({
          x: 50 + (selectedDeposit.position.x - 50) * progress,
          y: 50 + (selectedDeposit.position.y - 50) * progress
        })
        
        if (progress < 1) {
          requestAnimationFrame(animateRover)
        } else {
          // At deposit, start mining
          setTimeout(() => {
            setRoverPosition({ x: 50, y: 50 }) // Return to base
            setIsMining(false)
            updateInventory(selectedDeposit.name, 50) // Add mined resources to inventory
          }, 5000) // 5 seconds at deposit
        }
      }
      
      requestAnimationFrame(animateRover)
    }
  }

  const updateInventory = (resourceName: string, amount: number) => {
    setInventory(prev => prev.map(item => 
      item.name === resourceName ? { ...item, amount: item.amount + amount } : item
    ))
  }

  const toggleMap = () => {
    setActiveMap(prev => prev === '2D' ? '3D' : '2D')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-[#2C4F64]">
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Mars Mining Operation</h2>
            <button
              onClick={toggleMap}
              className="px-4 py-2 bg-[#5FCBC3] text-white rounded hover:bg-[#5FCBC3]/80"
            >
              Switch to {activeMap === '2D' ? '3D' : '2D'} Map
            </button>
          </div>
          {/* {activeMap === '2D' ? (
            <TopographicMap 
              deposits={mineralDeposits} 
              roverPosition={roverPosition}
              selectedDeposit={selectedDeposit}
            />
          ) : (
            <TerrainMap 
              deposits={mineralDeposits} 
              roverPosition={roverPosition}
              selectedDeposit={selectedDeposit}
            />
          )} */}
        </div>
        <div className="grid grid-cols-2 gap-4 flex-grow overflow-hidden">
          {/* <div className="bg-white rounded-lg p-4 shadow overflow-hidden flex flex-col">
            <MineralDepositList 
              deposits={mineralDeposits} 
              onSelect={handleDepositSelect} 
              selectedDeposit={selectedDeposit}
            />
          </div>
          <div className="bg-white rounded-lg p-4 shadow overflow-hidden flex flex-col">
            <ControlPanel 
              rovers={rovers}
              selectedRover={selectedRover}
              onRoverSelect={handleRoverSelect}
              onStartMining={handleStartMining}
              isMining={isMining}
            />
          </div> */}
        </div>
      </div>
      <div className="h-24 bg-white p-4 shadow flex-shrink-0">
        <Inventory inventory={inventory} />
      </div>
    </div>
  )
}