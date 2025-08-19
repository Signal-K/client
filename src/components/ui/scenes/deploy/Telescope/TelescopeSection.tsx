"use client";

import { DatabaseClassification } from "@/src/components/classification/telescope/blocks/types";
import { TelescopeView } from "@/src/components/classification/telescope/telescope-view";
import { TelescopeViewportState } from "@/src/components/classification/telescope/telescope-viewport";
import { generateSectorName } from "@/src/components/classification/telescope/utils/sector-utils";
import Section from "@/src/components/sections/Section";
import { AnomalyData } from "@/types/AnomalyData";
import { Anomaly } from "@/types/Structures/telescope";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

export default function TelescopeViewportSection() {

  const session = useSession();
  const supabase = useSupabaseClient();

  const [hasTelescopeDeployed, setHasTelescopeDeployed] = useState<boolean>(false);

  // Check for linked_anomalies of relevant type
  useEffect(() => {
    async function checkTelescopeDeployment() {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from("linked_anomalies")
        .select("id, automaton")
        .eq("author", session.user.id)
        .in("automaton", ["Telescope", "TelescopeSolar", "TelescopePlanet"]); // Add more types if needed
      setHasTelescopeDeployed((data && data.length > 0) || false);
    }
    checkTelescopeDeployment();
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
    >
      <div className="relative w-full h-48 md:h-64 flex items-center justify-center py-8 md:py-12">
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
          <TelescopeView
            stars={state.stars}
            filteredAnomalies={state.filteredAnomalies}
            isDragging={state.isDragging}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleAnomalyClick={handleAnomalyClick}
            currentSectorName={currentSectorName}
            focusedAnomaly={state.focusedAnomaly}
            anomalies={state.anomalies}
          />
        )}
      </div>
    </Section>
  );
}
