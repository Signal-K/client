"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import { Card } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import Link from "next/link";
import TelescopeIcon from "@/src/components/icons/TelescopeIcon";
import SatelliteIcon from "@/src/components/icons/SatelliteIcon";
import RoverIcon from "@/src/components/icons/RoverIcon";
import StardustBalance from "@/src/components/stardust/StardustBalance";
import PlanetSelectorModal from "@/src/components/modals/PlanetSelectorModal";
import useDeploymentStatus from "@/src/hooks/useDeploymentStatus";
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar";
import SpannerIcon from "@/src/components/icons/SpannerIcon";
import { hasUpgrade } from "@/src/utils/userUpgrades";

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
  const [deploymentMessage, setDeploymentMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [stardustPoints, setStardustPoints] = useState<number>(0);
  const [showPlanetSelector, setShowPlanetSelector] = useState(false);
  const [classificationsCount, setClassificationsCount] = useState<number>(0);
  const [availableUpgrades, setAvailableUpgrades] = useState<number>(0);
  const [bothUpgradesUnlocked, setBothUpgradesUnlocked] = useState<boolean>(false);

  // Close planet selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDetailsModal) {
        const target = event.target as Element;
        if (!target.closest('.planet-selector-container')) {
          setShowDetailsModal(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetailsModal]);

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

      // Get total classifications count
      const { data: classifications, error: classError } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id);
      
      if (!classError && classifications) {
        setClassificationsCount(classifications.length);
      }

      // Get researched upgrades to calculate available upgrades
      const hasTelescopeUpgrade = await hasUpgrade(supabase, session.user.id, "probereceptors");
      const hasSatelliteUpgrade = await hasUpgrade(supabase, session.user.id, "satellitecount");
      
      setBothUpgradesUnlocked(hasTelescopeUpgrade && hasSatelliteUpgrade);
      
      let upgradeCount = 0;
      if (!hasTelescopeUpgrade) upgradeCount++;
      if (!hasSatelliteUpgrade) upgradeCount++;
      
      // If both upgrades are unlocked, show projects instead
      if (hasTelescopeUpgrade && hasSatelliteUpgrade) {
        upgradeCount = 1; // Show projects notification
      }
      
      setAvailableUpgrades(upgradeCount);
    };

    fetchData();
  }, [session, supabase]);

  const { deploymentStatus, planetTargets } = useDeploymentStatus();

  const handleSendSatellite = async (planetId: number, planetName: string) => {
    if (!session) return;

    try {
      const response = await fetch("/api/gameplay/deploy/satellite/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planetClassificationId: planetId }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("Error deploying satellite:", payload?.error || response.statusText);
        return;
      }

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
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 2000);

    } catch (error) {
      console.error("Error deploying satellite:", error);
    }
  };

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

  const displayName = profile?.username || (session?.user?.is_anonymous ? "Guest Account" : session?.user?.email) || "User";

  // Determine background image based on location prop
  const getBackgroundImage = (location?: string) => {
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
    
    return locationBackgrounds[location?.toLowerCase() || 'earth'] || "/assets/Backdrops/Earth.png";
  };

  return (
    <Card className="relative w-full h-48 sm:h-56 md:h-64 overflow-visible rounded-lg border-chart-4/30 bg-card">
      <img
        src={getBackgroundImage(location)}
        alt={location ? `${location} backdrop` : "Earth"}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent via-card/20 flex items-end p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-2 sm:gap-4">
          {/* User info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <AvatarGenerator author={session?.user.id || ""} />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">
              {displayName}
            </h2>
          </div>
          
          {/* Deployment status */}
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {/* Stardust Balance and Upgrades Row */}
            <div className="flex items-center justify-end gap-2 w-full">
              <StardustBalance onPointsUpdate={setStardustPoints} />
              
              {/* Upgrades Section - Only show if user has more than 2 classifications */}
              {classificationsCount > 2 && availableUpgrades > 0 && (
                <Link
                  href="/research"
                  aria-label={bothUpgradesUnlocked ? "View research projects" : "View available upgrades"}
                  className="group flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-200/20 px-2.5 py-1.5 text-xs font-medium text-amber-900 shadow-sm transition-all hover:border-amber-400/60 hover:bg-amber-200/30 hover:-translate-y-0.5 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100"
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/50 text-amber-900 transition-colors group-hover:bg-amber-300/70 dark:bg-amber-900/40 dark:group-hover:bg-amber-900/60">
                    <SpannerIcon />
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {availableUpgrades}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col text-left leading-tight text-amber-900 dark:text-amber-100">
                    <span className="text-[11px] font-semibold tracking-wide uppercase">
                      {bothUpgradesUnlocked ? "Projects" : "Research"}
                    </span>
                    <span className="text-[10px] font-normal text-amber-800/80 transition-colors group-hover:text-amber-900 dark:text-amber-200/80 dark:group-hover:text-amber-100">
                      {bothUpgradesUnlocked ? "New expeditions available" : `${availableUpgrades} upgrade${availableUpgrades > 1 ? "s" : ""} ready`}
                    </span>
                  </div>
                  <span className="ml-auto hidden text-[11px] font-semibold uppercase tracking-wide text-amber-800/90 transition-colors group-hover:text-amber-900 dark:text-amber-200/90 sm:inline">
                    Go
                  </span>
                </Link>
              )}
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
            
            <div className="flex gap-1.5 sm:gap-3 justify-end w-full">
              {/* Telescope Status */}
              <Link 
                href="/structures/telescope"
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-[60px] max-w-[80px] sm:min-w-0 sm:max-w-none"
              >
                <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.telescope.deployed, deploymentStatus.telescope.unclassifiedCount)}`}>
                  <TelescopeIcon 
                    deployed={deploymentStatus.telescope.deployed} 
                    hasDiscoveries={deploymentStatus.telescope.unclassifiedCount > 0} 
                  />
                </div>
                <div className="text-center w-full">
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
                  className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-[60px] max-w-[80px] sm:min-w-0 sm:max-w-none"
                >
                  <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.satellites.deployed, deploymentStatus.satellites.unclassifiedCount)}`}>
                    <SatelliteIcon 
                      deployed={deploymentStatus.satellites.deployed} 
                      hasDiscoveries={deploymentStatus.satellites.unclassifiedCount > 0} 
                    />
                  </div>
                  <div className="text-center w-full">
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
                className="flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-lg hover:bg-card/20 transition-colors group min-w-[60px] max-w-[80px] sm:min-w-0 sm:max-w-none"
              >
                <div className={`p-1 sm:p-1.5 rounded-full transition-colors ${getIconBackgroundColor(deploymentStatus.rover.deployed, deploymentStatus.rover.unclassifiedCount)}`}>
                  <RoverIcon 
                    deployed={deploymentStatus.rover.deployed} 
                    hasDiscoveries={deploymentStatus.rover.unclassifiedCount > 0} 
                  />
                </div>
                <div className="text-center w-full">
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
      <PlanetSelectorModal
        open={showPlanetSelector}
        onOpenChange={setShowPlanetSelector}
        planetTargets={planetTargets}
        onSelectPlanet={handleSendSatellite}
      />
    </Card>
  );
};
