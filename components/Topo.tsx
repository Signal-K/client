import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type MineralDeposit = {
  id: string
  name: string
  amount: number
  position: { x: number; y: number }
}

type Props = {
  deposits: MineralDeposit[]
  roverPosition: { x: number; y: number } | null
  selectedDeposit: MineralDeposit | null
}

export function TopographicMap({ deposits = [], roverPosition, selectedDeposit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw topographic map (simplified version)
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw contour lines
    ctx.strokeStyle = '#d0d0d0'
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw deposits
    deposits.forEach(deposit => {
      ctx.fillStyle = deposit.name === 'Iron' ? '#FFE3BA' : '#5FCBC3'
      ctx.beginPath()
      ctx.arc(deposit.position.x, deposit.position.y, Math.sqrt(deposit.amount) / 2, 0, 2 * Math.PI)
      ctx.fill()
      
      // Add deposit name
      ctx.fillStyle = '#2C4F64'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(deposit.name, deposit.position.x, deposit.position.y + Math.sqrt(deposit.amount) / 2 + 20)
    })
  }, [deposits])

  return (
    <div className="relative w-full h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full" width={800} height={400} />
      {roverPosition && (
        <motion.div
          className="absolute w-4 h-4 bg-[#2C4F64] rounded-full"
          style={{ left: roverPosition.x, top: roverPosition.y }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
      {selectedDeposit && (
        <div
          className="absolute w-6 h-6 border-2 border-[#5FCBC3] rounded-full"
          style={{ left: selectedDeposit.position.x - 12, top: selectedDeposit.position.y - 12 }}
        />
      )}
    </div>
  )
}