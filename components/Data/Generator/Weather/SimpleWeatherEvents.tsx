"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface BiomeRanges {
    temperature: [number, number]
    atmosphereStrength: [number, number]
    cloudCount: [number, number]
    waterHeight: [number, number]
    surfaceRoughness: [number, number]
    plateTectonics: [number, number]
    biomassLevel: [number, number]
    waterLevel: [number, number]
    salinity: [number, number]
    volcanicActivity: [number, number]
    surfaceDeposits: string[]
  }
  
  export interface BiomeData {
    [key: string]: BiomeRanges
  }
  
  export const biomeData: BiomeData = {
    "Rocky Highlands": {
      temperature: [240, 320],
      atmosphereStrength: [0.3, 0.7],
      cloudCount: [10, 60],
      waterHeight: [0.0, 0.2],
      surfaceRoughness: [0.5, 1.0],
      plateTectonics: [0.4, 0.9],
      biomassLevel: [0.01, 0.2],
      waterLevel: [0.1, 0.3],
      salinity: [0.1, 0.5],
      volcanicActivity: [0.2, 0.8],
      surfaceDeposits: ["Bedrock", "Big Rocks", "Surface Cracks"],
    },
    "Barren Wasteland": {
      temperature: [180, 260],
      atmosphereStrength: [0.1, 0.5],
      cloudCount: [0, 10],
      waterHeight: [0.0, 0.05],
      surfaceRoughness: [0.2, 0.8],
      plateTectonics: [0.1, 0.5],
      biomassLevel: [0.0, 0.05],
      waterLevel: [0.0, 0.1],
      salinity: [0.0, 0.3],
      volcanicActivity: [0.0, 0.3],
      surfaceDeposits: ["Dust Deposits", "Surface Cracks"],
    },
    "Arid Dunes": {
      temperature: [250, 330],
      atmosphereStrength: [0.2, 0.6],
      cloudCount: [5, 40],
      waterHeight: [0.0, 0.2],
      surfaceRoughness: [0.3, 0.9],
      plateTectonics: [0.1, 0.4],
      biomassLevel: [0.0, 0.1],
      waterLevel: [0.0, 0.2],
      salinity: [0.0, 0.4],
      volcanicActivity: [0.1, 0.6],
      surfaceDeposits: ["Sand", "Unconsolidated Soil"],
    },
    "Frigid Expanse": {
      temperature: [120, 240],
      atmosphereStrength: [0.4, 0.9],
      cloudCount: [20, 100],
      waterHeight: [0.1, 0.5],
      surfaceRoughness: [0.2, 0.6],
      plateTectonics: [0.1, 0.3],
      biomassLevel: [0.0, 0.3],
      waterLevel: [0.2, 0.8],
      salinity: [0.2, 0.8],
      volcanicActivity: [0.0, 0.2],
      surfaceDeposits: ["Ice Sheets", "Frozen Lakes"],
    },
    "Volcanic Terrain": {
      temperature: [300, 1200],
      atmosphereStrength: [0.5, 1.2],
      cloudCount: [15, 70],
      waterHeight: [0.0, 0.1],
      surfaceRoughness: [0.7, 1.2],
      plateTectonics: [0.5, 1.0],
      biomassLevel: [0.02, 0.1],
      waterLevel: [0.0, 0.2],
      salinity: [0.0, 0.2],
      volcanicActivity: [0.5, 1.2],
      surfaceDeposits: ["Volcanic Ash", "Lava Fields"],
    },
    "Basalt Plains": {
      temperature: [220, 350],
      atmosphereStrength: [0.3, 0.8],
      cloudCount: [10, 50],
      waterHeight: [0.0, 0.3],
      surfaceRoughness: [0.3, 0.7],
      plateTectonics: [0.3, 0.7],
      biomassLevel: [0.0, 0.15],
      waterLevel: [0.0, 0.3],
      salinity: [0.1, 0.4],
      volcanicActivity: [0.2, 0.6],
      surfaceDeposits: ["Basaltic Rock", "Mineral Deposits"],
    },
    "Sediment Flats": {
      temperature: [260, 310],
      atmosphereStrength: [0.4, 0.7],
      cloudCount: [20, 60],
      waterHeight: [0.1, 0.4],
      surfaceRoughness: [0.1, 0.4],
      plateTectonics: [0.1, 0.4],
      biomassLevel: [0.05, 0.3],
      waterLevel: [0.2, 0.5],
      salinity: [0.2, 0.6],
      volcanicActivity: [0.0, 0.3],
      surfaceDeposits: ["Clay", "Fine Sand", "Sulfate-Rich Soil"],
    },
    "Cratered Terrain": {
      temperature: [200, 300],
      atmosphereStrength: [0.1, 0.6],
      cloudCount: [5, 40],
      waterHeight: [0.0, 0.2],
      surfaceRoughness: [0.4, 0.9],
      plateTectonics: [0.0, 0.3],
      biomassLevel: [0.0, 0.1],
      waterLevel: [0.0, 0.2],
      salinity: [0.0, 0.3],
      volcanicActivity: [0.0, 0.4],
      surfaceDeposits: ["Regolith", "Dust Deposits"],
    },
    "Tundra Basin": {
      temperature: [180, 270],
      atmosphereStrength: [0.4, 0.8],
      cloudCount: [30, 80],
      waterHeight: [0.2, 0.5],
      surfaceRoughness: [0.2, 0.5],
      plateTectonics: [0.1, 0.4],
      biomassLevel: [0.1, 0.4],
      waterLevel: [0.3, 0.6],
      salinity: [0.1, 0.4],
      volcanicActivity: [0.0, 0.2],
      surfaceDeposits: ["Permafrost", "Pebbles", "Rocky Terrain"],
    },
    "Temperate Highlands": {
      temperature: [270, 310],
      atmosphereStrength: [0.5, 0.9],
      cloudCount: [40, 90],
      waterHeight: [0.3, 0.6],
      surfaceRoughness: [0.4, 0.8],
      plateTectonics: [0.3, 0.7],
      biomassLevel: [0.3, 0.8],
      waterLevel: [0.3, 0.7],
      salinity: [0.2, 0.5],
      volcanicActivity: [0.1, 0.4],
      surfaceDeposits: ["Mineral-Rich Soil", "Loam"],
    },
    "Oceanic World": {
      temperature: [260, 320],
      atmosphereStrength: [0.6, 1.0],
      cloudCount: [60, 100],
      waterHeight: [0.9, 1.0], // Increased minimum water height
      surfaceRoughness: [0.1, 0.3], // Reduced surface roughness
      plateTectonics: [0.2, 0.6],
      biomassLevel: [0.4, 0.9],
      waterLevel: [0.9, 1.0], // Increased minimum water level
      salinity: [0.5, 0.9],
      volcanicActivity: [0.1, 0.5],
      surfaceDeposits: ["Deep Water", "Sedimentary Layers"],
    },
    "Tropical Jungle": {
      temperature: [290, 330],
      atmosphereStrength: [0.7, 1.0],
      cloudCount: [70, 100],
      waterHeight: [0.4, 0.7],
      surfaceRoughness: [0.3, 0.7],
      plateTectonics: [0.2, 0.5],
      biomassLevel: [0.7, 1.0],
      waterLevel: [0.5, 0.8],
      salinity: [0.2, 0.4],
      volcanicActivity: [0.1, 0.3],
      surfaceDeposits: ["Dense Vegetation", "Wet Soil"],
    },
    "Flood Basin": {
      temperature: [270, 320],
      atmosphereStrength: [0.5, 0.9],
      cloudCount: [50, 90],
      waterHeight: [0.5, 0.8],
      surfaceRoughness: [0.1, 0.3],
      plateTectonics: [0.1, 0.3],
      biomassLevel: [0.3, 0.7],
      waterLevel: [0.6, 0.9],
      salinity: [0.3, 0.6],
      volcanicActivity: [0.0, 0.2],
      surfaceDeposits: ["Silt", "Muddy Terrain"],
    },
    "Coral Reefs": {
      temperature: [280, 310],
      atmosphereStrength: [0.6, 0.9],
      cloudCount: [40, 80],
      waterHeight: [0.6, 0.9],
      surfaceRoughness: [0.2, 0.5],
      plateTectonics: [0.1, 0.4],
      biomassLevel: [0.6, 0.9],
      waterLevel: [0.7, 0.9],
      salinity: [0.6, 0.9],
      volcanicActivity: [0.0, 0.2],
      surfaceDeposits: ["Limestone", "Organic Deposits"],
    },
    "Dune Fields": {
      temperature: [270, 350],
      atmosphereStrength: [0.2, 0.6],
      cloudCount: [10, 50],
      waterHeight: [0.0, 0.1],
      surfaceRoughness: [0.3, 0.7],
      plateTectonics: [0.0, 0.3],
      biomassLevel: [0.0, 0.1],
      waterLevel: [0.0, 0.1],
      salinity: [0.0, 0.3],
      volcanicActivity: [0.0, 0.3],
      surfaceDeposits: ["Fine Sand", "Wind-Driven Erosion"],
    },
  }
  
  export function getSurfaceDeposits(biome: string): string[] {
    return biomeData[biome]?.surfaceDeposits || ["Unknown"]
  }
  
  export function getParameterRange(biome: string, parameter: keyof BiomeRanges): [number, number] {
    if (!biomeData[biome] || !biomeData[biome][parameter]) {
      // Default ranges if biome or parameter not found
      const defaultRanges: { [key: string]: [number, number] } = {
        temperature: [50, 400],
        atmosphereStrength: [0, 1],
        cloudCount: [0, 100],
        waterHeight: [0, 1],
        surfaceRoughness: [0, 2],
        plateTectonics: [0, 1],
        biomassLevel: [0, 1],
        waterLevel: [0, 1],
        salinity: [0, 1],
        volcanicActivity: [0, 1],
      }
  
      return defaultRanges[parameter as string] || [0, 1]
    }
  
    return biomeData[biome][parameter] as [number, number]
  }
  
  // Function to clamp a value within a range
  export function clampToRange(value: number, range: [number, number]): number {
    return Math.min(Math.max(value, range[0]), range[1])
  }
  
  // Function to adjust all parameters to fit within biome ranges
  export function adjustParametersForBiome(biome: string, currentParams: any): any {
    const adjustedParams = { ...currentParams }
  
    // List of parameters to adjust
    const parametersToAdjust: (keyof BiomeRanges)[] = [
      "temperature",
      "atmosphereStrength",
      "cloudCount",
      "waterHeight",
      "surfaceRoughness",
      "plateTectonics",
      "biomassLevel",
      "waterLevel",
      "salinity",
      "volcanicActivity",
    ]
  
    // Adjust each parameter to fit within the biome's range
    parametersToAdjust.forEach((param) => {
      if (adjustedParams[param] !== undefined) {
        const range = getParameterRange(biome, param)
        adjustedParams[param] = clampToRange(adjustedParams[param], range)
      }
    })
  
    return adjustedParams
}


