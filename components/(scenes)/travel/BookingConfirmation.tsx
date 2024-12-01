'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Planet, Departure, User } from '@/types/Travel'

interface BookingConfirmationProps {
  planet: Planet
  departure: Departure
  user: User
  onBack: () => void
};

function QRCodePattern() {
  const size = 10
  const cells = Array(size * size).fill(0).map(() => Math.random() > 0.5)

  return (
    <div className="w-48 h-48 bg-[#2C4F64] p-4 rounded-3xl">
      <div className="w-full h-full grid grid-cols-10 gap-1">
        {cells.map((filled, i) => (
          <div key={i} className={`rounded-sm ${filled ? 'bg-[#5FCBC3]' : 'bg-transparent'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default function BookingConfirmation({ planet, departure, user, onBack }: BookingConfirmationProps) {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#2C4F64] flex items-center justify-center">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Booking Confirmation</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="bg-[#2C4F64] border-none p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{planet.name}</h2>
              <p className="text-sm text-[#F7F5E9]/60">{planet.station}</p>
            </div>
            <Image
              src={planet.image}
              alt={planet.name}
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Passenger</span>
              <span>{user.name
            }</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Departure</span>
              <span>{new Date(departure.departureTime).toLocaleString()}, Gate {departure.gate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Duration</span>
              <span>{departure.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Rocket</span>
              <span>{departure.rocketType}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#F7F5E9]/10">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm text-[#F7F5E9]/60">Total Price</span>
                <p className="text-2xl font-bold">${departure.price}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-[#F7F5E9]/60">Booking Reference</span>
                <p className="font-mono">{planet.name.substring(0, 3).toUpperCase()}-{Math.random().toString(36).substring(2, 7).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <QRCodePattern />
        </div>

        <Button
          className="w-full bg-[#5FCBC3] hover:bg-[#B9E678] text-[#1D2833]"
          size="lg"
        >
          Download Ticket
        </Button>
      </motion.div>
    </div>
  );
};