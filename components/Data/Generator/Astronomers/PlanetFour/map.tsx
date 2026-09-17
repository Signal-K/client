import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MapData, LayerState, Season, Feature, SpiderFeature } from '../../../../../types/Generators/planet-4';

const SEASONS: Season[] = ['spring', 'summer']

// Colors based on HiRISE imagery
const COLORS = {
  fan: {
    spring: 'rgba(64, 64, 64, 0.8)',
    summer: 'rgba(139, 69, 19, 0.7)'
  },
  blotch: {
    spring: 'rgba(32, 32, 32, 0.9)',
    summer: 'rgba(101, 67, 33, 0.8)'
  },
  windVector: 'rgba(255, 255, 255, 0.8)',
  ice: {
    spring: 'rgba(200, 200, 255, 0.4)',
    summer: 'rgba(255, 200, 150, 0.2)'
  },
  spiders: 'rgba(30, 30, 30, 0.8)',
  terrain: {
    spring: '#1a1a2e',
    summer: '#2d1810'
  }
}

// Mock data with realistic features
const MOCK_DATA: MapData = {
  features: [
    { id: '1', type: 'fan', position: { lat: 0.3, lng: 0.2 }, orientation: 45, size: 0.8, season: 'spring', intensity: 0.9 },
    { id: '2', type: 'fan', position: { lat: 0.4, lng: 0.6 }, orientation: 120, size: 0.6, season: 'spring', intensity: 0.7 },
    { id: '3', type: 'blotch', position: { lat: 0.6, lng: 0.4 }, size: 0.5, season: 'spring', intensity: 0.8 },
    { id: '4', type: 'blotch', position: { lat: 0.7, lng: 0.7 }, size: 0.7, season: 'spring', intensity: 0.9 },
  ],
  spiders: [
    { position: { lat: 0.5, lng: 0.5 }, size: 1, branches: 8 },
    { position: { lat: 0.3, lng: 0.7 }, size: 0.8, branches: 6 },
  ],
  season: 'spring',
  solarLongitude: 180, // Start of spring
  region: 'South Pole'
}

