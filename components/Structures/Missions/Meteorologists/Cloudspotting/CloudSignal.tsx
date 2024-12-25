import { useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from 'lucide-react'

type CloudShape = 'arch' | 'loop' | 'wisp'
type Cloud = {
  id: string
  altitude: number
  shape: CloudShape
  offset: number
}

// Cloud color ranges
const COLOR_RANGES = {
  low: { r: 255, g: 255, b: 255 },    // White
  mid: { r: 135, g: 206, b: 235 },    // Sky Blue
  high: { r: 255, g: 253, b: 150 }    // Light Yellow
}

const generateCloudPath = (shape: CloudShape, width: number, height: number, offset: number = 0) => {
  const points: [number, number][] = []
  const steps = 100
  
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    let y = 0
    
    switch (shape) {
      case 'arch':
        y = Math.sin((i / steps) * Math.PI) * height + offset
        break
      case 'loop':
        y = Math.sin((i / steps) * Math.PI * 2) * height + offset
        break
      case 'wisp':
        y = (Math.sin((i / steps) * Math.PI) * Math.cos((i / steps) * Math.PI * 3)) * height + offset
        break
    }
    points.push([x, y])
  }
  
  return points
}

const drawFluffyCloud = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  ctx.save()
  ctx.beginPath()
  
  // Base circle
  ctx.arc(x + width * 0.5, y + height * 0.5, height * 0.3, 0, Math.PI * 2)
  
  // Additional circles for fluffy appearance
  ctx.arc(x + width * 0.3, y + height * 0.4, height * 0.25, 0, Math.PI * 2)
  ctx.arc(x + width * 0.7, y + height * 0.4, height * 0.25, 0, Math.PI * 2)
  ctx.arc(x + width * 0.2, y + height * 0.5, height * 0.2, 0, Math.PI * 2)
  ctx.arc(x + width * 0.8, y + height * 0.5, height * 0.2, 0, Math.PI * 2)
  
  // Fill with gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + height)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, color.replace(/[^,]+(?=\))/, '0.5')) // Reduce opacity for bottom of cloud
  
  ctx.fillStyle = gradient
  ctx.fill()
  
  // Add glow effect
  ctx.shadowColor = color
  ctx.shadowBlur = 15
  ctx.fill()
  
  ctx.restore()
}

const getCloudColor = (altitude: number, shape: CloudShape) => {
  const normalizedAltitude = (altitude - 50) / 30 // 0 to 1
  let color
  
  if (normalizedAltitude < 0.33) {
    color = COLOR_RANGES.low
  } else if (normalizedAltitude < 0.66) {
    color = COLOR_RANGES.mid
  } else {
    color = COLOR_RANGES.high
  }
  
  // Adjust opacity based on shape
  const opacity = shape === 'wisp' ? 0.7 : 0.9
  
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
}

export default function CloudSignal() {
  const [clouds, setClouds] = useState<Cloud[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cloudVisRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [time, setTime] = useState(0)

  const addCloud = () => {
    if (clouds.length >= 4) return
    setClouds(prev => [...prev, {
      id: Math.random().toString(),
      altitude: 65,
      shape: 'arch',
      offset: 0
    }])
  }

  const removeCloud = (id: string) => {
    setClouds(prev => prev.filter(cloud => cloud.id !== id))
  }

  const updateCloud = (id: string, updates: Partial<Cloud>) => {
    setClouds(prev => prev.map(cloud => 
      cloud.id === id ? { ...cloud, ...updates } : cloud
    ))
  }

  useEffect(() => {
    const animate = () => {
      setTime(t => (t + 1) % 360)
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const cloudVis = cloudVisRef.current
    if (!canvas || !cloudVis) return

    const ctx = canvas.getContext('2d')
    const cloudCtx = cloudVis.getContext('2d')
    if (!ctx || !cloudCtx) return

    // Set canvas sizes
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    cloudVis.width = rect.width * dpr
    cloudVis.height = rect.height * dpr
    cloudCtx.scale(dpr, dpr)

    // Clear canvases
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    cloudCtx.fillStyle = '#000'
    cloudCtx.fillRect(0, 0, cloudVis.width, cloudVis.height)

    // Draw atmosphere gradient (signal graph)
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, 'rgba(25, 25, 112, 0.2)')
    gradient.addColorStop(1, 'rgba(65, 105, 225, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw altitude scale
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    for (let alt = 50; alt <= 80; alt += 5) {
      const y = rect.height - ((alt - 50) / 30) * rect.height
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
    }
    ctx.stroke()

    // Draw clouds on signal graph
    clouds.forEach(cloud => {
      const points = generateCloudPath(
        cloud.shape,
        rect.width,
        50,
        ((cloud.altitude - 50) / 30) * rect.height
      )

      ctx.beginPath()
      points.forEach(([x, y], i) => {
        const offsetY = Math.sin((x + time) * 0.05) * 5
        if (i === 0) {
          ctx.moveTo(x, rect.height - y - offsetY)
        } else {
          ctx.lineTo(x, rect.height - y - offsetY)
        }
      })

      const color = getCloudColor(cloud.altitude, cloud.shape)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Add glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.stroke()
    })

    // Draw cloud visualization
    cloudCtx.save()
    cloudCtx.fillStyle = '#1a1a1a'
    cloudCtx.fillRect(0, 0, rect.width, rect.height)
    
    // Draw color swatches
    const swatchSize = 30
    const swatchGap = 10
    const startX = rect.width - (swatchSize + swatchGap) * 3
    const startY = swatchGap
    
    Object.values(COLOR_RANGES).forEach((color, i) => {
      cloudCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
      cloudCtx.fillRect(
        startX + i * (swatchSize + swatchGap),
        startY,
        swatchSize,
        swatchSize
      )
    })

    // Draw visual cloud representations
    clouds.forEach((cloud, i) => {
      const cloudWidth = rect.width / 6
      const cloudHeight = rect.height / 6
      const x = (i + 1) * (rect.width / 5) - cloudWidth / 2
      const y = rect.height - ((cloud.altitude - 50) / 30) * rect.height - cloudHeight / 2
      
      drawFluffyCloud(
        cloudCtx,
        x,
        y,
        cloudWidth,
        cloudHeight,
        getCloudColor(cloud.altitude, cloud.shape)
      )
    })
    
    cloudCtx.restore()
  }, [clouds, time])

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto bg-gray-950">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Mesospheric Cloud Generator</h2>
          <Button
            onClick={addCloud}
            disabled={clouds.length >= 4}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cloud
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-800">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-800">
            <canvas
              ref={cloudVisRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {clouds.map(cloud => (
            <div key={cloud.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-900">
              <Select
                value={cloud.shape}
                onValueChange={(value: CloudShape) => updateCloud(cloud.id, { shape: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arch">Arch</SelectItem>
                  <SelectItem value="loop">Loop</SelectItem>
                  <SelectItem value="wisp">Wisp</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Altitude: {cloud.altitude}km</div>
                <Slider
                  value={[cloud.altitude]}
                  min={50}
                  max={80}
                  step={1}
                  onValueChange={([value]) => updateCloud(cloud.id, { altitude: value })}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCloud(cloud.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

