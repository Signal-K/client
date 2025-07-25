"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { biomeData, BiomeData } from "@/src/features/weather/biomes"

interface WeatherSettings {
  rain: boolean
  snow: boolean
  hail: boolean
  clouds: boolean
  sun: boolean
  lightning: boolean
};

interface WeatherGeneratorProps {
  biome?: string
  settings?: WeatherSettings
};

const defaultSettings: WeatherSettings = {
  rain: false,
  snow: false,
  hail: false,
  clouds: true,
  sun: true,
  lightning: false,
};

// Convert kebab-case to Title Case
function formatBiomeName(name: string): string {
  if (!name) return ""
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
};

// Convert Title Case to kebab-case
function kebabCase(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
};

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

export default function WeatherGenerator({ biome = "", settings }: WeatherGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [weatherSettings, setWeatherSettings] = useState<WeatherSettings>(defaultSettings)
  const [showControls, setShowControls] = useState(false)
  const [selectedBiome, setSelectedBiome] = useState<string>(formatBiomeName(biome))

  // Update settings when biome prop changes
  useEffect(() => {
    if (biome) {
      const formattedBiome = formatBiomeName(biome)
      setSelectedBiome(formattedBiome)
      if (!settings) {
        setWeatherSettings(getWeatherSettingsForBiome(biome))
      }
    }
  }, [biome, settings])

  // Update settings when settings prop changes
  useEffect(() => {
    if (settings) {
      setWeatherSettings(settings)
    }
  }, [settings])

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
      sky: "#0a0a1a",
      clouds: ["#4a5fc1", "#5a6fc1", "#6a7fc1"],
      sun: "#ff9e00",
      sunRays: "#ff5400",
      rain: "#00c8ff",
      snow: "#a0e6ff",
      hail: "#4cc9f0",
      lightning: "#ffffff", // Changed to white to match the gas giant storms
    }

    // Add a subtle gradient background
    const defs = svg.append("defs")

    // Update the gradient background
    const gradient = defs
      .append("linearGradient")
      .attr("id", "alien-sky-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")

    gradient.append("stop").attr("offset", "0%").attr("stop-color", colors.sky).attr("stop-opacity", 0.7)
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a2a4a").attr("stop-opacity", 0.3)

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
          // Create multiple storm clusters instead of single bolts
          const stormCount = 1 + Math.floor(Math.random() * 3)

          for (let s = 0; s < stormCount; s++) {
            const x = Math.random() * width * 0.8 + width * 0.1
            const y = 100 + Math.random() * 150

            // Create a storm cluster
            const stormGroup = svg.append("g").attr("transform", `translate(${x}, ${y})`).style("filter", "url(#glow)")

            // Generate swirling storm pattern inspired by gas giant storms
            const generateStormPattern = () => {
              const stormSize = 30 + Math.random() * 40
              const spiralCount = 3 + Math.floor(Math.random() * 3)
              const spiralTightness = 0.2 + Math.random() * 0.3

              // Create the main storm body - a glowing ellipse
              stormGroup
                .append("ellipse")
                .attr("rx", stormSize)
                .attr("ry", stormSize * 0.7)
                .attr("fill", "#ffffff")
                .attr("opacity", 0.2)

              // Create swirling spiral patterns
              for (let i = 0; i < spiralCount; i++) {
                const spiralPath = d3.path()
                const startAngle = Math.random() * Math.PI * 2
                const rotationDir = Math.random() > 0.5 ? 1 : -1

                spiralPath.moveTo(0, 0)

                for (let t = 0; t < 10; t++) {
                  const angle = startAngle + rotationDir * t * spiralTightness
                  const radius = t * (stormSize / 10)
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius

                  spiralPath.lineTo(x, y)
                }

                stormGroup
                  .append("path")
                  .attr("d", spiralPath.toString())
                  .attr("stroke", "#ffffff")
                  .attr("stroke-width", 2)
                  .attr("fill", "none")
                  .attr("opacity", 0.7)
              }

              // Add bright spots within the storm
              const spotCount = 3 + Math.floor(Math.random() * 5)
              for (let i = 0; i < spotCount; i++) {
                const angle = Math.random() * Math.PI * 2
                const distance = Math.random() * stormSize * 0.7
                const spotX = Math.cos(angle) * distance
                const spotY = Math.sin(angle) * distance
                const spotSize = 2 + Math.random() * 4

                stormGroup
                  .append("circle")
                  .attr("cx", spotX)
                  .attr("cy", spotY)
                  .attr("r", spotSize)
                  .attr("fill", "#ffffff")
                  .attr("opacity", 0.9)
              }
            }

            generateStormPattern()

            // Animate storm flash and dissipation
            stormGroup
              .transition()
              .duration(200)
              .attr("opacity", 1)
              .transition()
              .duration(100)
              .attr("opacity", 0.7)
              .transition()
              .duration(100)
              .attr("opacity", 0.9)
              .transition()
              .duration(1500)
              .attr("opacity", 0)
              .remove()
          }
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
      {/* <p>{biome}</p> */}

      <div className="fixed bottom-4 right-4 z-50">
        {/* Update the button styling */}
        <Button
          variant="outline"
          size="icon"
          className="bg-black/30 backdrop-blur-sm border-blue-500 text-blue-300"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? "×" : "☂"}
        </Button>

        {showControls && (
          <div className="absolute bottom-12 right-0 p-4 bg-black/50 backdrop-blur-sm rounded-lg shadow-lg w-72 border border-blue-500 text-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Weather Controls</h3>
            </div>

            <div className="mb-4">
              <Label htmlFor="biome-select" className="mb-2 block">
                Biome
              </Label>
              <Select value={selectedBiome} onValueChange={handleBiomeChange}>
                <SelectTrigger className="w-full bg-black/30 border-blue-400">
                  <SelectValue placeholder="Select a biome" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-blue-500 text-blue-100">
                  {Object.keys(biomeData).map((biome) => (
                    <SelectItem key={biome} value={biome} className="focus:bg-blue-900/50 focus:text-blue-100">
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
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              ))}
            </div>

            {selectedBiome && biomeData[selectedBiome] && (
              <div className="mt-4 pt-3 border-t border-blue-500/30">
                <p className="text-xs text-blue-300">
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
}