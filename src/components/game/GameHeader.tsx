"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Bell, User, UserX, Zap, Sparkles, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import ConvertAnonymousAccount from "@/src/components/profile/auth/ConvertAnonymousAccount";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { useUserPreferences, ProjectType } from "@/src/hooks/useUserPreferences";
import Link from "next/link";
import { cn } from "@/src/shared/utils";

interface GameHeaderProps {
  stardust?: number;
  hasNotifications?: boolean;
  onNotificationsClick?: () => void;
  className?: string;
}

export default function GameHeader({
  stardust = 0,
  hasNotifications = false,
  onNotificationsClick,
  className,
}: GameHeaderProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [projectPreferencesOpen, setProjectPreferencesOpen] = useState(false);
  const { preferences, savePreferences } = useUserPreferences();

  const isAnonymousUser = session?.user?.is_anonymous;

  const handleProjectPreferencesSave = (interests: ProjectType[]) => {
    savePreferences({ projectInterests: interests });
  };

  const handleLogout = async () => {
    // Clear all browser storage before signing out
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
      // Remove all cookies
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="hidden sm:block text-lg font-bold text-foreground">
              Star Sailors
            </span>
          </Link>

          {/* Center - Stardust count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">
              {stardust.toLocaleString()}
            </span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-full hover:bg-card/50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-card/50 transition-colors">
                  {isAnonymousUser ? (
                    <UserX className="w-5 h-5 text-amber-500" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {isAnonymousUser ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-400/50 bg-amber-500/10 text-amber-500">
                        <Zap className="w-3 h-3 mr-1" />
                        Guest
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm">{session?.user?.email || "User"}</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isAnonymousUser && (
                  <DropdownMenuItem onClick={() => setShowUpgradeModal(true)}>
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Account
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/research">Research</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboards">Leaderboards</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectPreferencesOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Project Preferences
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Upgrade modal for anonymous users */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Account</DialogTitle>
          </DialogHeader>
          <ConvertAnonymousAccount onSuccess={() => setShowUpgradeModal(false)} />
        </DialogContent>
      </Dialog>

      <ProjectPreferencesModal 
        isOpen={projectPreferencesOpen}
        onClose={() => setProjectPreferencesOpen(false)}
        onSave={handleProjectPreferencesSave}
        initialInterests={preferences?.projectInterests}
      />
    </>
  );
}
