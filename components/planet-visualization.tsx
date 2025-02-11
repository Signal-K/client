'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { PlanetStats } from '../utils/planet-physics'

interface PlanetVisualizationProps {
  stats: PlanetStats
}

export function PlanetVisualization({ stats }: PlanetVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 500
    const height = 500
    const resolution = 75

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])

    // Create sphere projection
    const projection = d3.geoOrthographic()
      .scale(stats.radius * 180)
      .translate([0, 0])
      .clipAngle(90)

    // Create path generator
    const path = d3.geoPath().projection(projection)

    // Generate features
    const features = []
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const lat = (y / resolution) * 180 - 90
        const lon = (x / resolution) * 360 - 180
        const elevation = Math.random() // Simple random elevation for demonstration
        
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          properties: {
            elevation,
            color: getColor(elevation, stats.density, stats.type)
          }
        })
      }
    }

    // Create atmospheric gradient
    const atmosphere = svg.append('defs')
      .append('radialGradient')
      .attr('id', 'atmosphere')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')

    if (stats.type === 'gaseous') {
      // Gas giant atmosphere
      atmosphere.append('stop')
        .attr('offset', '85%')
        .attr('stop-color', stats.density > 1.5 ? '#FFB90F' : '#B8E2F2')
        .attr('stop-opacity', 0.2)
      
      atmosphere.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000')
        .attr('stop-opacity', 0)

      // Add cloud bands
      const cloudBands = Array.from({ length: resolution * resolution }, () => Math.random())
      const cloudFeatures = features.map((f: any, i) => ({
        ...f,
        properties: {
          ...f.properties,
          cloud: cloudBands[i]
        }
      }))

      // Draw cloud layers
      svg.selectAll('.clouds')
        .data(cloudFeatures)
        .enter()
        .append('path')
        .attr('d', (d: any) => path(d))
        .attr('fill', (d: any) => {
          const alpha = Math.max(0, d.properties.cloud * 0.3)
          return `rgba(255, 255, 255, ${alpha})`
        })
        .attr('stroke', 'none')
    } else {
      // Rocky planet atmosphere
      atmosphere.append('stop')
        .attr('offset', '85%')
        .attr('stop-color', '#4B9CD3')
        .attr('stop-opacity', 0.15)
      
      atmosphere.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000')
        .attr('stop-opacity', 0)
    }

    // Draw atmosphere
    svg.append('circle')
      .attr('r', stats.radius * 190)
      .attr('fill', 'url(#atmosphere)')

    // Draw planet surface with elevation-based shadows
    svg.selectAll('.surface')
      .data(features)
      .enter()
      .append('path')
      .attr('d', (d: any) => path(d))
      .attr('fill', (d: any) => d.properties.color)
      .attr('stroke', 'none')
      .style('filter', 'blur(1px)') // Add slight blur for smoother appearance

    // Add subtle rotation
    let rotate = 0
    d3.timer(() => {
      rotate += 0.2 // Reduced rotation speed
      projection.rotate([rotate, -23.5])
      svg.selectAll('path').attr('d', (d: any) => path(d))
    })

  }, [stats])

  function getColor(elevation: number, density: number, type: 'terrestrial' | 'gaseous'): string {
    if (type === 'gaseous') {
      return density > 1.5 ? `rgb(${255 * elevation}, ${165 * elevation}, ${0})` : `rgb(${183 * elevation}, ${226 * elevation}, ${242 * elevation})`
    } else {
      if (elevation < 0.3) return `rgb(${30 * elevation}, ${77 * elevation}, ${107 * elevation})` // Deep water
      if (elevation < 0.5) return `rgb(${205 * elevation}, ${133 * elevation}, ${63 * elevation})` // Beach
      return `rgb(${139 * elevation}, ${69 * elevation}, ${19 * elevation})` // Land
    }
  }

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef} />
    </div>
  )
}

