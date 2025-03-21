"use client"

import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { determineLiquidType } from "@/utils/planet-physics";
import type { PlanetStats } from "@/utils/planet-physics";
import { generatePerlinNoise } from "@/utils/noise";
import { X } from "lucide-react";
import type { Landmark } from "@/utils/landmark-types";
import { LANDMARK_COLORS, LANDMARK_ICONS } from "@/utils/landmark-types";

interface PlanetTopographicMapProps {
  stats: PlanetStats
  width?: number
  height?: number
  showLabels?: boolean
  showContours?: boolean
  showColorScale?: boolean
  focusPoint?: {
    x: number
    y: number
    region: number
  }
  selectedLandmark?: Landmark
  onTerrainDataGenerated?: (terrainData: Array<{ x: number; y: number; elevation: number }>) => void
}

// Update the TerrainPoint interface to include precipitation compound
interface TerrainPoint {
  x: number
  y: number
  elevation: number
  biome: string
  temp: number
  region: number
  distance: number
  precipitationCompound?: string
}

export function PlanetTopographicMap({
  stats,
  width = 600,
  height = 600,
  showLabels = true,
  showContours = true,
  showColorScale = true,
  focusPoint,
  selectedLandmark,
  onTerrainDataGenerated,
}: PlanetTopographicMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [hoveredCell, setHoveredCell] = useState<TerrainPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<TerrainPoint | null>(null)

  // Use a lower resolution for better performance
  const resolution = 100

  // Generate terrain data based on planet stats
  const { terrainData, elevationGrid, elevationRange, colorScale, regionColors } = useMemo(() => {
    // Create a noise generator with seed based on planet properties
    const seed = stats.mass * 1000 + stats.radius * 100 + (stats.temperature || 288)
    const noiseGenerator = generatePerlinNoise(seed, 6, 0.5, 2.0)

    // Generate grid of elevation data
    const terrainData: TerrainPoint[] = []
    const elevationGrid = new Array(resolution * resolution)

    // Track min/max elevation for scaling
    let minElevation = Number.POSITIVE_INFINITY
    let maxElevation = Number.NEGATIVE_INFINITY

    // Generate terrain data using noise
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const index = y * resolution + x

        // Convert grid coordinates to spherical coordinates
        const phi = (x / resolution) * Math.PI * 2 // longitude (0 to 2π)
        const theta = (y / resolution) * Math.PI // latitude (0 to π)

        // Convert to 3D coordinates on unit sphere
        const nx = Math.sin(theta) * Math.cos(phi)
        const ny = Math.sin(theta) * Math.sin(phi)
        const nz = Math.cos(theta)

        // Calculate distance from center (for grouping)
        const distance = Math.sqrt(nx * nx + ny * ny + nz * nz)

        // Generate base elevation using noise
        let elevation = noiseGenerator(nx * 2, ny * 2, nz * 2)

        // Apply planet-specific modifications
        if (stats.type === "terrestrial") {
          // Add more varied terrain for terrestrial planets
          elevation = elevation * (stats.surfaceRoughness || 0.5)

          // Create more dramatic mountains if plate tectonics is high
          if (stats.plateTectonics && stats.plateTectonics > 0.5) {
            const mountainNoise = noiseGenerator(nx * 5, ny * 5, nz * 5)
            elevation += mountainNoise * stats.plateTectonics * 0.5
          }

          // Add craters for rocky planets with low atmosphere
          // if (stats.soilType === "rocky" && stats.atmosphereStrength < 0.3) {
          //   const craterNoise = noiseGenerator(nx * 8, ny * 8, nz * 8)
          //   if (craterNoise > 0.7) {
          //     elevation -= (craterNoise - 0.7) * 2
          //   }
          // }

          // For oceanic worlds, lower the overall terrain and create a water level
          if (stats.biome === "Oceanic World") {
            elevation = elevation * 0.3 - 0.6
          }

          // Apply water level
          if (stats.waterLevel && stats.waterLevel > 0) {
            const waterThreshold = -0.2 + stats.waterLevel * 0.4
            if (elevation < waterThreshold) {
              // Smooth out underwater terrain
              elevation = waterThreshold - (waterThreshold - elevation) * 0.3
            }
          }
        } else {
          // Gas giants have bands and less dramatic elevation changes
          elevation = elevation * 0.3

          // Add horizontal bands
          const bandEffect = Math.sin(theta * 10) * 0.2
          elevation += bandEffect

          // Add storm features
          const stormNoise = noiseGenerator(nx * 10, ny * 10, nz * 10)
          if (stormNoise > 0.7) {
            elevation += (stormNoise - 0.7) * (stats.stormFrequency || 0.2) * 2
          }
        }

        // Calculate temperature variation based on latitude and elevation
        const baseTemp = stats.temperature || 288
        const latitudeEffect = Math.cos(theta) * 30 // Hotter at equator, colder at poles
        const elevationEffect = elevation * 20 // Higher elevation = colder
        const localTemp = baseTemp + latitudeEffect - elevationEffect

        // Track min/max for scaling
        minElevation = Math.min(minElevation, elevation)
        maxElevation = Math.max(maxElevation, elevation)

        // Add to terrain data and elevation grid
        elevationGrid[index] = elevation

        // We'll assign the region later after we know the full elevation range
        // Update the terrain data generation to include precipitation compound
        terrainData.push({
          x: x,
          y: y,
          elevation: elevation,
          biome: stats.biome || "Unknown",
          temp: localTemp,
          region: 0, // Placeholder
          distance: distance,
          // precipitationCompound: stats.precipitationCompound || "none",
        })
      }
    }

    // Now that we have the full elevation range, assign regions (approximately 20)
    const numRegions = 20
    const regionStep = (maxElevation - minElevation) / numRegions

    // Generate distinct colors for each region
    const regionColors: string[] = []
    for (let i = 0; i < numRegions; i++) {
      // Generate a color based on the region's position in the elevation range
      const hue = (i / numRegions) * 240 // Blue to red spectrum
      regionColors.push(`hsl(${hue}, 80%, 50%)`)
    }

    // Assign regions to each point
    terrainData.forEach((point, i) => {
      const regionIndex = Math.min(numRegions - 1, Math.floor((point.elevation - minElevation) / regionStep))
      terrainData[i].region = regionIndex
    })

    // Create color scale based on planet type and biome
    let colorScale: d3.ScaleLinear<string, string>

    if (stats.type === "terrestrial") {
      const liquidInfo = determineLiquidType(stats.temperature || 288)

      if (stats.biome === "Oceanic World") {
        // Ocean world color scale (mostly blues with some green islands)
        colorScale = d3.scaleLinear<string>().domain([minElevation, -0.4, -0.2, 0, 0.2, maxElevation]).range([
          "#000033", // Deep ocean
          "#0000AA", // Ocean
          "#0099FF", // Shallow water
          "#00CC66", // Coast
          "#AADD88", // Land
          "#DDDDAA", // Mountains
        ])
      } else if (stats.biome === "Volcanic Terrain") {
        // Volcanic terrain (dark with reds and blacks)
        colorScale = d3.scaleLinear<string>().domain([minElevation, -0.3, 0, 0.3, 0.6, maxElevation]).range([
          "#111111", // Deep cracks
          "#333333", // Dark rock
          "#663333", // Volcanic rock
          "#993333", // Hot rock
          "#CC3300", // Lava flows
          "#FFCC00", // Active lava
        ])
      } else if ((stats.temperature || 288) < 200) {
        // Cold world (blues and whites)
        colorScale = d3.scaleLinear<string>().domain([minElevation, -0.3, 0, 0.3, 0.6, maxElevation]).range([
          "#0066CC", // Deep ice
          "#66CCFF", // Ice
          "#AADDFF", // Frozen terrain
          "#DDEEFF", // Snow
          "#EEEEFF", // High snow
          "#FFFFFF", // Peaks
        ])
      } else {
        // Standard terrestrial (blues, greens, browns)
        colorScale = d3.scaleLinear<string>().domain([minElevation, -0.3, -0.1, 0.1, 0.4, 0.7, maxElevation]).range([
          "#000066", // Deep ocean
          "#0066AA", // Ocean
          "#00AACC", // Shallow water
          "#33CC66", // Lowlands
          "#77AA44", // Hills
          "#AA8866", // Mountains
          "#DDDDDD", // Peaks
        ])
      }
    } else {
      // Gas giant (bands of colors)
      colorScale = d3.scaleLinear<string>().domain([minElevation, -0.3, -0.1, 0.1, 0.3, maxElevation]).range([
        "#331100", // Deep atmosphere
        "#663300", // Lower atmosphere
        "#AA6600", // Mid atmosphere
        "#DDAA33", // Upper atmosphere
        "#FFCC66", // Cloud tops
        "#FFFFFF", // High clouds
      ])
    }

    return {
      terrainData,
      elevationGrid,
      elevationRange: [minElevation, maxElevation],
      colorScale,
      regionColors,
    }
  }, [stats, resolution])

  // Modify the useEffect that calls onTerrainDataGenerated to prevent multiple calls
  // Replace the existing useEffect with this version that uses a more stable approach

  // Add a ref to track if we've already called the callback
  const terrainDataGeneratedRef = useRef(false)

  // Call the callback with the generated terrain data if provided
  useEffect(() => {
    if (onTerrainDataGenerated && terrainData.length > 0 && !terrainDataGeneratedRef.current) {
      // Set the ref to true BEFORE calling the callback to prevent potential loops
      terrainDataGeneratedRef.current = true

      // Use setTimeout to ensure this happens after the current render cycle
      setTimeout(() => {
        onTerrainDataGenerated(
          terrainData.map((point) => ({
            x: point.x,
            y: point.y,
            elevation: point.elevation,
          })),
        )
      }, 0)
    }

    // Reset the ref when stats change significantly
    return () => {
      if (stats.mass !== prevMassRef.current || stats.radius !== prevRadiusRef.current) {
        terrainDataGeneratedRef.current = false
        prevMassRef.current = stats.mass
        prevRadiusRef.current = stats.radius
      }
    }
  }, [terrainData, onTerrainDataGenerated, stats.mass, stats.radius]) // Only include key stats that would require regenerating terrain

  // Add refs to track previous values for comparison
  const prevMassRef = useRef(stats.mass)
  const prevRadiusRef = useRef(stats.radius)

  // Render the terrain on canvas (much faster than SVG for pixel data)
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Calculate cell size
    const cellWidth = width / resolution
    const cellHeight = height / resolution

    // Draw terrain cells
    terrainData.forEach((cell) => {
      const x = cell.x * cellWidth
      const y = cell.y * cellHeight

      // Simplified approach: just use region colors for a cleaner look
      ctx.fillStyle = regionColors[cell.region]
      ctx.fillRect(x, y, cellWidth + 0.5, cellHeight + 0.5)
    })
  }, [terrainData, colorScale, regionColors, width, height, resolution])

  // Render SVG overlays (contours, labels, legend)
  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    // Setup SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    // Add contour lines if enabled
    if (showContours) {
      try {
        // Generate fewer contour lines for better performance and cleaner look
        const contourGenerator = d3
          .contours()
          .size([resolution, resolution])
          .thresholds(d3.range(-0.6, 0.6, 0.3)) // Even fewer contour lines

        const contourData = contourGenerator(elevationGrid)

        // Add contour paths with simplified styling
        svg
          .selectAll(".contour")
          .data(contourData)
          .enter()
          .append("path")
          .attr("class", "contour")
          .attr("d", d3.geoPath())
          .attr("transform", `scale(${width / resolution}, ${height / resolution})`)
          .attr("fill", "none")
          .attr("stroke", "rgba(255, 255, 255, 0.2)")
          .attr("stroke-width", 0.5)
          .attr("stroke-linejoin", "round")
      } catch (error) {
        console.error("Error generating contours:", error)
      }
    }

    // Add labels for major features if enabled - simplified for minimal look
    if (showLabels) {
      // Find local maxima and minima for feature labeling - fewer points
      const features: { x: number; y: number; elevation: number; type: string }[] = []

      // Use a more efficient approach - check only key points
      const step = Math.floor(resolution / 5) // Check even fewer points

      for (let y = step; y < resolution - step; y += step) {
        for (let x = step; x < resolution - step; x += step) {
          const index = y * resolution + x
          const current = terrainData[index]

          // Only label very prominent features
          if (current.elevation > 0.7) {
            features.push({
              x: (current.x * width) / resolution,
              y: (current.y * height) / resolution,
              elevation: current.elevation,
              type: "Peak",
            })
          } else if (current.elevation < -0.5) {
            features.push({
              x: (current.x * width) / resolution,
              y: (current.y * height) / resolution,
              elevation: current.elevation,
              type: "Deep",
            })
          }
        }
      }

      // Limit to only a few key labels
      const maxLabels = 3 // Even fewer labels
      if (features.length > maxLabels) {
        features.sort((a, b) => Math.abs(b.elevation) - Math.abs(a.elevation))
        features.length = maxLabels
      }

      // Add minimal feature labels
      svg
        .selectAll(".feature-label")
        .data(features)
        .enter()
        .append("text")
        .attr("class", "feature-label")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("text-anchor", "middle")
        .attr("fill", (d) => (d.elevation > 0 ? "#000" : "#fff"))
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .text((d) => d.type)
    }

    // Add landmarks if available
    // if (stats.landmarks && stats.landmarks.length > 0) {
    //   // Create landmark markers
    //   svg
    //     .selectAll(".landmark-marker")
    //     .data(stats.landmarks)
    //     .enter()
    //     .append("g")
    //     .attr("class", "landmark-marker")
    //     .attr("transform", (d) => `translate(${d.position.x * width}, ${d.position.y * height})`)
    //     .each(function (d) {
    //       const group = d3.select(this)

    //       // Add circle background
    //       group
    //         .append("circle")
    //         .attr("r", 8)
    //         .attr("fill", d.color || LANDMARK_COLORS[d.type])
    //         .attr("stroke", "white")
    //         .attr("stroke-width", d.id === selectedLandmark?.id ? 2 : 0)
    //         .attr("opacity", 0.8)

    //       // Add icon text
    //       group
    //         .append("text")
    //         .attr("text-anchor", "middle")
    //         .attr("dy", "0.3em")
    //         .attr("fill", "white")
    //         .attr("font-size", "10px")
    //         .attr("pointer-events", "none")
    //         .text(LANDMARK_ICONS[d.type])

    //       // Add name label for selected landmark
    //       if (d.id === selectedLandmark?.id) {
    //         group
    //           .append("text")
    //           .attr("text-anchor", "middle")
    //           .attr("dy", "-1.2em")
    //           .attr("fill", "white")
    //           .attr("font-size", "12px")
    //           .attr("font-weight", "bold")
    //           .attr("stroke", "black")
    //           .attr("stroke-width", "0.5px")
    //           .attr("pointer-events", "none")
    //           .text(d.name)
    //       }
    //     })
    // }

    // Add simplified color scale legend if enabled
    if (showColorScale) {
      const legendWidth = 15
      const legendHeight = height * 0.5
      const legendX = width - legendWidth - 15
      const legendY = (height - legendHeight) / 2

      // Create gradient for legend
      const defs = svg.append("defs")

      const gradient = defs
        .append("linearGradient")
        .attr("id", "elevation-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%")

      // Add color stops - simplified
      gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(elevationRange[1]))

      gradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(0))

      gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(elevationRange[0]))

      // Add legend rectangle
      svg
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "url(#elevation-gradient)")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.8)

      // Add minimal tick marks - only 3 for cleaner look
      const tickPositions = [0, 0.5, 1]
      tickPositions.forEach((pos) => {
        const y = legendY + pos * legendHeight

        // Tick mark
        svg
          .append("line")
          .attr("x1", legendX)
          .attr("x2", legendX - 4)
          .attr("y1", y)
          .attr("y2", y)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)

        // Label
        const elevationValue = elevationRange[1] - pos * (elevationRange[1] - elevationRange[0])
        svg
          .append("text")
          .attr("x", legendX - 6)
          .attr("y", y + 3)
          .attr("text-anchor", "end")
          .attr("font-size", "8px")
          .attr("fill", "#fff")
          .text(elevationValue.toFixed(1))
      })

      // Simple legend title
      svg
        .append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", legendY - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#fff")
        .text("Elevation")
    }

    // Add simplified region legend - just a few key regions for cleaner interface
    const regionLegendX = 10
    const regionLegendY = 10
    const regionLegendWidth = 12
    const regionLegendHeight = 12
    const regionLegendSpacing = 4

    // Only show a few key regions
    const regionsToShow = 5
    const step = Math.floor(regionColors.length / regionsToShow)

    for (let i = 0; i < regionColors.length; i += step) {
      if (i >= regionsToShow * step) break // Limit to exactly regionsToShow

      const y = regionLegendY + (i / step) * (regionLegendHeight + regionLegendSpacing)

      // Color box
      svg
        .append("rect")
        .attr("x", regionLegendX)
        .attr("y", y)
        .attr("width", regionLegendWidth)
        .attr("height", regionLegendHeight)
        .attr("fill", regionColors[i])
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.9)

      // Simplified label
      svg
        .append("text")
        .attr("x", regionLegendX + regionLegendWidth + 5)
        .attr("y", y + regionLegendHeight / 2 + 3)
        .attr("font-size", "8px")
        .attr("fill", "#fff")
        .text(`Region ${i + 1}`)
    }

    // Add click interaction to show point details
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("click", (event) => {
        const [x, y] = d3.pointer(event)

        // Convert to grid coordinates
        const gridX = Math.floor(x / (width / resolution))
        const gridY = Math.floor(y / (height / resolution))

        // Ensure within bounds
        if (gridX >= 0 && gridX < resolution && gridY >= 0 && gridX < resolution) {
          const index = gridY * resolution + gridX
          const point = terrainData[index]

          if (point) {
            setSelectedPoint(point)

            // Show a marker at the clicked position
            svg.selectAll(".click-marker").remove()
            svg
              .append("circle")
              .attr("class", "click-marker")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", 5)
              .attr("fill", "none")
              .attr("stroke", "#fff")
              .attr("stroke-width", 1.5)
              .attr("stroke-dasharray", "2,2")
          }
        }
      })
  }, [
    terrainData,
    colorScale,
    regionColors,
    elevationGrid,
    elevationRange,
    width,
    height,
    resolution,
    showLabels,
    showContours,
    showColorScale,
    // stats.landmarks,
    selectedLandmark,
  ])

  // Handle mouse interactions for tooltips
  useEffect(() => {
    if (!canvasRef.current || !tooltipRef.current) return

    const canvas = canvasRef.current
    const tooltip = tooltipRef.current

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Convert to grid coordinates
      const gridX = Math.floor(x / (width / resolution))
      const gridY = Math.floor(y / (height / resolution))

      // Ensure within bounds
      if (gridX >= 0 && gridX < resolution && gridY >= 0 && gridX < resolution) {
        const index = gridY * resolution + gridX
        const cell = terrainData[index]

        if (cell) {
          setHoveredCell(cell)

          tooltip.style.opacity = "1"
          tooltip.style.left = `${x + 10}px`
          tooltip.style.top = `${y + 10}px`
        }
      }
    }

    const handleMouseOut = () => {
      setHoveredCell(null)
      tooltip.style.opacity = "0"
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseout", handleMouseOut)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseout", handleMouseOut)
    }
  }, [terrainData, width, height, resolution])

  // Add effect to handle focusing on a specific point
  useEffect(() => {
    if (!svgRef.current || !focusPoint) return

    const svg = d3.select(svgRef.current)

    // Remove previous focus indicators
    svg.selectAll(".focus-indicator").remove()

    // Calculate position in the map space
    const x = (focusPoint.x / resolution) * width
    const y = (focusPoint.y / resolution) * height

    // Add focus circle
    svg
      .append("circle")
      .attr("class", "focus-indicator")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 10)
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.8)

    // Add pulsing animation
    svg
      .append("circle")
      .attr("class", "focus-indicator")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", "#5FCBC3")
      .attr("opacity", 0.8)
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", "5;15;5")
      .attr("dur", "2s")
      .attr("repeatCount", "indefinite")

    // Automatically show details for the focused point
    const pointData = terrainData.find((p) => Math.abs(p.x - focusPoint.x) < 2 && Math.abs(p.y - focusPoint.y) < 2)

    if (pointData) {
      setSelectedPoint(pointData)
    }
  }, [focusPoint, width, height, resolution, terrainData])

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-full bg-black" style={{ width, height }} />
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto" style={{ width, height }} />

      {/* Hover tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-black/80 text-white p-2 rounded text-sm opacity-0 transition-opacity"
        style={{ left: 0, top: 0 }}
      >
        {/* Update the hover tooltip to show precipitation compound */}
        {hoveredCell && (
          <>
            <div>
              <strong>Elevation:</strong> {hoveredCell.elevation.toFixed(2)}
            </div>
            <div>
              <strong>Region:</strong> {hoveredCell.region + 1}
            </div>
            <div>
              <strong>Temperature:</strong> {hoveredCell.temp.toFixed(1)}K
            </div>
            {hoveredCell.precipitationCompound && hoveredCell.precipitationCompound !== "none" && (
              <div>
                <strong>Precipitation:</strong> {hoveredCell.precipitationCompound}
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected point info panel - updated for better appearance */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-[#5FCBC3]">Surface Point Details</h3>
            <button className="text-gray-400 hover:text-white" onClick={() => setSelectedPoint(null)}>
              <X size={18} />
            </button>
          </div>

          {/* Update the selected point info panel to show precipitation compound */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="text-gray-300">Elevation:</div>
            <div>{selectedPoint.elevation.toFixed(3)}</div>

            <div className="text-gray-300">Temperature:</div>
            <div>{selectedPoint.temp.toFixed(1)}K</div>

            <div className="text-gray-300">Region:</div>
            <div>{selectedPoint.region + 1}</div>

            <div className="text-gray-300">Distance:</div>
            <div>{selectedPoint.distance.toFixed(3)}</div>

            <div className="text-gray-300">Biome:</div>
            <div>{selectedPoint.biome}</div>

            {selectedPoint.precipitationCompound && selectedPoint.precipitationCompound !== "none" && (
              <>
                <div className="text-gray-300">Precipitation:</div>
                <div>{selectedPoint.precipitationCompound}</div>
              </>
            )}

            <div className="text-gray-300">Coordinates:</div>
            <div>
              ({selectedPoint.x}, {selectedPoint.y})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};