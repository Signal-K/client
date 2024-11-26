import React from 'react'
import { motion } from 'framer-motion'
import { User, Planet } from "@/types/Travel";
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface BoardingPassProps {
  user: User
  planet: Planet
  onBeginTrip: () => void
  onCancelBooking: () => void
};

function QRCodePattern() {
  const size = 10
  const cells = Array(size * size).fill(0).map(() => Math.random() > 0.5)

  return (
    <div className="w-full aspect-square bg-[#2C4F64] p-4 rounded-2xl">
      <div className="w-full h-full grid grid-cols-10 gap-1">
        {cells.map((filled, i) => (
          <div key={i} className={`rounded-sm ${filled ? 'bg-[#5FCBC3]' : 'bg-transparent'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default function BoardingPass({ user, planet, onBeginTrip, onCancelBooking }: BoardingPassProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <Card className="w-full max-w-md bg-[#2C4F64] text-[#F7F5E9]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#5FCBC3]">Boarding Pass</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Passenger</span>
              <span>{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Destination</span>
              <span>{planet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Station</span>
              <span>{planet.station}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#F7F5E9]/60">Temperature</span>
              <span>{planet.temperature}°C</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-48">
              <QRCodePattern />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onBeginTrip}
            className="w-full sm:w-1/2 bg-[#5FCBC3] hover:bg-[#B9E678] text-[#1D2833]"
          >
            Begin Trip
          </Button>
          <Button
            onClick={onCancelBooking}
            variant="outline"
            className="w-full sm:w-1/2 border-[#F7F5E9] text-[#F7F5E9] hover:bg-[#F7F5E9]/10"
          >
            Cancel Booking
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};