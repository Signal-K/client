"use client";

import { DatabaseClassification } from "@/src/components/classification/telescope/blocks/types";
import { AnomalyComponent } from "@/src/components/classification/viewport/anomaly-component";
import { SciFiAnomalyComponent } from "@/src/components/classification/viewport/sci-fi-anomaly-component";
import { AnomalyDetailDialog } from "@/src/components/classification/viewport/anomaly-detail-dialogue";
import { ClassificationDetailDialog } from "@/src/components/classification/viewport/classification-detail-dialog";
import { TelescopeViewportState } from "@/src/components/classification/telescope/telescope-viewport";
import { generateSectorName } from "@/src/components/classification/telescope/utils/sector-utils";
import Section from "@/src/components/sections/Section";
import { AnomalyData } from "@/types/AnomalyData";
import { Anomaly } from "@/types/Structures/telescope";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TelescopeViewportSection() {
  const router = useRouter();

  const session = useSession();
  const supabase = useSupabaseClient();

  const [hasTelescopeDeployed, setHasTelescopeDeployed] = useState<boolean>(false);
  const [linkedAnomalies, setLinkedAnomalies] = useState<Anomaly[]>([]);
  const [classifications, setClassifications] = useState<DatabaseClassification[]>([]);
  const [showLinkedOnly, setShowLinkedOnly] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<DatabaseClassification | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showClassificationDetailDialog, setShowClassificationDetailDialog] = useState(false);

  // Check for linked_anomalies of relevant type
  useEffect(() => {
    async function fetchLinkedAnomaliesAndClassifications() {
      if (!session?.user?.id) return;
      // Fetch linked anomalies for this user
      const { data: linked, error: linkedError } = await supabase
        .from("linked_anomalies")
        .select("*, anomaly:anomalies(*)")
        .eq("author", session.user.id)
        .in("automaton", ["Telescope", "TelescopeSolar", "TelescopePlanet"]);
      setHasTelescopeDeployed((linked && linked.length > 0) || false);
      // Map to anomaly shape
      const mapped = (linked || []).map((row: any) => ({
        id: `db-${row.anomaly_id}`,
        ...row.anomaly,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: 1,
        brightness: 1,
        color: "#78cce2",
        shape: "circle",
        classified: !!row.classification_id,
        glowIntensity: 0.5,
        pulseSpeed: 1.5,
      }));
      setLinkedAnomalies(mapped);
      // Fetch classifications for this user and others
      const anomalyIds = mapped.map(a => typeof a.id === "string" ? a.id.replace("db-", "") : a.id);
      const { data: classData, error: classError } = await supabase
        .from("classifications")
        .select("*")
        .in("anomaly", anomalyIds);
      setClassifications(classData || []);
    }
    fetchLinkedAnomaliesAndClassifications();
  }, [session, supabase]);

  // Deploy handler (stub)
  const handleDeployTelescope = async () => {
    window.location.href = "/activity/deploy/";
  };

  const [state, setState] = useState<TelescopeViewportState>({
    currentSector: { x: 0, y: 0 },
    anomalies: [],
    filteredAnomalies: [],
    classifications: [],
    allClassifications: [],
    selectedProject: null,
    selectedAnomaly: null,
    selectedClassification: null,
    showClassifyDialog: false,
    showDetailDialog: false,
    showClassificationDetailDialog: false,
    stars: [],
    viewMode: "viewport",
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    focusedAnomaly: null,
    showAllDiscoveries: false,
    loading: true,
    mobileMenuOpen: false,
  });

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
    }));
  };

  const currentSectorName = generateSectorName(state.currentSector.x, state.currentSector.y)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.dragStart.x;
    const deltaY = e.clientY - state.dragStart.y;

    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      setState((prev) => ({
        ...prev,
        currentSector: {
          x: prev.currentSector.x - Math.sign(deltaX),
          y: prev.currentSector.y - Math.sign(deltaY),
        },
        dragStart: { x: e.clientX, y: e.clientY },
      }));
    }
  };

  const handleMouseUp = () => {
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleAnomalyClick = (anomaly: Anomaly) => {
    if (state.isDragging) return;

    setState((prev) => ({
      ...prev,
      selectedAnomaly: anomaly,
      showDetailDialog: anomaly.classified || false,
      showClassifyDialog: !anomaly.classified,
    }));
  };

  const handleViewAnomaly = (anomaly: AnomalyData) => {
    setState((prev) => ({
      ...prev,
      viewMode: "viewport",
      focusedAnomaly: anomaly,
      selectedAnomaly: anomaly,
    }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, showDetailDialog: true }));
    }, 500);
  };

  const handleViewClassification = (classification: DatabaseClassification) => {
    setState((prev) => ({
      ...prev,
      selectedClassification: classification,
      showClassificationDetailDialog: true,
    }));
  };

  return (
    <Section
      sectionId="telescope-viewport"
      variant="viewport"
      backgroundType="interstellar"
      infoText={"View your telescope and everything you've discovered so far. Deploy your telescope each week and check back to browse through objects of interest and classify them."}
    >
      <div className="relative w-full h-64 md:h-64 flex items-center justify-center py-8 md:py-12">
        {!hasTelescopeDeployed ? (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow text-lg font-semibold"
              onClick={handleDeployTelescope}
            >
              Deploy telescope
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Toggle for linked anomalies vs all */}
            <div className="absolute bottom-4 left-4 z-30 flex gap-2">
              <div className="flex items-center bg-[#0a0a2a]/80 border border-[#78cce2] rounded-xl shadow-lg px-1 py-0.5">
                <button
                  className={`px-2 py-1 rounded-l-xl font-mono tracking-wide text-xs transition-all duration-200 border-r border-[#78cce2] focus:outline-none ${showLinkedOnly ? "bg-gradient-to-r from-[#16213e] to-[#78cce2] text-white shadow-lg" : "bg-[#1a1a2a] text-[#78cce2]"}`}
                  onClick={() => setShowLinkedOnly(true)}
                >
                  <span className="inline-block align-middle mr-1">🛰️</span> Objects of interest
                </button>
                <button
                  className={`px-2 py-1 rounded-r-xl font-mono tracking-wide text-xs transition-all duration-200 focus:outline-none ${!showLinkedOnly ? "bg-gradient-to-r from-[#16213e] to-[#78cce2] text-white shadow-lg" : "bg-[#1a1a2a] text-[#78cce2]"}`}
                  onClick={() => setShowLinkedOnly(false)}
                >
                  <span className="inline-block align-middle mr-1">🌌</span> Discoveries
                </button>
              </div>
            </div>
            {/* Render anomalies or classifications */}
            <div className="w-full h-full relative">
              {showLinkedOnly ? (
                linkedAnomalies.map(anomaly => (
                  <SciFiAnomalyComponent
                    key={anomaly.id}
                    anomaly={anomaly}
                    onClick={a => {
                      setSelectedAnomaly(a);
                      setShowDetailDialog(true);
                    }}
                  />
                ))
              ) : (
                classifications.map(classification => (
                  <AnomalyComponent
                    key={classification.id}
                    anomaly={{
                      id: `db-${classification.anomaly}`,
                      x: Math.random() * 80 + 10,
                      y: Math.random() * 80 + 10,
                      size: 1,
                      brightness: 1,
                      color: "#f2c572",
                      shape: "star",
                      classified: true,
                      glowIntensity: 0.7,
                      pulseSpeed: 1.2,
                      sector: "N/A",
                      name: `Classification #${classification.id}`,
                      type: "planet",
                      project: "telescope",
                    }}
                    onClick={() => {
                      setSelectedClassification(classification);
                      setShowClassificationDetailDialog(true);
                    }}
                  />
                ))
              )}
            </div>
            {/* Dialogs for anomaly/classification info */}
            <AnomalyDetailDialog
              showDetailDialog={showDetailDialog}
              setShowDetailDialog={setShowDetailDialog}
              selectedAnomaly={selectedAnomaly ? { ...selectedAnomaly, type: selectedAnomaly.type || "planet" } : null}
              onClassify={() => {
                if (!selectedAnomaly) return;
                // Use anomaly object directly for DB fields
                const anomaly: any = selectedAnomaly;
                const anomalyType = anomaly.anomalytype || anomaly.type;
                const anomalySet = anomaly.anomalySet || anomaly.project;
                const anomalyId = anomaly.id?.replace?.("db-", "") || anomaly.id;
                let link = "#";
                if (anomalyType === "planet" || anomalySet === "telescope-tess") {
                  link = `/structures/telescope/planet-hunters/db-${anomalyId}/classify`;
                } else if (anomalyType === "cloud") {
                  link = `/structures/balloon/cloudspotting/db-${anomalyId}/classify`;
                } else if (anomalyType === "telescopeMinor" || anomalyType === "asteroid" || anomalySet === "telescope-minorPlanet") {
                  if (anomalySet === "active-asteroids") {
                    link = `/structures/telescope/active-asteroids/db-${anomalyId}/classify`;
                  } else {
                    link = `/structures/telescope/daily-minor-planet/db-${anomalyId}/classify`;
                  }
                } else if (anomalyType === "sunspot" || anomalySet === "telescope-sunspot") {
                  link = `/structures/telescope/sunspots/db-${anomalyId}/classify`;
                } else if (anomalyType === "accretion_disc" || anomalySet === "disk-detective") {
                  link = `/structures/telescope/disk-detective/db-${anomalyId}/classify`;
                } else {
                  // fallback: go to planet-hunters if type is missing
                  link = `/structures/telescope/planet-hunters/db-${anomalyId}/classify`;
                }
                router.push(link);
                setShowDetailDialog(false);
              }}
              config="telescope"
            />
            <ClassificationDetailDialog
              showDetailDialog={showClassificationDetailDialog}
              setShowDetailDialog={setShowClassificationDetailDialog}
              selectedClassification={selectedClassification}
              config="telescope"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
