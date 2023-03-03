import React, { useEffect, useState } from "react";
import Link from "next/link";

import CoreLayout from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";
import { Database } from "../../utils/database.types";
import { HELPER_ADDRESS, PLANETS_ADDRESS, MINERALS_ADDRESS, MULTITOOLS_ADDRESS } from "../../constants/contractAddresses";
import { ConnectWallet, useAddress, useContract } from "@thirdweb-dev/react";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Login from "../login";
import ShipyardCard from "../../components/Gameplay/Vehicles/ShipyardCard";
import { Shop } from "../../components/Stake";
TimeAgo.addDefaultLocale(en);

type Spaceships = Database['public']['Tables']['spaceships']['Row'];

export default function ShipyardIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [ships, setShips] = useState([]);
    const { contract: multitoolContract } = useContract(MULTITOOLS_ADDRESS, 'edition-drop');
    
    const [shipId, setShipId] = useState(null); // Set this all as a ship type later
    const [shipName, setShipName] = useState(null);
    const [shipImage, setShipImage] = useState(null);
    const [shipOwner, setShipOwner] = useState(null);
    const [shipHp, setShipHp] = useState(null);
    const [shipAttack, setShipAttack] = useState(null);
    const [shipSpeed, setShipSeed] = useState(null);
    const [shipLocaiton, setShipLocation] = useState(null);

    useEffect(() => {
        fetchShips();
    }, [session]);

    async function fetchShips () {
        supabase.from('spaceships')
            .select('id, name, image, hp, attack, speed')
            .order('id', { ascending: true })
            .then( result => { setShips( result.data ); });
    }

    // if (!session) { return <Login />; };

    return (
        <CoreLayout>
            <div className="flex px-10">
                {ships.map(ship => (
                    <ShipyardCard key = { ship.id } {...ship}></ShipyardCard>
                ))}
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
            </div>
            <div className="flex px-10">
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='eagle.png' name='Ludmilla' shipId='1' hp='100' attack='100' speed='100' location='Mars' owner='Gizmotronn'></ShipyardCard></div>
            </div>
            <Shop multitoolContract={multitoolContract} />
            {/*<div className="flex px-10">
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
                <div className="px-2"><ShipyardCard image='1ST FRAME.PNG'></ShipyardCard></div>
            </div>*/}
        </CoreLayout>
    )
}