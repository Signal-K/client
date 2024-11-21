import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Pickaxe, Zap, Battery, Magnet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type MineralDeposit = {
  id: string
  name: string
  amount: number
  position: { x: number; y: number }
}

type Landmark = {
  id: string
  name: string
  description: string
  position: { x: number; y: number }
  isOpen: boolean
}

type Props = {
  deposits: MineralDeposit[]
  roverPosition: { x: number; y: number } | null
  selectedDeposit: MineralDeposit | null
  landmarks: Landmark[]
  onLandmarkClick: (id: string) => void
}

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
  }
}

const BackgroundMap = ({ deposits }: { deposits: MineralDeposit[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawMap = () => {
      const { width, height } = canvas

      // Draw topographic map
      ctx.fillStyle = '#F5F5DC' // Beige base color
      ctx.fillRect(0, 0, width, height)

      // Draw simplified, spread out contour lines
      ctx.strokeStyle = '#D2B48C' // Tan color for contour lines
      ctx.lineWidth = 1
      for (let i = 0; i < 10; i++) {
        ctx.beginPath()
        const y = (i + 1) * height / 11
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw deposits
      deposits.forEach(deposit => {
        ctx.fillStyle = getDepositColor(deposit.name)
        ctx.beginPath()
        ctx.arc(deposit.position.x * (width / 100), deposit.position.y * (height / 100),
                Math.sqrt(deposit.amount) / 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.strokeStyle = '#2C4F64'
        ctx.lineWidth = 2
        ctx.stroke()
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

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
}

const getDepositColor = (name: string) => {
  switch (name) {
    case 'Iron':
      return '#A52A2A' // Brown
    case 'Copper':
      return '#B87333' // Copper
    case 'Coal':
      return '#36454F' // Charcoal
    case 'Nickel':
      return '#727472' // Nickel
    default:
      return '#FFE3BA'
  }
}

export function TopographicMap({ deposits = [], roverPosition, selectedDeposit, landmarks, onLandmarkClick }: Props) {
  return (
    <div className="absolute inset-0">
      <BackgroundMap deposits={deposits} />
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
          className="absolute w-4 h-4 bg-[#2C4F64] rounded-full"
          style={{ left: `${roverPosition.x}%`, top: `${roverPosition.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
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