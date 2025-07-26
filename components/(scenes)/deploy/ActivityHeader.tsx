"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { AvatarGenerator } from "@/components/Account/Avatar";
import ProfileDetailsPanel from "@/components/Account/ProfileDetailsPanel";
import { Globe, Telescope, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface DeploymentStatus {
  telescope: {
    deployed: boolean;
    unclassifiedCount: number;
  };
  satellites: {
    deployed: boolean;
    unclassifiedCount: number;
    available: boolean;
  };
}

interface PlanetTarget {
  id: number;
  name: string;
}

export default function ActivityHeader({
  landmarksExpanded,
  onToggleLandmarks,
  scrolled,
}: {
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
  scrolled: boolean;
}) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [profile, setProfile] = useState<{
    classificationPoints: number | null;
    username: string | null;
  } | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [groupsToShow, setGroupsToShow] = useState<string[]>(["Astronomy", "Meteorology", "Geology", "Biology"]);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    telescope: { deployed: false, unclassifiedCount: 0 },
    satellites: { deployed: false, unclassifiedCount: 0, available: false }
  });
  
  const [planetTargets, setPlanetTargets] = useState<PlanetTarget[]>([]);
  const [showPlanetSelector, setShowPlanetSelector] = useState(false);
  const [deploymentMessage, setDeploymentMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Close planet selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPlanetSelector) {
        const target = event.target as Element;
        if (!target.closest('.planet-selector-container')) {
          setShowPlanetSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlanetSelector]);

  useEffect(() => {
    const updateGroups = () => {
      if (window.innerWidth < 640) {
        setGroupsToShow(["Astronomy"]);
      } else {
        setGroupsToShow(["Astronomy", "Meteorology", "Geology", "Biology"]);
      }
    };

    updateGroups();
    window.addEventListener("resize", updateGroups);
    return () => window.removeEventListener("resize", updateGroups);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("classificationPoints, username")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(profileData);
    };

    const fetchPlanetTargets = async () => {
      const userId = session.user.id;

      // Get planet classifications
      const { data: planetClassifications } = await supabase
        .from("classifications")
        .select("id, anomaly:anomaly(content)")
        .eq("author", userId)
        .eq("classificationtype", "planet");

      const planetIds = (planetClassifications ?? []).map((c) => c.id);

      if (planetIds.length === 0) {
        setPlanetTargets([]);
        return [];
      }

      // Get comments with radius measurements
      const { data: radiusComments } = await supabase
        .from("comments")
        .select("classification_id")
        .eq("category", "Radius")
        .in("classification_id", planetIds);

      const planetIdsWithRadius = new Set((radiusComments ?? []).map((c) => c.classification_id));

      const validPlanets = (planetClassifications ?? [])
        .filter((c) => planetIdsWithRadius.has(c.id))
        .map((c) => ({
          id: c.id,
          name: (c.anomaly as any)?.content || `Planet #${c.id}`,
        }));

      setPlanetTargets(validPlanets);
      return validPlanets;
    };

    const checkDeploymentStatus = async () => {
      const userId = session.user.id;

      // Check telescope deployment (entries without automaton field)
      const { data: telescopeDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .is("automaton", null);

      // Check satellite deployment (entries with WeatherSatellite automaton)
      const { data: satelliteDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "WeatherSatellite");

      // Get user's classifications to check what's been classified
      const { data: userClassifications } = await supabase
        .from("classifications")
        .select("anomaly")
        .eq("author", userId);

      const classifiedAnomalyIds = new Set(
        (userClassifications ?? []).map(c => c.anomaly).filter(Boolean)
      );

      // Count unclassified telescope discoveries
      const telescopeUnclassified = (telescopeDeployments ?? []).filter(
        deployment => !classifiedAnomalyIds.has(deployment.anomaly_id)
      ).length;

      // Count unclassified satellite discoveries
      const satelliteUnclassified = (satelliteDeployments ?? []).filter(
        deployment => !classifiedAnomalyIds.has(deployment.anomaly_id)
      ).length;

      // Get available planets for satellite deployment
      const validPlanets = await fetchPlanetTargets();

      setDeploymentStatus({
        telescope: {
          deployed: (telescopeDeployments ?? []).length > 0,
          unclassifiedCount: telescopeUnclassified
        },
        satellites: {
          deployed: (satelliteDeployments ?? []).length > 0,
          unclassifiedCount: satelliteUnclassified,
          available: validPlanets.length > 0
        }
      });
    };

    fetchData();
    checkDeploymentStatus();
  }, [session, supabase]);

  const handleSendSatellite = async (planetId: number, planetName: string) => {
    if (!session) return;
    
    const userId = session.user.id;

    try {
      // Get random cloud anomaly
      const { data: cloudAnomalies, error } = await supabase
        .from("anomalies")
        .select("id")
        .eq("anomalytype", "cloud");

      if (error || !cloudAnomalies || cloudAnomalies.length === 0) return;

      const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
      const selectedAnomaly = cloudAnomalies[randomIndex];

      const insertPayload = [
        {
          author: userId,
          anomaly_id: selectedAnomaly.id,
          classification_id: planetId,
          automaton: "WeatherSatellite",
        },
        {
          author: userId,
          anomaly_id: selectedAnomaly.id,
          classification_id: planetId,
          automaton: "WeatherSatellite",
        },
      ];

      await supabase.from("linked_anomalies").insert(insertPayload);

      // Show success message and animation
      setDeploymentMessage(`🛰️ Satellite successfully deployed to ${planetName}!`);
      setIsAnimating(true);
      setShowPlanetSelector(false);

      // Hide message after animation
      setTimeout(() => {
        setDeploymentMessage("");
        setIsAnimating(false);
      }, 4000);

      // Refresh deployment status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error deploying satellite:", error);
    }
  };

  // SVG Icons
  const TelescopeIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Telescope Base */}
      <rect
        x="11" y="22" width="6" height="4" rx="1"
        fill={deployed ? "#4f46e5" : "#9ca3af"}
        stroke={deployed ? "#3730a3" : "#6b7280"}
        strokeWidth="1"
      />
      
      {/* Telescope Main Body */}
      <ellipse
        cx="14" cy="14" rx="8" ry="3"
        fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
        stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
        strokeWidth="2"
        transform="rotate(-30 14 14)"
      />
      
      {/* Telescope Lens */}
      <circle
        cx="8" cy="10" r="2.5"
        fill={deployed ? "#fbbf24" : "#e5e7eb"}
        stroke={deployed ? "#f59e0b" : "#9ca3af"}
        strokeWidth="1.5"
      />
      
      {/* Telescope Eyepiece */}
      <circle
        cx="20" cy="18" r="1.5"
        fill={deployed ? "#8b5cf6" : "#d1d5db"}
        stroke={deployed ? "#7c3aed" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Support Legs */}
      <path
        d="M11 22L8 26M17 22L20 26"
        stroke={deployed ? "#4f46e5" : "#9ca3af"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Stars/Discovery Indicators */}
      {deployed && (
        <>
          <circle cx="4" cy="6" r="1" fill="#fbbf24" opacity="0.8" />
          <circle cx="22" cy="4" r="0.8" fill="#06d6a0" opacity="0.7" />
          <circle cx="24" cy="12" r="0.6" fill="#f72585" opacity="0.6" />
        </>
      )}
      
      {/* Discovery Notification */}
      {hasDiscoveries && (
        <circle cx="22" cy="6" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );

  const SatelliteIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Satellite Main Body */}
      <rect
        x="10" y="10" width="8" height="8" rx="2"
        fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
        stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
        strokeWidth="2"
      />
      
      {/* Solar Panels */}
      <rect
        x="6" y="12" width="3" height="4" rx="0.5"
        fill={deployed ? "#1e40af" : "#9ca3af"}
        stroke={deployed ? "#1e3a8a" : "#6b7280"}
        strokeWidth="1"
      />
      <rect
        x="19" y="12" width="3" height="4" rx="0.5"
        fill={deployed ? "#1e40af" : "#9ca3af"}
        stroke={deployed ? "#1e3a8a" : "#6b7280"}
        strokeWidth="1"
      />
      
      {/* Solar Panel Grid Lines */}
      {deployed && (
        <>
          <line x1="6.5" y1="12" x2="6.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="7.5" y1="12" x2="7.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="8.5" y1="12" x2="8.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="19.5" y1="12" x2="19.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="20.5" y1="12" x2="20.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="21.5" y1="12" x2="21.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        </>
      )}
      
      {/* Communication Dish */}
      <ellipse
        cx="14" cy="12" rx="2" ry="1"
        fill={deployed ? "#fbbf24" : "#e5e7eb"}
        stroke={deployed ? "#f59e0b" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Antenna */}
      <line
        x1="14" y1="10" x2="14" y2="7"
        stroke={deployed ? "#ef4444" : "#9ca3af"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="14" cy="7" r="1"
        fill={deployed ? "#ef4444" : "#d1d5db"}
      />
      
      {/* Thruster Flames */}
      {deployed && (
        <>
          <path
            d="M12 18L11 21L13 21Z"
            fill="#f97316"
            opacity="0.8"
          />
          <path
            d="M16 18L15 21L17 21Z"
            fill="#f97316"
            opacity="0.8"
          />
        </>
      )}
      
      {/* Signal Waves */}
      {deployed && (
        <>
          <path
            d="M16 12C18 10 20 10 22 12"
            stroke="#06d6a0"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M17 12C18.5 11 19.5 11 21 12"
            stroke="#06d6a0"
            strokeWidth="1"
            fill="none"
            opacity="0.8"
          />
        </>
      )}
      
      {/* Earth in Background */}
      <circle
        cx="24" cy="24" r="3"
        fill="#3b82f6"
        opacity="0.3"
      />
      <path
        d="M22 24C22 23 23 22 24 22C25 22 26 23 26 24"
        stroke="#10b981"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      
      {/* Discovery Notification */}
      {hasDiscoveries && (
        <circle cx="22" cy="6" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );

  const getStatusLabel = (deployed: boolean, unclassifiedCount: number, type: string) => {
    if (!deployed) return `Deploy ${type}`;
    if (unclassifiedCount > 0) return `${unclassifiedCount} new discoveries`;
    return `${type} active`;
  };

  const getStatusColor = (deployed: boolean, unclassifiedCount: number) => {
    if (!deployed) return "text-gray-500 dark:text-gray-400";
    if (unclassifiedCount > 0) return "text-emerald-600 dark:text-emerald-400 font-semibold";
    return "text-blue-600 dark:text-blue-400";
  };

  const getIconBackgroundColor = (deployed: boolean, unclassifiedCount: number) => {
    if (!deployed) return "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700";
    if (unclassifiedCount > 0) return "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40";
    return "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40";
  };

  const displayName = profile?.username || session?.user?.email || "User";

  return (
    <Card className="relative w-full h-48 sm:h-64 overflow-visible rounded-lg border-chart-4/30 bg-card">
      <img
        src="/assets/Backdrops/Earth.png"
        alt="Earth"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent via-card/20 flex items-end p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            {/* <Globe className="w-8 h-8 text-chart-4" /> */}
            <div>
              <AvatarGenerator author={session?.user.id || ""} />
              <h2 className="text-l font-bold text-foreground">
                {profile?.username || "USERNAME"}
              </h2>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end px-2 sm:px-8 text-sm text-muted-foreground relative">
            <div className="mb-3 text-xs uppercase tracking-wide">Deployment Status</div>
            
            {/* Deployment Success Message */}
            {deploymentMessage && (
              <div className={`mb-3 p-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-xs font-medium transition-all duration-500 ${isAnimating ? 'animate-bounce' : ''}`}>
                {deploymentMessage}
              </div>
            )}
            
            <div className="flex gap-4 relative">
              {/* Telescope Status */}
              <Link 
                href="/structures/telescope"
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card/20 transition-colors group"
              >
                <div className={`p-2 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount)}`}>
                  <TelescopeIcon 
                    deployed={deploymentStatus.telescope.deployed} 
                    hasDiscoveries={deploymentStatus.telescope.unclassifiedCount > 0} 
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium group-hover:text-foreground transition-colors block">
                    Telescope
                  </span>
                  <span className={`text-xs ${getStatusColor(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount)} transition-colors block`}>
                    {getStatusLabel(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount, "telescope")}
                  </span>
                </div>
              </Link>

              {/* Satellite Status - Only show if available */}
              {deploymentStatus.satellites.available && (
                <button
                  onClick={() => setShowPlanetSelector(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card/20 transition-colors group"
                >
                  <div className={`p-2 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount)}`}>
                    <SatelliteIcon 
                      deployed={deploymentStatus.satellites.deployed} 
                      hasDiscoveries={deploymentStatus.satellites.unclassifiedCount > 0} 
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium group-hover:text-foreground transition-colors block">
                      Satellites
                    </span>
                    <span className={`text-xs ${getStatusColor(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount)} transition-colors block`}>
                      {getStatusLabel(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount, "satellites")}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Planet Selector Modal */}
      <Dialog open={showPlanetSelector} onOpenChange={setShowPlanetSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🛰️</span>
              Deploy Satellite
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select a planet to deploy your weather satellite to:
            </p>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {planetTargets.map((planet) => (
                <button
                  key={planet.id}
                  onClick={() => handleSendSatellite(planet.id, planet.name)}
                  className="w-full px-4 py-3 text-left rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-3 group"
                >
                  <span className="text-2xl">🌍</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground group-hover:text-foreground">
                      {planet.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Deploy weather monitoring satellite
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {planetTargets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">🌍</span>
                <p className="text-sm">No planets available for satellite deployment</p>
                <p className="text-xs">Classify planets with radius measurements to unlock satellite deployment</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};