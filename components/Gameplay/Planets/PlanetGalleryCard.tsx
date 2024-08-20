import React, { useEffect, useState } from "react";

import Card from "../../Card";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetEditor from "../../../pages/generator/planet-editor";
import { UserContext } from "../../../context/UserContext";
import { Database } from "../../../utils/database.types";
import Link from "next/link";

type Planets = Database['public']['Tables']['planets']['Row'];
interface Props { planet: any };

export default function PlanetGalleryCard ( { id, content, radius, userId, ticId, cover } ) {
    // const { planet } = props;

    function buyPlanet () {
        // pass
    }

    return (
        <>
            <div className="width-full mb-3">
                <div className="card w-1000 bg-base-100 shadow-l image-full">
                    <figure><img src={cover} alt="Planet cover image" /></figure>
                    <div className="card-body">
                        <h2 className="card-title">{content}</h2> {/* Planet name */}
                        {/*<p>Radius: {radius}</p>*/}<br /><br /><br /><br /><br /><br />
                        <p>TIC: {ticId}</p>
                        <Link href={`/planets/${id}`}><div className="card-actions justify-end">
                            <button className="btn btn-primary">Explore</button> {/* Land on planet */}
                        </div></Link>
                    </div>
                </div>
            </div>{/*
            <Card noPadding={false}>
                <div className="flex gap-3">
                    <div className="grow">
                        <p className="my-3 text-sm">Name: {content}</p>
                        <p className="my-3 text-sm">Radius: {radius}</p>
                        <p className="my-3 text-sm">TIC: {ticId}</p>
                        <p className="buttonColour my-3 text-sm">ID: {id}</p>
                    </div>
                    <div className="rounded-md overflow-hidden h-48 flex shadow-md">
                        <img src={cover} />
                    </div>
                </div><br />
                <div className="grow text-right flex">
                    <button className="bg-buttonColour text-white px-6 py-1 rounded-md">Buy planet</button>
                    <div className="mx-1"><Link href={`/planets/${id}`}><button className="bg-buttonColour text-white px-6 py-1 rounded-md">View profile</button></Link></div>
                </div>
            </Card>*/}
        </>
    )
}