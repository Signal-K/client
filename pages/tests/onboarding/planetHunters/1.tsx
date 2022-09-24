import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Instructions from "../../../../components/onboarding/LightKurve/transitMethod";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";
import { useEffect, useState } from "react";

export default function PlanetHuntersOnboardingPage1 () {
    const percent = 23; // Assuming credits is a value in percentage
    const buffer = 2; // Assuming buffer is a value in percentage
    const credits = 10;
    const currentPage = 1
    const breakpoint = 800;

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < breakpoint;

    useEffect(() => {
        const handleResize = () => {
          setWindowWidth(window.innerWidth);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return (<CoreLayout>
        <div style={{ display: 'flex' }}>
            <div style={{ width: isMobile ? '100%' : `${100 - credits - buffer}%`, paddingRight: isMobile ? 0 : `${buffer}%` }}>
                <Instructions />
            </div>
            <div style={{ width: `${percent}%` }}>
                <ProgressSidebar credits={credits} currentPage={currentPage} />
            </div>
        </div></CoreLayout>
    );
};