import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SpareLayout } from "../../../components/_Core/Section/Layout";
import BasePlanetSector from "../../../components/Content/[id]/BasePlanetSector";

export default function SectorPage () {
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

    return (
        <SpareLayout>
            <div className="h-screen py-10">
                <BasePlanetSector sectorid={id as string} />
            </div>
        </SpareLayout>
    ); 
};