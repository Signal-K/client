import { useEffect, useRef } from 'react'

interface MinimalMapProps {
  width: number
  height: number
}

export function MinimalMap({ width, height }: MinimalMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const drawContours = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#2C4F64'
      ctx.lineWidth = 0.5

      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(0, (height / 5) * i)
        ctx.bezierCurveTo(
          width / 3,
          (height / 5) * i + Math.random() * 20 - 10,
          (2 * width) / 3,
          (height / 5) * i + Math.random() * 20 - 10,
          width,
          (height / 5) * i
        )
        ctx.stroke()
      }
    }

    const raindrops: { x: number; y: number; speed: number; size: number }[] = []

    const createRaindrop = () => {
      raindrops.push({
        x: Math.random() * width,
        y: 0,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
      })
    }

    const drawRain = () => {
      ctx.fillStyle = '#85DDA2'
      raindrops.forEach((drop) => {
        ctx.beginPath()
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2)
        ctx.fill()
        drop.y += drop.speed
        if (drop.y > height) {
          drop.y = 0
          drop.x = Math.random() * width
        }
      })
    }

    const animate = () => {
      drawContours()
      drawRain()
      if (Math.random() < 0.1) createRaindrop()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [width, height])

  return <canvas ref={canvasRef} width={width} height={height} />
}

