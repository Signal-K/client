import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export default function CreateBasePlanetSector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userPlanet, setUserPlanet] = useState(null);

    // Get the planet that the user owns
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
                setUserPlanet(data.location);
            };

            if (error) {
                throw error;
            };
        } catch (error: any) {
            console.error(error.message);
        };
    };

    fetchUserPlanet();

    const createSector = async () => {
        if (session) {
            fetchUserPlanet();
            const response = await supabase.from('basePlanetSectors').upsert([
                {
                    anomaly: userPlanet,
                    owner: session?.user?.id,
                    deposit: "Iron", // Start off with Iron as a default resource
                    coverUrl: "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00090/ids/edr/browse/edl/EBE_0090_0674952393_193ECM_N0040048EDLC00090_0030LUJ01_1200.jpg", // Do we set this to be a supabase storage asset in prod?
                },
            ]);

            if (response.error) {
                console.error(response.error);
            } else {
                
            };
        };
    };

    return (
        <div>
            <pre>{userPlanet}</pre>
            <button onClick={createSector}>Create sector</button>
        </div>
    );
};

export function UserOwnedSectorGrid() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
        const fetchUserSectorImages = async () => {
            if (session) {
                try {
                    const { data, error } = await supabase
                        .from("basePlanetSectors")
                        .select('coverUrl')
                        .eq('owner', session?.user?.id);

                    if (data) {
                        setImageUrls(data.map((item) => item.coverUrl));
                    };

                    if (error) {
                        throw error;
                    };
                } catch (error) {
                    console.error(error.message);
                };
            };
        };

        fetchUserSectorImages();
    }, [session, supabase]);
}