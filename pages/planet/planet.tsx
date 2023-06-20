import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { UserContextProvider } from "../../context/UserContext";
import { GameplayLayout } from "../../components/Core/Layout";
import Layout from "../../components/Layout";
import Card from "../../components/Card";
import PlanetAvatar from "../../components/Gameplay/Planets/PlanetAvatar";

export default function FreshPlanetPage () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [planet, setPlanet] = useState(null);
    const router = useRouter();
    // const tab = router?.query?.tab?.[0] || 'posts';
    const planetId = router.query.id;

    const [username, setUsername] = useState('');
    const [temperature, setPlanetTemperature] = useState(null); // database types

    function fetchPlanet () {
        supabase.from('planetsss')
            .select()
            .eq('id', planetId)
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); };
            }
        )
    }

    function updatePlanet () { // Stub function -> to be added later (along with planet editor)
        supabase.from('planetsss') // Set these values from the planet editor, then fill planet editor with these values
        .update({
            temperature,
        })
        .eq('id', planetId)
        .then(result => {
            if (!result.error) {
                setPlanet(prev => ({ ...prev, temperature, }));
            }
        })
    }

    return (
        <GameplayLayout>
            <Layout hideNavigation={true}>
                <Card noPadding={true}>
                <div className="relative overflow-hidden rounded-md mb-5">
                    <div className="absolute left-5">
                        {planet && (<PlanetAvatar
                            uid={''}
                            url={planet?.avatar_url}
                            size={120} /> )}
                    </div>
                </div>
                </Card>
            </Layout>
        </GameplayLayout>
    );
}