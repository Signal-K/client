import { Biome } from "@/types/station"

interface BiomePatternProps {
  biome: Biome
  className?: string
}

export function BiomePattern({ biome, className = "" }: BiomePatternProps) {
  // Generate a hex-like pattern
  const generateHexPattern = () => {
    const pattern = []
    const rows = 3
    const cols = 6

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const isOffset = i % 2 === 0
        const colorIndex = (i * j + j) % 3
        const color = colorIndex === 0 ? biome.accentColor : colorIndex === 1 ? biome.color : biome.darkColor

        pattern.push(
          <div
            key={`${i}-${j}`}
            className={`relative h-8 w-8 ${isOffset ? "translate-x-4" : ""}`}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              backgroundColor: color,
              opacity: Math.random() * 0.5 + 0.5, // Random opacity for more variety
              transform: `rotate(${Math.random() * 30}deg)`, // Slight random rotation
            }}
          >
            {/* Add subtle inner glow */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at center, ${biome.accentColor}22 0%, transparent 70%)`,
              }}
            />
          </div>,
        )
      }
    }
    return pattern
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(45deg, ${biome.darkColor}, ${biome.color})`,
        }}
      />

      {/* Animated scan line */}
      <div
        className="absolute inset-0 animate-scan"
        style={{
          background: "linear-gradient(transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
          backgroundSize: "100% 200%",
          animation: "scan 4s linear infinite",
        }}
      />

      {/* Hex pattern container */}
      <div className="relative flex flex-wrap justify-center gap-0 py-2">{generateHexPattern()}</div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  )
}

