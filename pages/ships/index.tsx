import React, { useEffect, useState } from "react";

import CoreLayout from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { UserContext } from "../../context/UserContext";
import { Database } from "../../utils/database.types";
import { HELPER_ADDRESS, PLANETS_ADDRESS, MINERALS_ADDRESS, MULTITOOLS_ADDRESS } from "../../constants/contractAddresses";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Login from "../login";
import ShipyardCard, { ShipyardCardProps } from "../../components/Gameplay/Vehicles/ShipyardCard";
// import { Shop } from "../../components/Gameplay/Stake";
TimeAgo.addDefaultLocale(en);

type Spaceships = Database['public']['Tables']['spaceships']['Row']; 

export default function ShipyardIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [ships, setShips] = useState([]);
    
    // const [shipId, setShipId] = useState(null); // Set this all as a ship type later

    useEffect(() => {
        getShips();
    }, [session]);

    const getShips = async () => {
        try {
            const { data, error } = await supabase
                .from('spaceships')
                .select("*")
                .limit(10)
            if (data != null) { setShips(data); };
            if (error) throw error;
        } catch (error: any) { alert(error.message); };
    };

    if (!session) { return <Login />; };

    return (
        <CoreLayout>
            <div className="flex px-10">
                {ships.map(ship => (
                    <div className="mx-4"><ShipyardCard key = { ship.id } {...ship}></ShipyardCard></div>
                ))}
                {/*<div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>*/}
            </div>
            <div className="flex px-10">
                {/*<div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>*/}
            </div>
            {/* <Shop multitoolContract={multitoolContract} /> */}
            {/*<div className="flex px-10">
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
            </div>*/}
        </CoreLayout>
    )
}