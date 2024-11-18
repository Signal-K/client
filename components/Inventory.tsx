import { useState } from 'react'
import { Diamond, Zap, Gem, Rocket, Crown } from 'lucide-react'

type InventoryItem = {
  id: string
  name: string
  amount: number
}

type Props = {
  inventory: InventoryItem[]
}

export function Inventory({ inventory = [] }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const getIcon = (name: string) => {
    switch (name) {
      case 'Iron':
        return <Diamond className="text-[#FFE3BA]" />
      case 'Copper':
        return <Zap className="text-[#FFE3BA]" />
      case 'Gold':
        return <Gem className="text-[#FFE3BA]" />
      case 'Titanium':
        return <Rocket className="text-[#FFE3BA]" />
      case 'Platinum':
        return <Crown className="text-[#FFE3BA]" />
      default:
        return <Diamond className="text-[#FFE3BA]" />
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-[#2C4F64]">Inventory</h2>
      <div className="flex space-x-4">
        {inventory.map(item => (
          <div 
            key={item.id} 
            className="relative flex items-center space-x-2 bg-gray-100 p-2 rounded-lg"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {getIcon(item.name)}
            <span className="font-bold">{item.amount}</span>
            {hoveredItem === item.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[#2C4F64] text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}