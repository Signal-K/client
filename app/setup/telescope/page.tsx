"use client";

import { useRouter } from "next/navigation";
import GameNavbar from "@/src/components/layout/Tes";
import TelescopeSection from "@/src/components/scenes/deploy/Telescope/TelescopeSection";
import TutorialWrapper, { TELESCOPE_INTRO_STEPS } from "@/src/components/onboarding/TutorialWrapper";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function TelescopeSetupPage() {
  const router = useRouter();
  const { isDark } = UseDarkMode();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full z-50 flex-shrink-0">
        <GameNavbar />
      </div>

      <div className="flex-1 z-10 min-h-0 pt-12">
        <TutorialWrapper
          tutorialId="telescope-deploy"
          steps={TELESCOPE_INTRO_STEPS}
          title="Telescope Setup"
          onComplete={() => {
            console.log("Telescope tutorial completed");
          }}
        >
          <TelescopeSection />
        </TutorialWrapper>
      </div>
    </div>
  );
}