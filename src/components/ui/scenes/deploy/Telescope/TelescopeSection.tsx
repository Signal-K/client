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

  const supabase = useSupabaseClient();
  const session = useSession();

  const [hasTelescopeDeployed, setHasTelescopeDeployed] =
    useState<boolean>(false);
  const [linkedAnomalies, setLinkedAnomalies] = useState<Anomaly[]>([]);
  const [classifications, setClassifications] = useState<
    DatabaseClassification[]
  >([]);
  const [showLinkedOnly, setShowLinkedOnly] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [selectedClassification, setSelectedClassification] =
    useState<DatabaseClassification | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showClassificationDetailDialog, setShowClassificationDetailDialog] =
    useState(false);

  // Check for linked_anomalies of relevant type
  useEffect(() => {
    async function fetchLinkedAnomaliesAndClassifications() {
      if (!session?.user?.id) return;
      // Fetch linked anomalies for this user
      const { data: linked, error: linkedError } = await supabase
        .from("linked_anomalies")
        .select("*, anomaly:anomalies(*)")
        .eq("author", session.user.id)
        .in("automaton", ["Telescope", "TelescopePlanet"]); // TelescopeSolar
      
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
      const anomalyIds = mapped.map((a) =>
        typeof a.id === "string" ? a.id.replace("db-", "") : a.id
      );
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

  return (
    <Section
      sectionId="telescope-viewport"
      variant="viewport"
      backgroundType="interstellar"
      infoText={
        "View your telescope and everything you've discovered so far. Deploy your telescope each week and check back to browse through objects of interest and classify them."
      }
      expandLink={"/structures/telescope"}
    >
      <div className="relative w-full h-64 md:h-64 flex items-center justify-center py-8 md:py-12">
        {!hasTelescopeDeployed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="mb-4 w-full max-w-lg text-xs md:text-sm text-center text-zinc-300 leading-relaxed px-2">
              Each week, you are able to point and 'deploy' your telescope in a certain direction. Over the course of the week, new anomalous objects (referred to as "anomalies") will be identified by your telescope and become available for study. Classifying these anomalies can result in the discovery of planets and asteroids, which can later be visited and explored further.
            </div>
            <button
              className="px-6 py-3 bg-blue-700 text-white rounded-lg shadow text-lg font-semibold"
              onClick={handleDeployTelescope}
            >
              Deploy telescope
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Toggle for linked anomalies vs all - now at bottom, just above info button/text */}
            {/* <div className="absolute left-4 right-4 bottom-8 z-30 flex justify-start md:justify-center">
              <div className="flex items-center bg-[#0a0a2a]/80 border border-[#78cce2] rounded-xl shadow-lg px-1 py-0.5">
                <button
                  className={`px-2 py-1 rounded-l-xl font-mono tracking-wide text-xs transition-all duration-200 border-r border-[#78cce2] focus:outline-none ${
                    showLinkedOnly
                      ? "bg-gradient-to-r from-[#16213e] to-[#78cce2] text-white shadow-lg"
                      : "bg-[#1a1a2a] text-[#78cce2]"
                  }`}
                  onClick={() => setShowLinkedOnly(true)}
                >
                  <span className="inline-block align-middle mr-1">🛰️</span>{" "}
                  Objects of interest
                </button>
                <button
                  className={`px-2 py-1 rounded-r-xl font-mono tracking-wide text-xs transition-all duration-200 focus:outline-none ${
                    !showLinkedOnly
                      ? "bg-gradient-to-r from-[#16213e] to-[#78cce2] text-white shadow-lg"
                      : "bg-[#1a1a2a] text-[#78cce2]"
                  }`}
                  onClick={() => setShowLinkedOnly(false)}
                >
                  <span className="inline-block align-middle mr-1">🌌</span>{" "}
                  Discoveries
                </button>
              </div>
            </div> */}
            {/* Render anomalies or classifications */}
            <div className="w-full h-full relative">
              {showLinkedOnly
                ? linkedAnomalies.map((anomaly) => (
                    <SciFiAnomalyComponent
                      key={anomaly.id}
                      anomaly={{
                        ...anomaly,
                        name: "Anomaly"
                      }}
                      onClick={(a) => {
                        setSelectedAnomaly(a);
                        setShowDetailDialog(true);
                      }}
                    />
                  ))
                : classifications.map((classification) => (
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
                        name: "Anomaly",
                        type: "planet",
                        project: "telescope",
                      }}
                      onClick={() => {
                        setSelectedClassification(classification);
                        setShowClassificationDetailDialog(true);
                      }}
                    />
                  ))}
            </div>
            {/* Dialogs for anomaly/classification info */}
            <AnomalyDetailDialog
              showDetailDialog={showDetailDialog}
              setShowDetailDialog={setShowDetailDialog}
              selectedAnomaly={
                selectedAnomaly
                  ? {
                      ...selectedAnomaly,
                      type: selectedAnomaly.type || "planet",
                    }
                  : null
              }
              onClassify={() => {
                if (!selectedAnomaly) return;
                // Use anomaly object directly for DB fields
                const anomaly: any = selectedAnomaly;
                const anomalyType = anomaly.anomalytype || anomaly.type;
                const anomalySet = anomaly.anomalySet || anomaly.project;
                const anomalyId =
                  anomaly.id?.replace?.("db-", "") || anomaly.id;
                let link = "#";
                if (
                  anomalyType === "planet" ||
                  anomalySet === "telescope-tess"
                ) {
                  link = `/structures/telescope/planet-hunters/db-${anomalyId}/classify`;
                } else if (anomalyType === "cloud") {
                  link = `/structures/balloon/cloudspotting/db-${anomalyId}/classify`;
                } else if (
                  anomalyType === "telescopeMinor" ||
                  anomalyType === "asteroid" ||
                  anomalySet === "telescope-minorPlanet"
                ) {
                  if (anomalySet === "active-asteroids") {
                    link = `/structures/telescope/active-asteroids/db-${anomalyId}/classify`;
                  } else {
                    link = `/structures/telescope/daily-minor-planet/db-${anomalyId}/classify`;
                  }
                } else if (
                  anomalyType === "sunspot" ||
                  anomalySet === "telescope-sunspot"
                ) {
                  link = `/structures/telescope/sunspots/db-${anomalyId}/classify`;
                } else if (
                  anomalyType === "accretion_disc" ||
                  anomalySet === "disk-detective"
                ) {
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
};