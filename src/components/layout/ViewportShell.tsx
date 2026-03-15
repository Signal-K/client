"use client";

import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

interface ViewportShellProps {
  children: React.ReactNode;
}

export default function ViewportShell({ children }: ViewportShellProps) {
  const { isDark, toggleDarkMode } = UseDarkMode();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />
      <div className="pt-20 h-screen">
        <div className="h-[calc(100vh-80px)] min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
