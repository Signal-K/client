import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export default function CreateBasePlanetSector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userPlanet, setUserPlanet] = useState(null);

    // Get the planet that the user owns
    useEffect(() => {
        const fetchUserPlanet = async () => {
            if (!session) {
                return;
            };

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session?.user?.id)
                    .single();

                if (data) {
                    setUserPlanet(data);
                };

                if (error) {
                    throw error;
                };

                console.log(data);
            } catch (error: any) {
                console.error(error.message);
            };
        };

        fetchUserPlanet();
    }, [session]);

    return (
        <div>
            
        </div>
    );
};