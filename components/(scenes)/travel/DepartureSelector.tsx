'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Rocket, Clock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Planet, Departure } from '@/types/Travel'

interface DepartureSelectorProps {
  planet: Planet
  onSelect: (departure: Departure) => void
  onBack: () => void
}

const departures: Departure[] = [
  {
    id: '1',
    rocketType: 'Falcon Heavy',
    departureTime: '2023-07-01T09:00:00Z',
    price: 2499,
    duration: '6 months',
    gate: 'A1'
  },
  {
    id: '2',
    rocketType: 'Starship',
    departureTime: '2023-07-02T14:30:00Z',
    price: 3999,
    duration: '4 months',
    gate: 'B3'
  },
  {
    id: '3',
    rocketType: 'New Glenn',
    departureTime: '2023-07-03T20:45:00Z',
    price: 2999,
    duration: '5 months',
    gate: 'C2'
  }
]

export default function DepartureSelector({ planet, onSelect, onBack }: DepartureSelectorProps) {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#2C4F64] flex items-center justify-center">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Select Departure to {planet.name}</h1>
      </header>

      <div className="space-y-4">
        {departures.map((departure, index) => (
          <motion.div
            key={departure.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="bg-[#2C4F64] border-none p-4 cursor-pointer hover:bg-[#2C4F64]/80 transition-colors"
              onClick={() => onSelect(departure)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">{departure.rocketType}</h3>
                  <p className="text-sm text-[#F7F5E9]/60">Gate {departure.gate}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">${departure.price}</span>
                  <p className="text-sm text-[#F7F5E9]/60">per person</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5FCBC3]" />
                  <span className="text-sm">{new Date(departure.departureTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-[#B9E678]" />
                  <span className="text-sm">{departure.duration}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1D2833] to-transparent">
        <Button
          className="w-full bg-[#5FCBC3] hover:bg-[#B9E678] text-[#1D2833]"
          size="lg"
          onClick={() => onSelect(departures[0])}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};