export default function Planet4Map() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentSeason, setCurrentSeason] = useState<Season>('spring')
  const [timelinePosition, setTimelinePosition] = useState(0)
  const [layers, setLayers] = useState<LayerState>({
    fans: true,
    blotches: true,
    windVectors: true,
    seasonalOverlay: true,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw base terrain
    drawBaseMap(ctx, currentSeason)
    
    // Draw spider features (always visible but more prominent in summer)
    drawSpiderFeatures(ctx, MOCK_DATA.spiders, currentSeason)

    // Draw seasonal features based on layers
    if (layers.seasonalOverlay) {
      drawSeasonalOverlay(ctx, currentSeason, timelinePosition)
    }
    
    if (layers.blotches) {
      drawFeatures(ctx, MOCK_DATA.features.filter(f => f.type === 'blotch'), currentSeason, timelinePosition)
    }
    
    if (layers.fans) {
      drawFeatures(ctx, MOCK_DATA.features.filter(f => f.type === 'fan'), currentSeason, timelinePosition)
    }
    
    if (layers.windVectors) {
      drawWindVectors(ctx, MOCK_DATA.features, timelinePosition)
    }

  }, [layers, currentSeason, timelinePosition])

  return (
    <Card className="w-full max-w-4xl p-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="space-y-6">
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-slate-800">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={layers.fans ? "default" : "outline"}
              onClick={() => setLayers(prev => ({ ...prev, fans: !prev.fans }))}
              className={`
                ${layers.fans ? 'bg-zinc-700 hover:bg-zinc-600' : 'hover:bg-zinc-800'}
                transition-colors
              `}
            >
              Fans
            </Button>
            <Button
              variant={layers.blotches ? "default" : "outline"}
              onClick={() => setLayers(prev => ({ ...prev, blotches: !prev.blotches }))}
              className={`
                ${layers.blotches ? 'bg-stone-700 hover:bg-stone-600' : 'hover:bg-stone-800'}
                transition-colors
              `}
            >
              Blotches
            </Button>
            <Button
              variant={layers.windVectors ? "default" : "outline"}
              onClick={() => setLayers(prev => ({ ...prev, windVectors: !prev.windVectors }))}
              className={`
                ${layers.windVectors ? 'bg-slate-600 hover:bg-slate-500' : 'hover:bg-slate-700'}
                transition-colors
              `}
            >
              Wind Vectors
            </Button>
            <Button
              variant={layers.seasonalOverlay ? "default" : "outline"}
              onClick={() => setLayers(prev => ({ ...prev, seasonalOverlay: !prev.seasonalOverlay }))}
              className={`
                ${layers.seasonalOverlay ? 'bg-blue-900 hover:bg-blue-800' : 'hover:bg-blue-950'}
                transition-colors
              `}
            >
              CO₂ Ice Layer
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Ls = {180 + Math.round(timelinePosition * 0.9)}°</span>
              <span>{currentSeason === 'spring' ? 'Spring → Summer' : 'Summer → Autumn'}</span>
            </div>
            <Slider
              value={[timelinePosition]}
              onValueChange={([value]) => setTimelinePosition(value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex justify-center gap-2">
            {SEASONS.map((season) => (
              <Button
                key={season}
                variant={currentSeason === season ? "default" : "outline"}
                onClick={() => setCurrentSeason(season)}
                className={`
                  ${currentSeason === season ? 'bg-indigo-900 hover:bg-indigo-800' : 'hover:bg-indigo-950'}
                  transition-colors
                `}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function drawBaseMap(ctx: CanvasRenderingContext2D, season: Season) {
  // Create textured background
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height)
  gradient.addColorStop(0, COLORS.terrain[season])
  gradient.addColorStop(1, COLORS.terrain[season])
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Add terrain texture
  for (let i = 0; i < ctx.canvas.width; i += 2) {
    for (let j = 0; j < ctx.canvas.height; j += 2) {
      if (Math.random() > 0.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`
        ctx.fillRect(i, j, 2, 2)
      }
    }
  }
}

function drawSpiderFeatures(ctx: CanvasRenderingContext2D, spiders: SpiderFeature[], season: Season) {
  spiders.forEach(spider => {
    const centerX = spider.position.lng * ctx.canvas.width
    const centerY = spider.position.lat * ctx.canvas.height
    const radius = spider.size * 50

    // Draw spider channels
    for (let i = 0; i < spider.branches; i++) {
      const angle = (i / spider.branches) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      
      // Create curved branch
      const cp1x = centerX + Math.cos(angle) * radius * 0.5
      const cp1y = centerY + Math.sin(angle) * radius * 0.5
      const cp2x = centerX + Math.cos(angle) * radius * 0.75
      const cp2y = centerY + Math.sin(angle) * radius * 0.75
      const endX = centerX + Math.cos(angle) * radius
      const endY = centerY + Math.sin(angle) * radius
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
      
      ctx.strokeStyle = COLORS.spiders
      ctx.lineWidth = season === 'summer' ? 3 : 1
      ctx.stroke()
    }
  })
}

function drawFeatures(ctx: CanvasRenderingContext2D, features: Feature[], season: Season, timelinePosition: number) {
  features.forEach(feature => {
    const color = feature.type === 'fan' ? COLORS.fan[season] : COLORS.blotch[season]
    const visibility = Math.max(0, Math.min(1, 
      season === 'spring' ? 
        timelinePosition / 50 : // Appear in spring
        1 - (timelinePosition - 50) / 50 // Disappear in summer
    ))
    
    if (visibility === 0) return

    if (feature.type === 'fan') {
      // Draw fan shape
      ctx.beginPath()
      ctx.fillStyle = color
      
      const centerX = feature.position.lng * ctx.canvas.width
      const centerY = feature.position.lat * ctx.canvas.height
      const radius = feature.size * 30 * visibility
      
      if (feature.orientation !== undefined) {
        const startAngle = (feature.orientation - 45) * Math.PI / 180
        const endAngle = (feature.orientation + 45) * Math.PI / 180
        
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
      }
      
      ctx.fill()
      
      // Add texture to fan
      ctx.save()
      ctx.clip()
      for (let i = 0; i < radius * 2; i += 2) {
        for (let j = 0; j < radius * 2; j += 2) {
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`
            ctx.fillRect(centerX - radius + i, centerY - radius + j, 2, 2)
          }
        }
      }
      ctx.restore()
    } else {
      // Draw blotch with radial pattern
      const centerX = feature.position.lng * ctx.canvas.width
      const centerY = feature.position.lat * ctx.canvas.height
      const radius = feature.size * 25 * visibility
      
      // Create radial gradient for blotch
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      )
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'transparent')
      
      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function drawWindVectors(ctx: CanvasRenderingContext2D, features: Feature[], timelinePosition: number) {
  const fans = features.filter(f => f.type === 'fan' && f.orientation !== undefined)
  
  // Only show wind vectors in spring when fans are forming
  const visibility = Math.max(0, Math.min(1, 1 - timelinePosition / 100))
  
  if (visibility === 0) return

  fans.forEach(fan => {
    ctx.beginPath()
    ctx.strokeStyle = COLORS.windVector
    ctx.lineWidth = 2 * visibility
    
    const startX = fan.position.lng * ctx.canvas.width
    const startY = fan.position.lat * ctx.canvas.height
    const length = 30 * visibility
    const angle = (fan.orientation || 0) * Math.PI / 180

    // Draw arrow shaft with slight wave
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    
    const controlPoint1X = startX + Math.cos(angle) * length * 0.5
    const controlPoint1Y = startY + Math.sin(angle) * length * 0.5 + Math.sin(timelinePosition / 10) * 5
    
    const endX = startX + Math.cos(angle) * length
    const endY = startY + Math.sin(angle) * length
    
    ctx.quadraticCurveTo(controlPoint1X, controlPoint1Y, endX, endY)
    
    // Draw arrow head
    const headLength = 8 * visibility
    const headAngle = Math.PI / 6
    
    ctx.lineTo(
      endX - headLength * Math.cos(angle - headAngle),
      endY - headLength * Math.sin(angle - headAngle)
    )
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - headLength * Math.cos(angle + headAngle),
      endY - headLength * Math.sin(angle + headAngle)
    )
    
    ctx.stroke()
  })
}

function drawSeasonalOverlay(ctx: CanvasRenderingContext2D, season: Season, timelinePosition: number) {
  ctx.save()
  
  // Calculate ice coverage based on season and timeline
  const coverage = Math.max(0, Math.min(1, 
    season === 'spring' ? 
      1 - timelinePosition / 100 : // Ice melts in spring
      timelinePosition / 100 // Ice forms in summer
  ))
  
  if (coverage === 0) return
  
  // Create ice texture
  const icePattern = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height)
  icePattern.addColorStop(0, COLORS.ice[season])
  icePattern.addColorStop(1, `rgba(255, 255, 255, ${0.1 * coverage})`)
  
  ctx.fillStyle = icePattern
  ctx.globalAlpha = coverage
  
  // Draw ice layer with crystalline pattern
  for (let i = 0; i < ctx.canvas.width; i += 20) {
    for (let j = 0; j < ctx.canvas.height; j += 20) {
      if (Math.random() > 0.3) {
        ctx.beginPath()
        ctx.moveTo(i, j)
        ctx.lineTo(i + 10 + Math.random() * 10, j + Math.random() * 10)
        ctx.lineTo(i + Math.random() * 20, j + 10 + Math.random() * 10)
        ctx.closePath()
        ctx.fill()
      }
    }
  }
  
  ctx.restore()
}

