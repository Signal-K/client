"use client"
import TotalPoints from "@/src/components/deployment/missions/structures/Stardust/Total";

import type React from "react"
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import {
  Settings,
  Search,
  Package,
  Rss,
  Telescope,
  Satellite,
  Car,
  Bell,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/src/shared/utils"

interface ToolStatus {
  name: string
  icon: React.ComponentType<{ className?: string }>
  status: "undeployed" | "deployed"
  location?: string
  color: string
  deployUrl?: string
}

interface Notification {
  id: string
  type: "discovery" | "orbit" | "deployment" | "alert"
  message: string
  link?: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
}


// SVG icons for each tool
const SunspotIcon = (props: any) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <circle cx="10" cy="10" r="7" fill="#FFD700" stroke="#F59E42" strokeWidth="2" />
    <circle cx="10" cy="10" r="3" fill="#F59E42" />
    <g stroke="#FFD700" strokeWidth="1.5">
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="10" y1="16" x2="10" y2="19" />
      <line x1="1" y1="10" x2="4" y2="10" />
      <line x1="16" y1="10" x2="19" y2="10" />
      <line x1="4" y1="4" x2="6" y2="6" />
      <line x1="16" y1="16" x2="14" y2="14" />
      <line x1="4" y1="16" x2="6" y2="14" />
      <line x1="16" y1="4" x2="14" y2="6" />
    </g>
  </svg>
);

export default function Sidebar() {

// Supabase session and client
  // Supabase session and client
  const supabase = useSupabaseClient();
  const session = useSession();
  // Tool deployment state
  const [toolDeployment, setToolDeployment] = useState({
    Satellite: false,
    Telescope: false,
    Rover: false,
    Sunspot: false,
  });
  // Sidebar notifications based on linked_anomalies
  type AutomatonNotification = {
    id: string;
    type: "discovery" | "orbit" | "deployment" | "alert";
    message: string;
    link?: string;
    timestamp: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  const [automatonNotifications, setAutomatonNotifications] = useState<AutomatonNotification[]>([]);
  useEffect(() => {
    async function fetchNotifications() {
      if (!session?.user?.id) {
        setAutomatonNotifications([]);
        return;
      }
      const { data, error } = await supabase
        .from("linked_anomalies")
        .select("id, automaton, anomaly_id")
        .eq("author", session.user.id);
      if (error || !Array.isArray(data)) {
        setAutomatonNotifications([]);
        return;
      }
      // Group by automaton
      const grouped: Record<string, any[]> = {};
      data.forEach((row) => {
        if (!grouped[row.automaton]) grouped[row.automaton] = [];
        grouped[row.automaton].push(row);
      });
      // Update toolDeployment state based on presence in linked_anomalies
      setToolDeployment({
        Satellite: !!grouped["Satellite"] || !!grouped["WeatherSatellite"],
        Telescope: !!grouped["Telescope"],
        Rover: !!grouped["Rover"],
        Sunspot: !!grouped["TelescopeSolar"],
      });
      // Build notifications
      const automatonMap: Record<string, { name: string; section: string; icon: React.ComponentType<{ className?: string }> }> = {
        WeatherSatellite: {
          name: "Weather Satellite",
          section: "Satellite Viewport",
          icon: Satellite,
        },
        Satellite: {
          name: "Satellite",
          section: "Satellite Viewport",
          icon: Satellite,
        },
        Telescope: {
          name: "Telescope",
          section: "Telescope Interface",
          icon: Telescope,
        },
        Rover: {
          name: "Rover",
          section: "Rover Viewport",
          icon: Car,
        },
        TelescopeSolar: {
          name: "Sunspot Telescope",
          section: "Solar Observatory",
          icon: SunspotIcon,
        },
      };
      const notifications: AutomatonNotification[] = Object.entries(grouped).map(([automaton, anomalies]) => {
        const info = automatonMap[automaton] || { name: automaton, section: "Unknown Section", icon: Package };
        const sorted = [...anomalies].sort((a, b) => (b.id || 0) - (a.id || 0));
        let message = "";
        if (automaton === "TelescopeSolar") {
          message = `The Sunspot Telescope has identified ${sorted.length} sunspot${sorted.length === 1 ? "" : "s"}.`;
        } else if (automaton === "Satellite" || automaton === "WeatherSatellite") {
          const latest = sorted[0];
          message = `Satellite is currently deployed and has found anomaly ID: ${latest?.anomaly_id || "?"}. (${sorted.length} total)`;
        } else if (automaton === "Telescope") {
          const latest = sorted[0];
          message = `Telescope has detected anomaly ID: ${latest?.anomaly_id || "?"}. (${sorted.length} total)`;
        } else if (automaton === "Rover") {
          const latest = sorted[0];
          message = `Rover has discovered anomaly ID: ${latest?.anomaly_id || "?"}. (${sorted.length} total)`;
        } else {
          message = `${info.name} is active in the ${info.section}. (${sorted.length} anomaly${sorted.length === 1 ? "" : "ies"})`;
        }
        return {
          id: String(sorted[0]?.id || automaton),
          type: "deployment" as const,
          message,
          timestamp: "Active now",
          icon: info.icon,
        };
      });
      setAutomatonNotifications(notifications.length > 0 ? notifications : [
        {
          id: "none",
          type: "deployment",
          message: "No deployments or discoveries yet. Deploy an automaton to begin your mission!",
          timestamp: "",
          icon: Bell,
        },
      ]);
    }
    fetchNotifications();
  }, [session, supabase]);
  // Responsive: minimised by default on mobile/small desktop
  const getDefaultCollapsed = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024; // minimised by default on <lg screens
    }
    return false;
  };
  const [isCollapsed, setIsCollapsed] = useState(getDefaultCollapsed());
  // Dispatch custom event on collapse/expand
  useEffect(() => {
    // Only dispatch event on client
    if (typeof window !== "undefined") {
      const event = new CustomEvent("sidebar:collapse", { detail: { collapsed: isCollapsed } });
      window.dispatchEvent(event);
    }
  }, [isCollapsed]);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const navigationItems = [
    // { name: "Settings", icon: Settings, href: "/settings", color: "text-accent" },
    { name: "Research", icon: Search, href: "/research", color: "text-primary" },
    { name: "Inventory", icon: Package, href: "/inventory/classifications", color: "text-secondary" },
    // { name: "Feed", icon: Rss, href: "/feed", color: "text-chart-1" }
  ];
  const Link = require("next/link").default;
  // ...existing code...
