import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Core/Section/Layout";
import BasePlanetSectors from "../../../components/Content/Planets/Base/BasePlanetAllSectors";

export default function PlanetSectors() {
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
        <Layout>
            <div className="h-screen py-10">
                <BasePlanetSectors planetId={id as string} />
            </div>
        </Layout>
    );
};