import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function PlanetPage () {
    const router = useRouter();
    const planetId = router.query.id;

    const supabase = useSupabaseClient();
    const session = useSession();

    const [planet, setPlanet] = useState(null);

    useEffect(() => {
        if (!planetId) { return; };
        fetchPlanet(planetId);
    }, []);

    async function fetchPlanet ( planetId ) {
        supabase.from('planetsss')
            .select('*')
            .eq('id', planetId)
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); 
            }
        });
    }

    return (
        <p>{planet?.id}
        Test</p>
    )
}