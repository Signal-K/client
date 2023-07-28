import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CoreLayout from "../../../../components/Core/Layout";
import ExoPlanetDetective from "../../../../components/onboarding/LightKurve/_Introduction";
import LightkurveQuiz from "../../../../components/onboarding/LightKurve/_Quiz1";
import OnboardingPopup from "../../../../components/onboarding/blocks/gamification/popup";

const Instructions = dynamic(() =>
  import("../../../../components/onboarding/LightKurve/transitMethod")
);
const ProgressSidebar = dynamic(() =>
  import("../../../../components/onboarding/blocks/ProgressSidebar")
);

export default function PlanetHuntersOnboardingPage1() {
  const percent = 23; // Assuming credits is a value in percentage
  const buffer = 2; // Assuming buffer is a value in percentage
  const credits = 10;
  const currentPage = 1;
  const breakpoint = 800;

  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = windowWidth < breakpoint;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <CoreLayout>
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: isMobile ? "100%" : `${100 - credits - buffer}%`,
            paddingRight: isMobile ? 0 : `${buffer}%`,
          }}
        >
          <OnboardingPopup
            imageSrc="https://cdn-icons-png.flaticon.com/512/2991/2991566.png"
            message="In order to complete your training, you will be given the Golden Telescope, which allows you to view planets!"
          />
          <ExoPlanetDetective />
        </div>
        <div style={{ width: `${percent}%` }}>
          <ProgressSidebar credits={credits} currentPage={currentPage} />
        </div>
      </div>
    </CoreLayout>
  );
}