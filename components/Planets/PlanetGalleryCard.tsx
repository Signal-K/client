import React, { useEffect, useState } from "react";

import Card from "../Card";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetEditor from "../../pages/generator/planet-editor";
import { UserContext } from "../../context/UserContext";
import { Database } from "../../utils/database.types";
import { NextPage } from "next";

type Planets = Database['public']['Tables']['planets']['Row'];
interface Props { planet: any };

export const PlanetGalleryCard: NextPage<Props> = ( props ) => {
    /*const supabase = useSupabaseClient();
    const session = useSession();*/
    const { planet } = props;

    return (
        <>
            <Card noPadding={false}>
                <div className="flex gap-3">
                    <div className="grow">
                        <p className="my-3 text-sm">Name: {planet.name}</p>
                        <p className="my-3 text-sm">Defence: {planet.hp}</p>
                        <p className="my-3 text-sm">Attack: {planet.attack}</p>
                        <p className="my-3 text-sm">Speed: {planet.speed}</p>
                        <p className="buttonColour my-3 text-sm">Location: {planet.location}</p>
                    </div>
                    <div className="flex gap-4 rounded-md overflow-hidden">
                        <img src={planet.image} />
                    </div>
                </div>
                <div className="grow text-right">
                    <button className="bg-buttonColour text-white px-6 py-1 rounded-md">Buy ship</button> {/* If there is an owner, don't show this button */}
                </div>
            </Card>
        </>
    )
}