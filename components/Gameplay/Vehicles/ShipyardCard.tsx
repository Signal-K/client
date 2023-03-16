import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";

import Card from "../../Card";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../../../utils/database.types";

type Spaceships = Database['public']['Tables']['spaceships']['Row'];
interface Props { ship: any };

export default function ShipyardCard ( { id, image, name, shipId, hp, attack, speed, location, owner } ) {
    const supabase = useSupabaseClient();
    const session = useSession();

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
                    <div className="rounded-md overflow-hidden h-48 flex">
                        <img src={image} />
                    </div>
                </div>
                <div className="grow text-right">
                    <button className="bg-buttonColour text-white px-6 py-1 rounded-md">Buy ship</button> {/* If there is an owner, don't show this button */}
                    <div className="mx-1"><Link href={`/ships/${id}`}><button className="bg-buttonColour text-white px-6 py-1 rounded-md">View profile</button></Link></div>
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
    );
};

export const ShipyardCardProps: NextPage<Props> = ( props ) => {
    const { ship } = props;

    return (
        <>
            <Card noPadding={false}>
                <div className="flex gap-3">
                    <div className="grow">
                        <p className="my-3 text-sm">Name: {ship.name}</p>
                        <p className="my-3 text-sm">Defence: {ship.hp}</p>
                        <p className="my-3 text-sm">Attack: {ship.attack}</p>
                        <p className="my-3 text-sm">Speed: {ship.speed}</p>
                        <p className="buttonColour my-3 text-sm">Location: {ship.location}</p>
                    </div>
                    <div className="flex gap-4 rounded-md overflow-hidden">
                        <img src={ship.image} />
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