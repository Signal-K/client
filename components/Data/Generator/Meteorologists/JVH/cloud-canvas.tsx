import { useEffect, useRef } from 'react'
import { CloudPattern } from '../../../../../types/Generators/JVH/atmosphere'
import { getColorsByAltitude } from '../../../../../data/cloud-compositions'

interface CloudCanvasProps {
  patterns: CloudPattern[]
  altitude: number
}

export function CloudCanvas({ patterns, altitude }: CloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    patterns.forEach(pattern => {
      const colors = getColorsByAltitude(altitude, pattern)
      renderCloudPattern(ctx, pattern, canvas.width, canvas.height, colors)
    })
  }, [patterns, altitude])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ 
        background: `linear-gradient(to bottom, 
          ${altitude > 300 ? '#1a365d' : altitude > 100 ? '#2d3748' : '#4a5568'},
          ${altitude > 300 ? '#2d3748' : altitude > 100 ? '#4a5568' : '#718096'})`
      }}
    />
  )
}

function renderCloudPattern(
  ctx: CanvasRenderingContext2D,
  pattern: CloudPattern,
  width: number,
  height: number,
  colors: string[]
) {
  ctx.save()
  
  switch (pattern) {
    case 'featureless':
      renderFeaturelessCloud(ctx, width, height, colors)
      break
    case 'turbulent':
      renderTurbulentCloud(ctx, width, height, colors)
      break
    case 'vortex':
      renderVortex(ctx, width, height, colors)
      break
    case 'bands':
      renderBands(ctx, width, height, colors)
      break
  }
  
  ctx.restore()
}

function renderFeaturelessCloud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  ctx.filter = 'blur(15px)'
  
  // Create layered smooth clouds
  colors.forEach((color, index) => {
    const offset = index * (height / colors.length)
    
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(
        width * (0.3 + Math.random() * 0.4),
        height * (0.3 + Math.random() * 0.4) + offset,
        width * 0.4,
        height * 0.2,
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  })
}

function renderTurbulentCloud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  ctx.filter = 'blur(8px)'
  
  colors.forEach((color, index) => {
    ctx.fillStyle = color
    
    for (let i = 0; i < 15; i++) {
      const x = width * Math.random()
      const y = height * Math.random()
      const size = Math.min(width, height) * 0.3
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      
      for (let j = 0; j < 5; j++) {
        const cp1x = x + size * (Math.random() - 0.5)
        const cp1y = y + size * (Math.random() - 0.5)
        const cp2x = x + size * (Math.random() - 0.5)
        const cp2y = y + size * (Math.random() - 0.5)
        const endX = x + size * (Math.random() - 0.5)
        const endY = y + size * (Math.random() - 0.5)
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
      }
      
      ctx.closePath()
      ctx.fill()
    }
  })
}

function renderVortex(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.4
  
  ctx.filter = 'blur(4px)'
  
  colors.forEach((color, colorIndex) => {
    ctx.fillStyle = color
    
    for (let i = 0; i < 60; i++) {
      const angle = (i / 30) * Math.PI * 2
      const radiusOffset = (colorIndex / colors.length) * maxRadius * 0.3
      const radius = maxRadius - radiusOffset
      
      const x = centerX + Math.cos(angle) * radius * (1 - i / 120)
      const y = centerY + Math.sin(angle) * radius * (1 - i / 120)
      
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function renderBands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  ctx.filter = 'blur(6px)'
  
  const bandCount = colors.length * 2
  const bandHeight = height / bandCount
  
  colors.forEach((color, index) => {
    const y = index * bandHeight * 2
    
    // Main band
    ctx.fillStyle = color
    ctx.fillRect(0, y, width, bandHeight * 2)
    
    // Add texture to bands
    for (let i = 0; i < 8; i++) {
      const x = width * Math.random()
      const localY = y + bandHeight * Math.random()
      
      ctx.beginPath()
      ctx.ellipse(
        x,
        localY,
        width * 0.2,
        bandHeight * 0.8,
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  })
}

