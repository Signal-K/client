import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Pickaxe, Zap, Battery, Magnet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MineralDeposit } from './mineral-deposit-list';

type Landmark = {
  id: string
  name: string
  description: string
  position: { x: number; y: number }
  isOpen: boolean
};

type Props = {
  deposits: MineralDeposit[]
  roverPosition: { x: number; y: number } | null
  selectedDeposit: MineralDeposit | null
  landmarks: Landmark[]
  onLandmarkClick: (id: string) => void
};

const getMineralIcon = (name: string) => {
  switch (name) {
    case 'Iron':
      return <Magnet className="text-red-500" />
    case 'Copper':
      return <Zap className="text-orange-500" />
    case 'Coal':
      return <Battery className="text-gray-700" />
    case 'Nickel':
      return <Pickaxe className="text-green-500" />
    default:
      return <Pickaxe className="text-blue-500" />
  };
};

export function TerrainMap({ deposits = [], roverPosition, selectedDeposit, landmarks, onLandmarkClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawMap = () => {
      const { width, height } = canvas

      // Clear the canvas
      ctx.clearRect(0, 0, width, height)

      // Draw a placeholder for the 3D terrain
      ctx.fillStyle = '#276e4b' // A brown color for the terrain
      ctx.fillRect(0, 0, width, height)

      // Draw some basic terrain features
      ctx.strokeStyle = '#654321'
      ctx.lineWidth = 2
      for (let i = 0; i < 10; i++) {
        ctx.beginPath()
        ctx.moveTo(0, Math.random() * height)
        ctx.lineTo(width, Math.random() * height)
        ctx.stroke()
      }

      // Draw deposits
      deposits.forEach(deposit => {
        ctx.fillStyle = '#FFD700' // Gold color for deposits
        ctx.beginPath()
        ctx.arc(deposit.position.x * (width / 100), deposit.position.y * (height / 100),
                Math.sqrt(deposit.amount) / 5, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawMap()
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [deposits])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      {deposits.map((deposit) => (
        <div
          key={deposit.id}
          className="absolute"
          style={{ left: `${deposit.position.x}%`, top: `${deposit.position.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {getMineralIcon(deposit.name)}
        </div>
      ))}
      {landmarks.map((landmark) => (
        <Dialog key={landmark.id}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute"
              style={{ left: `${landmark.position.x}%`, top: `${landmark.position.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => onLandmarkClick(landmark.id)}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{landmark.name}</DialogTitle>
              <DialogDescription>{landmark.description}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
{roverPosition && (
  <motion.div
    style={{
      position: 'absolute',
      left: `${roverPosition.x}%`,
      top: `${roverPosition.y}%`,
      transform: 'translate(-50%, -50%)',
    }}
    className="rover-icon"
  >
    {/* Rover icon */}
  </motion.div>
)}
      {selectedDeposit && (
        <div
          className="absolute w-6 h-6 border-2 border-[#5FCBC3] rounded-full"
          style={{ left: `${selectedDeposit.position.x}%`, top: `${selectedDeposit.position.y}%`, transform: 'translate(-50%, -50%)' }}
        />
      )}
    </div>
  )
}