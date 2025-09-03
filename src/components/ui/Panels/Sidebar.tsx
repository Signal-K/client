"use client"

import type React from "react"
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
}

interface Notification {
  id: string
  type: "discovery" | "orbit" | "deployment" | "alert"
  message: string
  link?: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
}

export function SectionSidebar() {
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
    { name: "Settings", icon: Settings, href: "/settings", color: "text-accent" },
    { name: "Research", icon: Search, href: "/research", color: "text-primary" },
    { name: "Inventory", icon: Package, href: "/inventory/classifications", color: "text-secondary" },
    { name: "Feed", icon: Rss, href: "/feed", color: "text-chart-1" },
  ]

  const toolStatuses: ToolStatus[] = [
    {
      name: "Telescope",
      icon: Telescope,
      status: "deployed",
      location: "Kepler-442b",
      color: "text-primary",
    },
    {
      name: "Satellite",
      icon: Satellite,
      status: "deployed",
      location: "Mars Orbit",
      color: "text-secondary",
    },
    {
      name: "Rover",
      icon: Car,
      status: "undeployed",
      color: "text-muted-foreground",
    },
  ]

  const notifications: Notification[] = [
    {
      id: "1",
      type: "discovery",
      message: "Satellite has discovered: Exoplanet K2-18b",
      link: "/discoveries/k2-18b",
      timestamp: "2 min ago",
      icon: Satellite,
    },
    {
      id: "2",
      type: "orbit",
      message: "Satellite is orbiting: Mars",
      timestamp: "15 min ago",
      icon: MapPin,
    },
    {
      id: "3",
      type: "deployment",
      message: "Telescope has been deployed, wait approx. 3h for next discovery",
      timestamp: "1h ago",
      icon: Clock,
    },
    {
      id: "4",
      type: "alert",
      message: "Rover maintenance required",
      timestamp: "2h ago",
      icon: Car,
    },
  ]

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
        {!isCollapsed && (
          <h2 className="text-lg font-mono font-semibold text-foreground">MISSION CONTROL</h2>
        )}
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
              <Button
                key={item.name}
                variant="ghost"
                className={cn("w-full justify-start h-10 font-mono hover:bg-accent/20", isCollapsed ? "px-2" : "px-3")}
              >
                <item.icon className={cn("h-4 w-4", item.color)} />
                {!isCollapsed && <span className="ml-3 text-sm">{item.name}</span>}
              </Button>
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
                <span className="text-xs">{notifications.length}</span>
              </Badge>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <Card key={notification.id} className="bg-card/30 border-border/20 hover:bg-card/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <notification.icon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">
                          {notification.message}
                          {notification.link && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 ml-1 text-xs text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground font-mono">{notification.timestamp}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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