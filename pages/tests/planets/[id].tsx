import PlanetPage from "../planet.jsx";
import React from "react";
import { useRouter } from "next/router";

export default function PlanetId () {
    const router = useRouter();
    const { id } = router.query;

    if (!id) {
        return null;
    }

    return <PlanetPage id={id as string} />;
}