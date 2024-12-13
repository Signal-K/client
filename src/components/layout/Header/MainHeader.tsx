"use client";

import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Bell, Sun, Moon, User, UserPlus, UserX, Zap, LogOut, Sparkles } from "lucide-react";
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
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import RecentActivity from "@/src/components/social/activity/RecentActivity";
import ConvertAnonymousAccount from "@/src/components/profile/auth/ConvertAnonymousAccount";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { useUserPreferences, ProjectType } from "@/src/hooks/useUserPreferences";
import Link from "next/link";

interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface MainHeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  activityFeed: CommentVote[];
  otherClassifications: OtherClassification[];
}

export default function MainHeader({
  isDark,
  onThemeToggle,
  notificationsOpen,
  onToggleNotifications,
  activityFeed,
  otherClassifications,
}: MainHeaderProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [projectPreferencesOpen, setProjectPreferencesOpen] = useState(false);
  const { preferences, savePreferences } = useUserPreferences();
  
  const isAnonymousUser = session?.user?.is_anonymous;

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
  };

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
      // Signed out
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-6 py-3 gap-4 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/"><h1 className="text-xl font-bold text-primary">Star Sailors</h1></Link>
          
          {/* Anonymous User Indicator */}
          {isAnonymousUser && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                onClick={handleUpgradeClick}
              >
                <UserX className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Guest Account</span>
                <span className="sm:hidden">Guest</span>
                <Zap className="w-3 h-3 ml-1" />
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-chart-2" />
            <Switch checked={isDark} onCheckedChange={onThemeToggle} />
            <Moon className="w-4 h-4 text-chart-4" />
          </div>
          <button
            aria-label="Toggle notifications"
            onClick={onToggleNotifications}
            className="relative p-2 rounded-full hover:bg-muted transition"
          >
            <Bell className="w-6 h-6 text-chart-5" />
            {activityFeed.length > 0 && (
              <>
                <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-600" />
              </>
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                {isAnonymousUser ? (
                  <UserX className="w-5 h-5 text-amber-600" />
                ) : (
                  <User className="w-5 h-5 text-chart-3" />
                )}
                <span className="sr-only">Open user menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {isAnonymousUser ? (
                    <>
                      <p className="text-sm font-medium leading-none text-amber-800">Guest User</p>
                      <p className="text-xs leading-none text-muted-foreground">Temporary account</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium leading-none">Your Account</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || "User"}</p>
                    </>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {isAnonymousUser ? (
                <>
                  <DropdownMenuItem 
                    onClick={handleUpgradeClick}
                    className="text-amber-700 focus:text-amber-800 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Save Account (Free!)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    Profile (Limited)
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setProjectPreferencesOpen(true)}
                className="cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Project Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification Panel */}
      {notificationsOpen && (
        <div className="fixed top-[60px] right-4 sm:right-6 w-full sm:w-[420px] max-h-[80vh] overflow-y-auto rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-xl z-40">
          <RecentActivity
            activityFeed={activityFeed}
            otherClassifications={otherClassifications}
            isInsidePanel={true}
          />
        </div>
      )}

      {/* Upgrade Account Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Your Guest Account</DialogTitle>
          </DialogHeader>
          <ConvertAnonymousAccount 
            onSuccess={handleUpgradeSuccess}
            onCancel={() => setShowUpgradeModal(false)}
          />
        </DialogContent>
      </Dialog>

      <ProjectPreferencesModal 
        isOpen={projectPreferencesOpen}
        onClose={() => setProjectPreferencesOpen(false)}
        onSave={handleProjectPreferencesSave}
        initialInterests={preferences?.projectInterests}
      />
    </div>
  );
}
