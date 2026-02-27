"use client";

import ProfileSetupForm from "@/src/components/profile/setup/ProfileSetup";
import { useState } from "react";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function AccountPage() {
  const [, setRefresh] = useState(false);
  const { isDark, toggleDarkMode } = UseDarkMode();

  return (
    <div className="min-h-screen w-full relative">
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

      <main className="pt-24 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <ProfileSetupForm
            onProfileUpdate={() => setRefresh((prev) => !prev)}
            embedded
            redirectOnSuccess={false}
          />
        </div>
      </main>
    </div>
  );
};
