import MyPlanetPage from "../planet";
import React from "react";
import { useRouter } from "next/router";

export default function MyPlanetId () {
    const router = useRouter();
    const { id } = router.query;

    if (!id) { return null; };

    return <MyPlanetPage id={id as string} />
}