import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Section/Layout";

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
        <Layout>
            <div></div>
        </Layout>
    );
};