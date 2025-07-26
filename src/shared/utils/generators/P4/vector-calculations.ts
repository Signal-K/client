import { Feature, WindVector } from '@/types/Generators/planet-4'

export function calculateWindVectors(features: Feature[]): WindVector[] {
  const fans = features.filter(f => f.type === 'fan' && f.orientation !== undefined)
  
  // Group fans by grid cells
  const gridSize = 0.1 // 10% of the map size
  const grid: { [key: string]: Feature[] } = {}
  
  fans.forEach(fan => {
    const gridX = Math.floor(fan.position.lng / gridSize)
    const gridY = Math.floor(fan.position.lat / gridSize)
    const key = `${gridX},${gridY}`
    
    if (!grid[key]) grid[key] = []
    grid[key].push(fan)
  })
  
  // Calculate average wind vector for each grid cell
  return Object.entries(grid).map(([key, cellFans]) => {
    const [gridX, gridY] = key.split(',').map(Number)
    
    const avgDirection = cellFans.reduce((sum, fan) => sum + (fan.orientation || 0), 0) / cellFans.length
    const strength = cellFans.length / 10 // Normalize strength based on fan count
    
    return {
      position: {
        lat: (gridY + 0.5) * gridSize,
        lng: (gridX + 0.5) * gridSize
      },
      direction: avgDirection,
      strength: Math.min(strength, 1)
    }
  })
}

