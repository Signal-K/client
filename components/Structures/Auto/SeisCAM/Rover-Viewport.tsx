'use client'

import { Rover, SurfaceAnomaly, ViewMode } from "@/types/Structures/Rover";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

interface DatabaseAnomaly {
  id: number
  content: string | null
  ticId: string | null
  anomalytype: string | null
  type: string | null
  radius: number | null
  mass: number | null
  density: number | null
  gravity: number | null
  temperatureEq: number | null
  temperature: number | null
  smaxis: number | null
  orbital_period: number | null
  classification_status: string | null
  avatar_url: string | null
  created_at: string
  deepnote: string | null
  lightkurve: string | null
  configuration: any
  parentAnomaly: number | null
  anomalySet: string | null
};

interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
};

interface ExploredArea {
  x: number
  y: number
  radius: number
  timestamp: number
};

export default function RoverObservatory() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [currentRegion, setCurrentRegion] = useState({ x: 0, y: 0 })
    const [anomalies, setAnomalies] = useState<SurfaceAnomaly[]>([])
    const [filteredAnomalies, setFilteredAnomalies] = useState<SurfaceAnomaly[]>([])
    const [classifications, setClassifications] = useState<DatabaseClassification[]>([])
    const [allClassifications, setAllClassifications] = useState<DatabaseClassification[]>([])
    //   const [selectedProject, setSelectedProject] = useState<(typeof roverProjects)[0] | null>(null)
    //   const [selectedRover, setSelectedRover] = useState<Rover | null>(rovers[0])
    const [selectedAnomaly, setSelectedAnomaly] = useState<SurfaceAnomaly | null>(null)
    const [selectedDbAnomaly, setSelectedDbAnomaly] = useState<DatabaseAnomaly | null>(null)
    const [showClassifyDialog, setShowClassifyDialog] = useState(false)
    const [showProjectPanel, setShowProjectPanel] = useState(false)
    const [showRoverPanel, setShowRoverPanel] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("surface")
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, time: 0 })
    const [focusedAnomaly, setFocusedAnomaly] = useState<SurfaceAnomaly | null>(null)
    const [showAllDiscoveries, setShowAllDiscoveries] = useState(false)
    const [loading, setLoading] = useState(true)
    const [exploredAreas, setExploredAreas] = useState<Record<string, ExploredArea[]>>({})
    const [roverPositions, setRoverPositions] = useState<Record<string, { x: number; y: number }>>({})

    return (
        <></>
    );
};