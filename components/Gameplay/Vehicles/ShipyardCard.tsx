import React, { useEffect, useState } from "react";
import Link from "next/link";

import Layout from "../../Layout";
import CoreLayout from "../../Core/Layout";
import PostCard from "../../PostCard";
import Card from "../../Card";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../../context/UserContext";
import { Database } from "../../../utils/database.types";
import PlanetEditor from "../../../pages/generator/planet-editor";

type Spaceships = Database['public']['Tables']['spaceships']['Row'];

export default function ShipyardCard ( { image, name, shipId, hp, attack, speed, location, owner } ) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [ship, setShip] = useState(null)

    const [loading, setLoading] = useState(null);

    useEffect(() => {
        getShips();
    }, [session]);

    async function getShips () {

    }

    return (
        <>
            <Card noPadding={false}>
                <div className="flex gap-3">
                    <div className="grow">
                        <p className="my-3 text-sm">Name: {name}</p>
                        <p className="my-3 text-sm">Defence: {hp}</p>
                        <p className="my-3 text-sm">Attack: {attack}</p>
                        <p className="my-3 text-sm">Speed: {speed}</p>
                        <p className="buttonColour my-3 text-sm">Location: {location}</p>
                    </div>
                    <div className="flex gap-4 rounded-md overflow-hidden">
                        <img src={image} />
                    </div>
                </div>
                <div className="grow text-right">
                    <button className="bg-buttonColour text-white px-6 py-1 rounded-md">Buy ship</button> {/* If there is an owner, don't show this button */}
                </div>
            </Card>
            {/*<CoreLayout>
                <Layout hideNavigation={true}>
                    <Card noPadding={false}>This page will display all the ships</Card>
                    <Card noPadding={false}>
                        <div className="flex gap-3">
                            <div className="grow">
                                <p><Link href={'/posts/ship' + ship}>
                                    <span className="mr-1 font-semibold cursor-pointer hover:underline">Spaceship Name</span>
                                </Link></p>
                            </div>
                        </div>
                    </Card>
                </Layout>
            </CoreLayout>*/}
        </>
    )
}