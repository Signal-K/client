import IndividualPlanet from "../../components/Content/Planets/IndividualPlanet";
import React from "react";
import { useRouter } from "next/router";

export default function PlanetIdPage () {
    const router = useRouter();
    const { id } = router.query;

    if (!id) {
        return null;
    };

    return <IndividualPlanet id={id as string} />;
}