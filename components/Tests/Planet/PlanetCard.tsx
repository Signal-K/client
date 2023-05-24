import React, { useEffect, useState } from "react";
import Card from "../../Card";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SocialGraphHomeNoSidebar from "../../../pages/posts";

export default function PlanetContent ({ activeTab, planetId }) {
    const supabase = useSupabaseClient();

    const [planetPosts, setPlanetPosts] = useState([]);
    const [planet, setPlanet] = useState(null);

    useEffect(() => {
        if (!planetId) { return; };
        getPlanetData(planetId);
        console.log(planetId);
    })

    async function loadPlanet () {
        //
    }

    async function getPlanetPosts ( planetId ) {
        const { data, error } = await supabase.from('posts_duplicate')
            .select('*')
            .order('created_at', { ascending: false })
            .eq('planets2', planetId)
        return data;

        if (error) {
            console.error(error);
            return [];
        }
    };

    async function getPlanetData ( planetId ) {
        const { data } = await supabase.from('planetsss')
            .select()
            .eq('id', planetId);
        return data[0];
    };

    return (
        <div>
            { planetPosts?.length > 0 && planetPosts.map(planetPost => (
                <SocialGraphHomeNoSidebar key = { planetPost.id } {...planetPost} planets2 = {planetId} />
            ))}
        </div>
    )
}