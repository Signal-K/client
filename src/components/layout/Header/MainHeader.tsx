"use client";

import { Bell, Sun, Moon, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Switch } from "@/src/components/ui/switch";
import RecentActivity from "@/src/components/social/activity/RecentActivity";

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
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-6 py-3 gap-4 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <h1 className="text-xl font-bold text-primary">Star Sailors</h1>
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
              <button className="relative h-8 w-8 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-chart-3" />
                <span className="sr-only">Open user menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                {/* <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Teddy Martin</p>
                  <p className="text-xs leading-none text-muted-foreground">ted@tmartin.com</p>
                </div> */}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
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
    </div>
  );
}
