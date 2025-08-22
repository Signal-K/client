"use client"

import { useState, useRef } from "react"
import { RoverBackground } from "@/src/components/classification/telescope/rover-background"

const PLANETS = ["Mars", "Phobos", "Deimos"]

export default function DeployRoverPage() {
  const [selectedPlanet, setSelectedPlanet] = useState("Mars")
  const [waypoints, setWaypoints] = useState<{x: number, y: number}[]>([])
  const mapRef = useRef<HTMLDivElement>(null)

  // Handle map click to add waypoint
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (waypoints.length >= 4) return
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setWaypoints([...waypoints, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }])
  }

  // Draw lines between waypoints
  const renderLines = () => {
    if (waypoints.length < 2) return null
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 2}}>
        {waypoints.slice(1).map((pt, i) => {
          const prev = waypoints[i]
          return (
            <line
              key={i}
              x1={`${prev.x}%`} y1={`${prev.y}%`}
              x2={`${pt.x}%`} y2={`${pt.y}%`}
              stroke="#fff" strokeWidth={3} strokeDasharray="8 4" opacity={0.8}
            />
          )
        })}
      </svg>
    )
  }

  // Draw waypoint markers
  const renderWaypoints = () => (
    waypoints.map((pt, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-[#18dda1] border-2 border-white shadow-lg"
        style={{
          left: `calc(${pt.x}% - 16px)`,
          top: `calc(${pt.y}% - 16px)`,
          width: 32,
          height: 32,
          zIndex: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span className="text-xs text-white font-bold">{i+1}</span>
      </div>
    ))
  )

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Deploy Rover</h1>
        <div className="mb-6">
          <label className="text-white font-medium mr-2">Select Planet:</label>
          <select
            value={selectedPlanet}
            onChange={e => setSelectedPlanet(e.target.value)}
            className="px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700"
          >
            {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="relative w-full h-[480px] rounded-lg overflow-hidden border border-zinc-700 shadow-lg" ref={mapRef} onClick={handleMapClick} style={{cursor: waypoints.length < 4 ? "crosshair" : "not-allowed"}}>
          <RoverBackground variant="martian-surface" />
          {renderLines()}
          {renderWaypoints()}
        </div>
        <div className="mt-6">
          <h2 className="text-lg text-white font-semibold mb-2">Waypoints</h2>
          <div className="space-y-2">
            {waypoints.map((pt, i) => (
              <div key={i} className="text-white text-sm">
                Waypoint {i+1}: X = {pt.x}, Y = {pt.y}
              </div>
            ))}
            {waypoints.length === 0 && <div className="text-zinc-400">Click on the map to add waypoints (max 4).</div>}
          </div>
        </div>
        <button
          className="mt-8 px-6 py-3 rounded bg-[#18dda1] text-white font-bold text-lg shadow-lg disabled:bg-zinc-700"
          disabled={waypoints.length < 2}
          onClick={() => alert("Deploy logic coming soon!")}
        >
          Deploy Rover
        </button>
      </div>
    </div>
  )
}
