'use client'

import { DiscoveryCardComponent } from "./discovery-card"

export function ExampleComponent() {
  const discoveryData = {
    name: "Luminous Leviathan",
    type: "Mega Fauna",
    profileImage: "/placeholder.svg?height=200&width=200",
    discoveredOn: "2157-03-15",
    collaborators: [
      { name: "Dr. Jane Smith", avatar: "/placeholder.svg?height=50&width=50" },
      { name: "Prof. Alex Johnson", avatar: "/placeholder.svg?height=50&width=50" },
      { name: "Capt. Maria Rodriguez", avatar: "/placeholder.svg?height=50&width=50" },
    ],
    parentAnomaly: "Terranova",
    keyStats: [
      { label: "Length", value: "75 meters" },
      { label: "Habitat", value: "Deep Ocean" },
      { label: "Bioluminescence", value: "Extreme" },
      { label: "Estimated Population", value: "50-100" },
    ],
  }

  return (
    <div className="p-4 bg-slate-100 min-h-screen flex items-center justify-center">
      <DiscoveryCardComponent {...discoveryData} />
    </div>
  )
} 