// ...existing code...

  const toolStatuses: ToolStatus[] = [
    {
      name: "Satellite",
      icon: Satellite,
      status: toolDeployment.Satellite ? "deployed" : "undeployed",
      color: toolDeployment.Satellite ? "text-secondary" : "text-muted-foreground",
      deployUrl: "/viewports/satellite",
    },
    {
      name: "Telescope",
      icon: Telescope,
      status: toolDeployment.Telescope ? "deployed" : "undeployed",
      color: toolDeployment.Telescope ? "text-primary" : "text-muted-foreground",
      deployUrl: "/structures/telescope",
    },
    {
      name: "Rover",
      icon: Car,
      status: toolDeployment.Rover ? "deployed" : "undeployed",
      color: toolDeployment.Rover ? "text-primary" : "text-muted-foreground",
      deployUrl: "/viewports/roover",
    },
    {
      name: "Sunspot Telescope",
      icon: SunspotIcon,
      status: toolDeployment.Sunspot ? "deployed" : "undeployed",
      color: toolDeployment.Sunspot ? "text-yellow-500" : "text-muted-foreground",
      deployUrl: "/viewports/solar",
    },
  ];

  // Notifications now come from automatonNotifications

  // Detect screen size for mobile overlay
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  // Sidebar width
  const sidebarWidth = isCollapsed ? "w-16" : "w-80";

  // Overlay logic for mobile
  const sidebarClass = cn(
    "h-screen bg-card/95 backdrop-blur-sm border-r border-border/50 transition-all duration-300 flex flex-col z-40",
    sidebarWidth,
    isMobile && isExpandedMobile ? "fixed left-0 top-0 w-full max-w-full" : ""
  );

  // Height of MainHeader (from MainHeader.tsx: py-3, px-4/lg:px-6, font size, etc.)
  // Empirically, MainHeader is about 60px tall. Add mt-[60px] to sidebar root.
  return (
    <div className={cn(sidebarClass, "mt-[60px]")}> 
      {/* Header with Minimise/Expand Button and Mission Control text */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border/50 bg-card/95 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <h2 className="text-lg font-mono font-semibold text-foreground">MISSION CONTROL</h2>
          )}
          {/* Stardust display */}
          {!isCollapsed && (
            <div className="ml-4 flex items-center gap-1 px-3 py-1 rounded-lg bg-[#232a36]/80">
              <span className="text-xs font-mono text-[#4cc9f0]">Stardust:</span>
              <span className="font-bold text-[#4cc9f0] text-base">
                <TotalPoints />
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Minimise sidebar"}
          className="h-8 w-8 p-0 hover:bg-accent/20"
          onClick={() => {
            if (isMobile) {
              setIsExpandedMobile(!isExpandedMobile);
              setIsCollapsed(!isExpandedMobile);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

  <div className="flex-1 overflow-y-auto">
        {/* Navigation Links */}
        <div className="p-4">
          {!isCollapsed && (
            <h3 className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Navigation
            </h3>
          )}
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link href={item.href} key={item.name} passHref legacyBehavior>
                <span>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start h-10 font-mono hover:bg-accent/20", isCollapsed ? "px-2" : "px-3")}
                  >
                    <item.icon className={cn("h-4 w-4", item.color)} />
                    {!isCollapsed && <span className="ml-3 text-sm">{item.name}</span>}
                  </Button>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="mx-4 bg-border/50" />

        {/* Tool Status */}
        <div className="p-4">
          {!isCollapsed && (
            <h3 className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Tool Status
            </h3>
          )}
          <div className="space-y-3">
            {toolStatuses.map((tool) => (
              <Card key={tool.name} className="bg-card/50 border-border/30">
                <CardContent className={cn("p-3", isCollapsed && "p-2")}> 
                  <div className="flex items-center gap-3">
                    <tool.icon className={cn("h-4 w-4 flex-shrink-0", tool.color)} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-medium">{tool.name}</span>
                          <Badge
                            variant={tool.status === "deployed" ? "default" : "secondary"}
                            className="text-xs font-mono"
                          >
                            {tool.status}
                          </Badge>
                        </div>
                        {/* Deploy link if undeployed */}
                        {tool.status === "undeployed" && (
                          <div className="mt-2">
                            <Link href={tool.deployUrl} passHref legacyBehavior>
                              <Button variant="outline" size="sm" className="font-mono text-xs w-full">
                                Deploy {tool.name}
                              </Button>
                            </Link>
                          </div>
                        )}
                        {tool.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">{tool.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="mx-4 bg-border/50" />

        {/* Notifications */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {!isCollapsed && (
              <h3 className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                Notifications
              </h3>
            )}
          </div>

          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                <span className="text-xs">{automatonNotifications.length}</span>
              </Badge>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {automatonNotifications.length === 0 ? (
                <div className="text-xs text-muted-foreground font-mono px-2 py-1">No deployments or discoveries yet. Deploy an automaton to begin your mission!</div>
              ) : (
                automatonNotifications.map((notification) => (
                  <Card key={notification.id} className="bg-card/30 border-border/20 hover:bg-card/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <notification.icon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.timestamp && (
                            <span className="text-xs text-muted-foreground font-mono">{notification.timestamp}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-mono">DEEP SPACE OPERATIONS</p>
            <p className="text-xs text-muted-foreground/60 font-mono">SECTOR: ALPHA-7</p>
          </div>
        )}
      </div>
    </div>
  )
}