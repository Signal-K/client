"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar";
import ProfileDetailsPanel from "@/src/components/profile/setup/ProfileDetailsPanel";
import TotalPoints from "@/src/components/deployment/missions/structures/Stardust/Total";
import { Globe, Telescope, X } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
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
  rover: {
    deployed: boolean;
    unclassifiedCount: number;
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
  location,
}: {
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
  scrolled: boolean;
  location?: string;
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
    satellites: { deployed: false, unclassifiedCount: 0, available: false },
    rover: { deployed: false, unclassifiedCount: 0 }
  });
  
  const [planetTargets, setPlanetTargets] = useState<PlanetTarget[]>([]);
  const [showPlanetSelector, setShowPlanetSelector] = useState(false);
  const [deploymentMessage, setDeploymentMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [stardustPoints, setStardustPoints] = useState<number>(0);

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

      // Get all classified planets
      const validPlanets = (planetClassifications ?? [])
        .map((c) => ({
          id: c.id,
          name: (c.anomaly as any)?.content || `Planet #${c.id}`,
        }));

      setPlanetTargets(validPlanets);
      return validPlanets;
    };

    const checkDeploymentStatus = async () => {
      const userId = session.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Check telescope deployment (entries with Telescope automaton from last week)
      const { data: telescopeDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "Telescope")
        .gte("date", oneWeekAgo.toISOString());

      // Check satellite deployment (entries with WeatherSatellite automaton)
      const { data: satelliteDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "WeatherSatellite");

      // Check rover deployment (entries with Rover automaton)
      const { data: roverDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "Rover");

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

      // Count unclassified rover discoveries
      const roverUnclassified = (roverDeployments ?? []).filter(
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
        },
        rover: {
          deployed: (roverDeployments ?? []).length > 0,
          unclassifiedCount: roverUnclassified
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

  const RoverIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rover Main Body */}
      <rect
        x="8" y="12" width="12" height="6" rx="2"
        fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
        stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
        strokeWidth="2"
      />
      
      {/* Solar Panel on Top */}
      <rect
        x="10" y="9" width="8" height="2" rx="0.5"
        fill={deployed ? "#1e40af" : "#9ca3af"}
        stroke={deployed ? "#1e3a8a" : "#6b7280"}
        strokeWidth="1"
      />
      
      {/* Solar Panel Grid Lines */}
      {deployed && (
        <>
          <line x1="11" y1="9" x2="11" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="13" y1="9" x2="13" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="15" y1="9" x2="15" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
          <line x1="17" y1="9" x2="17" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
        </>
      )}
      
      {/* Wheels */}
      <circle
        cx="10" cy="20" r="2.5"
        fill={deployed ? "#374151" : "#9ca3af"}
        stroke={deployed ? "#1f2937" : "#6b7280"}
        strokeWidth="1.5"
      />
      <circle
        cx="18" cy="20" r="2.5"
        fill={deployed ? "#374151" : "#9ca3af"}
        stroke={deployed ? "#1f2937" : "#6b7280"}
        strokeWidth="1.5"
      />
      
      {/* Wheel Spokes */}
      {deployed && (
        <>
          <line x1="8.5" y1="18.5" x2="11.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
          <line x1="11.5" y1="18.5" x2="8.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
          <line x1="16.5" y1="18.5" x2="19.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
          <line x1="19.5" y1="18.5" x2="16.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
        </>
      )}
      
      {/* Camera/Sensor Mast */}
      <rect
        x="13" y="6" width="2" height="6" rx="0.5"
        fill={deployed ? "#6b7280" : "#d1d5db"}
        stroke={deployed ? "#4b5563" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Camera/Sensor Head */}
      <circle
        cx="14" cy="6" r="1.5"
        fill={deployed ? "#fbbf24" : "#e5e7eb"}
        stroke={deployed ? "#f59e0b" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Robotic Arm */}
      <path
        d="M20 15L22 13L24 15L22 17Z"
        fill={deployed ? "#8b5cf6" : "#d1d5db"}
        stroke={deployed ? "#7c3aed" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Arm Joint */}
      <circle
        cx="22" cy="15" r="1"
        fill={deployed ? "#6366f1" : "#d1d5db"}
      />
      
      {/* Sample Container */}
      <rect
        x="12" y="14" width="4" height="2" rx="0.5"
        fill={deployed ? "#059669" : "#d1d5db"}
        stroke={deployed ? "#047857" : "#9ca3af"}
        strokeWidth="1"
      />
      
      {/* Dust Trail Effect (when deployed) */}
      {deployed && (
        <>
          <circle cx="6" cy="22" r="0.5" fill="#d97706" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="4" cy="23" r="0.3" fill="#d97706" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="24" cy="22" r="0.4" fill="#d97706" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.8s" repeatCount="indefinite"/>
          </circle>
        </>
      )}
      
      {/* Rock Samples (when has discoveries) */}
      {hasDiscoveries && (
        <>
          <circle cx="2" cy="24" r="1" fill="#92400e" opacity="0.8"/>
          <circle cx="26" cy="25" r="0.8" fill="#7c2d12" opacity="0.7"/>
          <circle cx="4" cy="26" r="0.6" fill="#a16207" opacity="0.6"/>
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

  const TechTreeIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central Node */}
      <circle
        cx="12" cy="12" r="3"
        fill="currentColor"
        className="opacity-90"
      />
      
      {/* Branch Lines */}
      <path
        d="M12 9V4M12 20V15M9 12H4M20 12H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-70"
      />
      
      {/* Diagonal Lines */}
      <path
        d="M15.5 8.5L18.5 5.5M8.5 8.5L5.5 5.5M15.5 15.5L18.5 18.5M8.5 15.5L5.5 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-60"
      />
      
      {/* Outer Nodes */}
      <circle cx="12" cy="4" r="1.5" fill="currentColor" className="opacity-80"/>
      <circle cx="12" cy="20" r="1.5" fill="currentColor" className="opacity-80"/>
      <circle cx="4" cy="12" r="1.5" fill="currentColor" className="opacity-80"/>
      <circle cx="20" cy="12" r="1.5" fill="currentColor" className="opacity-80"/>
      
      {/* Corner Nodes */}
      <circle cx="18.5" cy="5.5" r="1" fill="currentColor" className="opacity-70"/>
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" className="opacity-70"/>
      <circle cx="18.5" cy="18.5" r="1" fill="currentColor" className="opacity-70"/>
      <circle cx="5.5" cy="18.5" r="1" fill="currentColor" className="opacity-70"/>
      
      {/* Sparkle Effects */}
      <path
        d="M7 3L7.5 4.5L9 4L7.5 3.5Z"
        fill="currentColor"
        className="opacity-60"
      />
      <path
        d="M17 21L17.5 22.5L19 22L17.5 21.5Z"
        fill="currentColor"
        className="opacity-60"
      />
      <path
        d="M3 17L3.5 18.5L5 18L3.5 17.5Z"
        fill="currentColor"
        className="opacity-60"
      />
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

  // Determine background image based on location prop
  const getBackgroundImage = () => {
    if (!location) return "/assets/Backdrops/Earth.png"; // Default image
    
    // Map location strings to background images
    const locationBackgrounds: { [key: string]: string } = {
      'earth': "/assets/Backdrops/Earth.png",
      'mars': "/assets/Backdrops/Mars.png",
      'moon': "/assets/Backdrops/Moon.png",
      'space': "/assets/Backdrops/Space.png",
      'jupiter': "/assets/Backdrops/Jupiter.png",
      'saturn': "/assets/Backdrops/Saturn.png",
      'nebula': "/assets/Backdrops/Nebula.png",
      'galaxy': "/assets/Backdrops/Galaxy.png",
    };
    
    return locationBackgrounds[location.toLowerCase()] || "/assets/Backdrops/Earth.png";
  };

  return (
    <Card className="relative w-full h-48 sm:h-56 md:h-64 overflow-visible rounded-lg border-chart-4/30 bg-card">
      <img
        src={getBackgroundImage()}
        alt={location ? `${location} backdrop` : "Earth"}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent via-card/20 flex items-end p-3 sm:p-4 md:p-6">
        <div className="flex flex-row items-end justify-between w-full gap-3 sm:gap-4">
          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <AvatarGenerator author={session?.user.id || ""} />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
              {profile?.username || "USERNAME"}
            </h2>
          </div>
          
          {/* Deployment status */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Stardust Balance */}
            <div className="flex items-center gap-2 text-xs">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">✨</span>
                  <TotalPoints onPointsUpdate={setStardustPoints} />
                  <span className="text-muted-foreground">stardust</span>
                </div>
                <div className="text-muted-foreground">
                  Earned through contributions
                </div>
              </div>
              <Link 
                href="/research" 
                className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 flex items-center gap-1 transition-colors font-bold bg-blue-100 px-2 py-1 rounded-lg shadow-md hover:bg-blue-200"
              >
                <TechTreeIcon size={14} />
                <span>Upgrades</span>
              </Link>
            </div>
            
            <div className="text-xs uppercase tracking-wide text-muted-foreground hidden sm:block">
              Deployment Status
            </div>
            
            {/* Deployment Success Message */}
            {deploymentMessage && (
              <div className={`p-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-xs font-medium transition-all duration-500 ${isAnimating ? 'animate-bounce' : ''}`}>
                {deploymentMessage}
              </div>
            )}
            
            <div className="flex gap-2 sm:gap-3">
              {/* Telescope Status */}
              <Link 
                href="/structures/telescope"
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-0"
              >
                <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount)}`}>
                  <TelescopeIcon 
                    deployed={deploymentStatus.telescope.deployed} 
                    hasDiscoveries={deploymentStatus.telescope.unclassifiedCount > 0} 
                  />
                </div>
                <div className="text-center min-w-0">
                  <span className="text-xs font-medium group-hover:text-foreground transition-colors block truncate">
                    Telescope
                  </span>
                  <span className={`text-xs ${getStatusColor(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount)} transition-colors block truncate hidden sm:block`}>
                    {getStatusLabel(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount, "telescope")}
                  </span>
                </div>
              </Link>

              {/* Satellite Status - Only show if available */}
              {deploymentStatus.satellites.available && (
                <button
                  onClick={() => setShowPlanetSelector(true)}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-0"
                >
                  <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount)}`}>
                    <SatelliteIcon 
                      deployed={deploymentStatus.satellites.deployed} 
                      hasDiscoveries={deploymentStatus.satellites.unclassifiedCount > 0} 
                    />
                  </div>
                  <div className="text-center min-w-0">
                    <span className="text-xs font-medium group-hover:text-foreground transition-colors block truncate">
                      Satellites
                    </span>
                    <span className={`text-xs ${getStatusColor(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount)} transition-colors block truncate hidden sm:block`}>
                      {getStatusLabel(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount, "satellites")}
                    </span>
                  </div>
                </button>
              )}

              {/* Rover Status */}
              <Link 
                href="/viewports/roover"
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-0"
              >
                <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.rover.deployed, deploymentStatus.rover.unclassifiedCount)}`}>
                  <RoverIcon 
                    deployed={deploymentStatus.rover.deployed} 
                    hasDiscoveries={deploymentStatus.rover.unclassifiedCount > 0} 
                  />
                </div>
                <div className="text-center min-w-0">
                  <span className="text-xs font-medium group-hover:text-foreground transition-colors block truncate">
                    Rover
                  </span>
                  <span className={`text-xs ${getStatusColor(deploymentStatus.rover.deployed, deploymentStatus.rover.unclassifiedCount)} transition-colors block truncate hidden sm:block`}>
                    {getStatusLabel(deploymentStatus.rover.deployed, deploymentStatus.rover.unclassifiedCount, "rover")}
                  </span>
                </div>
              </Link>
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
                <p className="text-xs">Complete a planet classification to unlock satellites</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};