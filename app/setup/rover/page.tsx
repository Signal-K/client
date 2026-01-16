"use client";

import { useRouter } from "next/navigation";
import GameNavbar from "@/src/components/layout/Tes";
import RoverSection from "@/src/components/scenes/deploy/Rover/RoverSection";
import TutorialWrapper, { ROVER_INTRO_STEPS } from "@/src/components/onboarding/TutorialWrapper";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function RoverSetupPage() {
  const router = useRouter();
  const { isDark } = UseDarkMode();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full z-50 flex-shrink-0">
        <GameNavbar />
      </div>

      <div className="flex-1 z-10 min-h-0 pt-12">
        <TutorialWrapper
          tutorialId="rover-deploy"
          steps={ROVER_INTRO_STEPS}
          title="Rover Setup"
          onComplete={() => {
            console.log("Rover tutorial completed");
          }}
        >
          <RoverSection />
        </TutorialWrapper>
      </div>
    </div>
  );
}