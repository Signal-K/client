"use client";

import { useRouter } from "next/navigation";
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";
import TutorialWrapper, { SATELLITE_INTRO_STEPS } from "@/src/components/onboarding/TutorialWrapper";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function SatelliteSetupPage() {
  const router = useRouter();
  const { isDark } = UseDarkMode();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full z-50 flex-shrink-0">
        <GameNavbar />
      </div>

      <div className="flex-1 z-10 min-h-0 overflow-hidden pt-12">
        <TutorialWrapper
          tutorialId="satellite-deploy"
          steps={SATELLITE_INTRO_STEPS}
          title="Satellite Setup"
          onComplete={() => {
            console.log("Satellite tutorial completed");
          }}
        >
          <DeploySatelliteViewport />
        </TutorialWrapper>
      </div>
    </div>
  );
}