interface WeatherSettings {
  rain: boolean
  snow: boolean
  hail: boolean
  clouds: boolean
  sun: boolean
  lightning: boolean
}

interface WeatherGeneratorProps {
  biome?: string
}

const defaultSettings: WeatherSettings = {
  rain: false,
  snow: false,
  hail: false,
  clouds: true,
  sun: true,
  lightning: false,
}

// Convert kebab-case to Title Case
function formatBiomeName(name: string): string {
  if (!name) return ""
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Convert Title Case to kebab-case
function kebabCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

// Function to determine weather settings based on biome data
function getWeatherSettingsForBiome(biomeName: string): WeatherSettings {
  // Convert from kebab-case to Title Case if needed
  const formattedName = formatBiomeName(biomeName)
  const biome = biomeData[formattedName]
  if (!biome) return defaultSettings

  // Get average values for each parameter
  const avgTemp = (biome.temperature[0] + biome.temperature[1]) / 2
  const avgCloudCount = (biome.cloudCount[0] + biome.cloudCount[1]) / 2
  const avgWaterLevel = (biome.waterLevel[0] + biome.waterLevel[1]) / 2
  const avgVolcanicActivity = (biome.volcanicActivity[0] + biome.volcanicActivity[1]) / 2
  const avgSurfaceRoughness = (biome.surfaceRoughness[0] + biome.surfaceRoughness[1]) / 2

  // Determine weather settings based on biome parameters
  return {
    // Enable clouds if cloud count is above 30%
    clouds: avgCloudCount > 30,

    // Enable sun if temperature is above 260K (not too cold)
    sun: avgTemp > 260,

    // Enable rain if water level is above 0.3 (30%)
    rain: avgWaterLevel > 0.3,

    // Enable snow if temperature is below 240K (cold)
    snow: avgTemp < 240,

    // Enable lightning if volcanic activity is above 0.4 (40%)
    lightning: avgVolcanicActivity > 0.4,

    // Enable hail if surface roughness is above 0.6 (60%) - representing turbulent conditions
    hail: avgSurfaceRoughness > 0.6,
  }
}

// Calculate weather intensity based on biome data
function getWeatherIntensity(biomeName: string) {
  const formattedName = formatBiomeName(biomeName)
  if (!biomeData[formattedName]) {
    return {
      rainIntensity: 0.5,
      snowIntensity: 0.5,
      hailIntensity: 0.5,
      cloudIntensity: 0.5,
      lightningIntensity: 0.5,
    }
  }

  const data = biomeData[formattedName]

  // Map biome parameters to weather intensities (0-1 scale)
  return {
    rainIntensity: data.waterLevel[1] * data.atmosphereStrength[1],
    snowIntensity: (400 - data.temperature[0]) / 300, // Higher for colder temperatures
    hailIntensity: data.atmosphereStrength[1] * data.plateTectonics[1],
    cloudIntensity: data.cloudCount[1] / 100,
    lightningIntensity: data.volcanicActivity[1] * data.atmosphereStrength[1],
  }
}

export default function WeatherGenerator({ biome = "" }: WeatherGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(defaultSettings)
  const [showControls, setShowControls] = useState(false)
  const [selectedBiome, setSelectedBiome] = useState<string>(formatBiomeName(biome))

  // Update settings when biome prop changes
  useEffect(() => {
    if (biome) {
      const formattedBiome = formatBiomeName(biome)
      setSelectedBiome(formattedBiome)
      setWeatherSettings(getWeatherSettingsForBiome(biome))
    }
  }, [biome])

  const updateSetting = (key: keyof WeatherSettings, value: boolean) => {
    setWeatherSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleBiomeChange = (biomeName: string) => {
    setSelectedBiome(biomeName)
    setWeatherSettings(getWeatherSettingsForBiome(kebabCase(biomeName)))
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = window.innerWidth
    const height = window.innerHeight

    // Get weather intensity for the selected biome
    const intensity = getWeatherIntensity(selectedBiome)

    // Define alien world color palette
    const colors = {
      sky: "#1a0b2e",
      clouds: ["#7b2cbf", "#9d4edd", "#c77dff"],
      sun: "#ff9e00",
      sunRays: "#ff5400",
      rain: "#00e5ff",
      snow: "#a0ffe6",
      hail: "#4cc9f0",
      lightning: "#f72585",
    }

    // Add a subtle gradient background
    const defs = svg.append("defs")

    const gradient = defs
      .append("linearGradient")
      .attr("id", "alien-sky-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")

    gradient.append("stop").attr("offset", "0%").attr("stop-color", colors.sky).attr("stop-opacity", 0.7)

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3a0ca3").attr("stop-opacity", 0.3)

    // Add filter for glow effects
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")

    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur")

    const feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Clear any existing elements
    svg.selectAll("*:not(defs)").remove()

    // Add subtle background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#alien-sky-gradient)")
      .attr("opacity", 0.3)

    // Create alien clouds
    if (weatherSettings.clouds) {
      const cloudGroup = svg.append("g")

      const createCloud = (x: number, y: number, scale: number) => {
        const cloudColor = colors.clouds[Math.floor(Math.random() * colors.clouds.length)]

        const cloud = cloudGroup
          .append("g")
          .attr("transform", `translate(${x}, ${y}) scale(${scale})`)
          .style("filter", "url(#glow)")

        // Create more alien-looking cloud shapes
        for (let i = 0; i < 5; i++) {
          const cx = 20 + i * 15 + Math.random() * 10
          const cy = 25 + Math.random() * 10
          const r = 10 + Math.random() * 20

          cloud
            .append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", r)
            .attr("fill", cloudColor)
            .attr("opacity", 0.7 + Math.random() * 0.3)
        }

        // Add tendrils/wisps to make clouds look more alien
        for (let i = 0; i < 3; i++) {
          const startX = 30 + Math.random() * 40
          const startY = 40 + Math.random() * 10
          const controlX = startX + 20 - Math.random() * 40
          const controlY = startY + 20 + Math.random() * 10
          const endX = startX + 30 - Math.random() * 60
          const endY = startY + 30 + Math.random() * 10

          cloud
            .append("path")
            .attr("d", `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`)
            .attr("stroke", cloudColor)
            .attr("stroke-width", 2 + Math.random() * 3)
            .attr("fill", "none")
            .attr("opacity", 0.6)
        }

        // Animate cloud with slight pulsing
        cloud
          .transition()
          .duration(30000)
          .ease(d3.easeLinear)
          .attr("transform", `translate(${x + 300}, ${y}) scale(${scale})`)
          .on("end", function () {
            d3.select(this).remove()
            createCloud(0, y, scale)
          })

        // Add subtle pulsing effect
        function pulseCloud() {
          cloud
            .transition()
            .duration(2000)
            .ease(d3.easeSinInOut)
            .attr("opacity", 0.7)
            .transition()
            .duration(2000)
            .ease(d3.easeSinInOut)
            .attr("opacity", 1)
            .on("end", pulseCloud)
        }

        pulseCloud()
      }

      // Create alien clouds at different positions - number based on intensity
      const cloudCount = Math.floor(3 + intensity.cloudIntensity * 5)
      for (let i = 0; i < cloudCount; i++) {
        createCloud(Math.random() * width, 50 + Math.random() * 150, 0.6 + Math.random() * 0.5)
      }
    }

    // Create alien sun
    if (weatherSettings.sun) {
      const sunGroup = svg
        .append("g")
        .attr("transform", `translate(${width - 120}, 80)`)
        .style("filter", "url(#glow)")

      // Create binary star system (two suns)
      sunGroup.append("circle").attr("r", 25).attr("fill", colors.sun).attr("opacity", 0.9)

      sunGroup
        .append("circle")
        .attr("cx", 15)
        .attr("cy", -15)
        .attr("r", 15)
        .attr("fill", colors.sunRays)
        .attr("opacity", 0.8)

      // Create corona/atmosphere around the suns
      sunGroup
        .append("circle")
        .attr("r", 35)
        .attr("fill", "none")
        .attr("stroke", colors.sunRays)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.6)

      // Create unusual sun rays - more like energy tendrils
      const rayData: number[] = [0, 60, 120, 180, 240, 300]

      sunGroup
        .selectAll<SVGPathElement, number>(".ray")
        .data(rayData)
        .enter()
        .append("path")
        .attr("class", "ray")
        .attr("d", (d: number) => {
          const x1 = 0
          const y1 = 0
          const length = 45 + Math.random() * 15
          const x2 = Math.cos((d * Math.PI) / 180) * length
          const y2 = Math.sin((d * Math.PI) / 180) * length
          const cpx = Math.cos(((d + 10) * Math.PI) / 180) * (length * 0.6)
          const cpy = Math.sin(((d + 10) * Math.PI) / 180) * (length * 0.6)
          return `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`
        })
        .attr("stroke", colors.sunRays)
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0.7)

      // Animate sun rays
      function animateSunRays() {
        sunGroup
          .selectAll<SVGPathElement, number>(".ray")
          .transition()
          .duration(3000)
          .attr("d", (d: number) => {
            const x1 = 0
            const y1 = 0
            const length = 45 + Math.random() * 25
            const x2 = Math.cos((d * Math.PI) / 180) * length
            const y2 = Math.sin((d * Math.PI) / 180) * length
            const cpx = Math.cos(((d + 20 * Math.random()) * Math.PI) / 180) * (length * 0.6)
            const cpy = Math.sin(((d + 20 * Math.random()) * Math.PI) / 180) * (length * 0.6)
            return `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`
          })
          .transition()
          .duration(3000)
          .attr("d", (d: number) => {
            const x1 = 0
            const y1 = 0
            const length = 45 + Math.random() * 15
            const x2 = Math.cos((d * Math.PI) / 180) * length
            const y2 = Math.sin((d * Math.PI) / 180) * length
            const cpx = Math.cos(((d - 20 * Math.random()) * Math.PI) / 180) * (length * 0.6)
            const cpy = Math.sin(((d - 20 * Math.random()) * Math.PI) / 180) * (length * 0.6)
            return `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`
          })
          .on("end", animateSunRays)
      }

      animateSunRays()
    }

    // Create alien rain - glowing droplets
    if (weatherSettings.rain) {
      const rainGroup = svg.append("g")

      // Number of raindrops based on intensity
      const rainCount = Math.floor(10 + intensity.rainIntensity * 30)

      for (let i = 0; i < rainCount; i++) {
        const x = Math.random() * width
        const y = -20 - Math.random() * 100
        const speed = 1.5 + Math.random() * 1.5
        const length = 5 + Math.random() * 10

        // Create glowing droplet
        const raindrop = rainGroup.append("g").style("filter", "url(#glow)")

        raindrop
          .append("line")
          .attr("x1", x)
          .attr("y1", y)
          .attr("x2", x)
          .attr("y2", y + length)
          .attr("stroke", colors.rain)
          .attr("stroke-width", 2)
          .attr("opacity", 0.8)

        function animateRaindrop() {
          raindrop
            .transition()
            .duration(2000 / speed)
            .ease(d3.easeLinear)
            .attr("transform", `translate(0, ${height + 20})`)
            .on("end", function () {
              d3.select(this).attr("transform", "translate(0, 0)").call(animateRaindrop)
            })
        }

        animateRaindrop()
      }
    }

    // Create enhanced alien lightning
    let clearLightning: () => void = () => {}
    if (weatherSettings.lightning) {
      const createLightning = () => {
        // Lightning frequency based on intensity (higher = more frequent)
        const interval = Math.max(2000, 8000 - intensity.lightningIntensity * 6000)

        const lightningInterval = setInterval(() => {
          const x = Math.random() * width * 0.8 + width * 0.1
          const y = 150

          // Create main lightning bolt
          const generateLightningPath = (
            startX: number,
            startY: number,
            angle: number,
            length: number,
            depth: number,
          ): string => {
            if (depth <= 0 || length < 10) return ""

            const endX = startX + Math.cos(angle) * length
            const endY = startY + Math.sin(angle) * length

            // Add some randomness to the path
            const midX1 = startX + (endX - startX) * 0.33 + (Math.random() * 20 - 10)
            const midY1 = startY + (endY - startY) * 0.33 + (Math.random() * 20 - 10)
            const midX2 = startX + (endX - startX) * 0.66 + (Math.random() * 20 - 10)
            const midY2 = startY + (endY - startY) * 0.66 + (Math.random() * 20 - 10)

            let path = `M${startX},${startY} C${midX1},${midY1} ${midX2},${midY2} ${endX},${endY}`

            // Add branches with some probability
            if (depth > 1 && Math.random() > 0.6) {
              const branchAngle = angle + (Math.random() * 1 - 0.5)
              const branchLength = length * (0.3 + Math.random() * 0.4)
              path += " " + generateLightningPath(midX1, midY1, branchAngle, branchLength, depth - 1)
            }

            if (depth > 1 && Math.random() > 0.6) {
              const branchAngle = angle + (Math.random() * 1 - 0.5)
              const branchLength = length * (0.3 + Math.random() * 0.4)
              path += " " + generateLightningPath(midX2, midY2, branchAngle, branchLength, depth - 1)
            }

            return path
          }

          // Create lightning bolt with branches - complexity based on intensity
          const branchDepth = Math.floor(2 + intensity.lightningIntensity * 3)
          const lightningPath = generateLightningPath(x, y, Math.PI / 2, 200, branchDepth)

          // Create glow effect for lightning
          const lightning = svg.append("g").style("filter", "url(#glow)")

          // Add background glow
          lightning
            .append("path")
            .attr("d", lightningPath)
            .attr("stroke", colors.lightning)
            .attr("stroke-width", 8)
            .attr("stroke-opacity", 0.3)
            .attr("fill", "none")

          // Add main lightning bolt
          lightning
            .append("path")
            .attr("d", lightningPath)
            .attr("stroke", colors.lightning)
            .attr("stroke-width", 3)
            .attr("fill", "none")

          // Add bright core
          lightning
            .append("path")
            .attr("d", lightningPath)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("opacity", 0.8)

          // Animate lightning flash
          lightning
            .transition()
            .duration(100)
            .attr("opacity", 0.9)
            .transition()
            .duration(50)
            .attr("opacity", 0.3)
            .transition()
            .duration(50)
            .attr("opacity", 1)
            .transition()
            .duration(100)
            .attr("opacity", 0)
            .remove()
        }, interval)

        return () => clearInterval(lightningInterval)
      }

      clearLightning = createLightning()
    }

    // Create alien snow - glowing spores/particles
    if (weatherSettings.snow) {
      const snowGroup = svg.append("g")

      // Number of snowflakes based on intensity
      const snowCount = Math.floor(5 + intensity.snowIntensity * 25)

      for (let i = 0; i < snowCount; i++) {
        const x = Math.random() * width
        const y = -20 - Math.random() * 100
        const size = 2 + Math.random() * 3
        const speed = 0.5 + Math.random() * 0.5

        // Create alien spore/particle
        const snowflake = snowGroup.append("g").attr("transform", `translate(${x}, ${y})`).style("filter", "url(#glow)")

        // Randomly choose between different alien particle shapes
        const shapeType = Math.floor(Math.random() * 3)

        if (shapeType === 0) {
          // Glowing circle
          snowflake.append("circle").attr("r", size).attr("fill", colors.snow).attr("opacity", 0.7)
        } else if (shapeType === 1) {
          // Star shape
          const points = 5
          const outerRadius = size
          const innerRadius = size / 2

          let pathData = ""
          for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI / points) * i
            const px = Math.sin(angle) * radius
            const py = -Math.cos(angle) * radius
            pathData += (i === 0 ? "M" : "L") + px + "," + py
          }
          pathData += "Z"

          snowflake.append("path").attr("d", pathData).attr("fill", colors.snow).attr("opacity", 0.7)
        } else {
          // Hexagon
          const hexPoints = []
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i
            hexPoints.push([Math.sin(angle) * size, -Math.cos(angle) * size])
          }

          snowflake
            .append("polygon")
            .attr("points", hexPoints.map((p) => p.join(",")).join(" "))
            .attr("fill", colors.snow)
            .attr("opacity", 0.7)
        }

        // Add subtle rotation during animation
        function animateSnowflake() {
          snowflake
            .transition()
            .duration(6000 / speed)
            .ease(d3.easeLinear)
            .attr(
              "transform",
              `translate(${x + (Math.random() * 100 - 50)}, ${height + 20}) rotate(${Math.random() * 360})`,
            )
            .on("end", function () {
              d3.select(this).attr("transform", `translate(${x}, ${y})`).call(animateSnowflake)
            })
        }

        animateSnowflake()
      }
    }

    // Create alien hail - crystalline structures
    if (weatherSettings.hail) {
      const hailGroup = svg.append("g")

      // Number of hail pieces based on intensity
      const hailCount = Math.floor(5 + intensity.hailIntensity * 15)

      for (let i = 0; i < hailCount; i++) {
        const x = Math.random() * width
        const y = -20 - Math.random() * 100
        const size = 4 + Math.random() * 3
        const speed = 2 + Math.random() * 1

        // Create crystalline hail
        const hail = hailGroup.append("g").attr("transform", `translate(${x}, ${y})`).style("filter", "url(#glow)")

        // Create diamond/crystal shape
        const points = [
          [0, -size],
          [size, 0],
          [0, size],
          [-size, 0],
        ]

        hail
          .append("polygon")
          .attr("points", points.map((p) => p.join(",")).join(" "))
          .attr("fill", colors.hail)
          .attr("opacity", 0.8)

        // Add inner glow
        hail
          .append("polygon")
          .attr("points", points.map((p) => [p[0] * 0.5, p[1] * 0.5].join(",")).join(" "))
          .attr("fill", "#ffffff")
          .attr("opacity", 0.5)

        function animateHail() {
          hail
            .transition()
            .duration(1500 / speed)
            .ease(d3.easeLinear)
            .attr("transform", `translate(${x}, ${height + 20}) rotate(${Math.random() * 180})`)
            .on("end", function () {
              d3.select(this).attr("transform", `translate(${x}, ${y})`).call(animateHail)
            })
        }

        animateHail()
      }
    }

    // Cleanup function
    return () => {
      clearLightning()
    }
  }, [weatherSettings, selectedBiome])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-40">
        <svg ref={svgRef} className="w-full h-full" width="100%" height="100%" />
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 backdrop-blur-sm border-purple-500 text-purple-300"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? "×" : "☂"}
        </Button>

        {showControls && (
          <div className="absolute bottom-12 right-0 p-4 bg-black/50 backdrop-blur-sm rounded-lg shadow-lg w-72 border border-purple-500 text-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Alien Weather</h3>
            </div>

            <div className="mb-4">
              <Label htmlFor="biome-select" className="mb-2 block">
                Biome
              </Label>
              <Select value={selectedBiome} onValueChange={handleBiomeChange}>
                <SelectTrigger className="w-full bg-black/30 border-purple-400">
                  <SelectValue placeholder="Select a biome" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-purple-500 text-purple-100">
                  {Object.keys(biomeData).map((biome) => (
                    <SelectItem key={biome} value={biome} className="focus:bg-purple-900/50 focus:text-purple-100">
                      {biome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {(Object.keys(weatherSettings) as Array<keyof WeatherSettings>).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="capitalize">
                    {key}
                  </Label>
                  <Switch
                    id={key}
                    checked={weatherSettings[key]}
                    onCheckedChange={(checked) => updateSetting(key, checked)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              ))}
            </div>

            {selectedBiome && biomeData[selectedBiome] && (
              <div className="mt-4 pt-3 border-t border-purple-500/30">
                <p className="text-xs text-purple-300">
                  Based on biome parameters: temperature {biomeData[selectedBiome]?.temperature[0]}-
                  {biomeData[selectedBiome]?.temperature[1]}K, cloud count {biomeData[selectedBiome]?.cloudCount[0]}-
                  {biomeData[selectedBiome]?.cloudCount[1]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
};