"use client";

import { useRouter } from "next/navigation";
import GameNavbar from "@/src/components/layout/Tes";
import SolarHealth from "@/src/components/scenes/deploy/solar/SolarHealth";
import TutorialWrapper, { SOLAR_INTRO_STEPS } from "@/src/components/onboarding/TutorialWrapper";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function SolarSetupPage() {
  const router = useRouter();
  const { isDark } = UseDarkMode();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full z-50 flex-shrink-0">
        <GameNavbar />
      </div>

      <div className="flex-1 z-10 min-h-0 pt-12">
        <TutorialWrapper
          tutorialId="solar-deploy"
          steps={SOLAR_INTRO_STEPS}
          title="Solar Observatory Setup"
          onComplete={() => {
            console.log("Solar observatory tutorial completed");
          }}
        >
          <SolarHealth />
        </TutorialWrapper>
      </div>
    </div>
  );
}