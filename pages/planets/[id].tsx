import IndividualPlanet from "../../components/Content/Planets/IndividualPlanet";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import IndividualBasePlanet, { IndividualBasePlanetDesktop } from "../../components/Content/Planets/Base/IndividualBasePlanet";
import Layout, { LayoutNoNav } from "../../components/Section/Layout";
import { DesktopSidebar } from "../../components/Section/Sidebar";
import ClassificationFeed from "../../components/Content/ClassificationFeed";

export default function PlanetIdPage () {
    const router = useRouter();
    const { id } = router.query;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
        }
    }, []);

    if (!id) {
        return null;
    };

    if (isMobile) {
        return (
            <LayoutNoNav>
                <IndividualBasePlanet id={id as string} />
            </LayoutNoNav>
        );
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/6 bg-gray-50">
                <DesktopSidebar />
            </div>
            <div className="w-2/6 overflow-y-auto mr-4">
                <IndividualBasePlanetDesktop id={id as string} />
            </div>
            <div className="w-3/6 bg-gray-50 overflow-y-auto">
                <ClassificationFeed />
            </div>
        </div>
      );
};