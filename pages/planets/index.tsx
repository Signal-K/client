import React, { useEffect, useState } from "react";

import CoreLayout from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { UserContext } from "../../context/UserContext";
import { Database } from "../../utils/database.types";

import Login from "../login";
import { PlanetGalleryCard } from "../../components/Planets/PlanetGalleryCard";

type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetGalleryIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [planets, setPlanets] = useState([]);
    
    useEffect(() => {
        getPlanets();
    }, [session]);

    const getPlanets = async () => {
        try {
            const { data, error } = await supabase
            .from('planets')
            .select("*")
            .limit(10)
            console.log(data);
            if (data != null) { setPlanets(data); };
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
        };
    };

    if (!session) { return <Login />; };

    return (
        <CoreLayout>
            <div className="flex px-10">
                {planets.map(ship => (
                    <PlanetGalleryCard key = { ship.id } {...ship}></PlanetGalleryCard>
                ))}
            </div>
        </CoreLayout>
    )
}