// FCDB-13
// Will perform dynamic routes, but it will all go into the index route.
// I think we'll have it that there will be 6 different factions (independant of species), each has their home planet (one of the 6 base planets), you pick your faction and you get assigned a planet/part of planet to classify & collate
// Row in `basePlanets` `Faction`': Will later be a foreign key to the (currently non-existent) `factions` table. Will be labelled 1-6, for simplicity with pulling ids in the client code. Naming schema & other variables will be set manually in client repo UNTIL new table is created
// Add in a toggle to view other factions once you've "earnt their trust", right now we don't need or want people to view others' homebases.

import React, { useEffect, useState } from "react";
import Layout from "../../components/Section/Layout";
import HomebaseSelector from "../../components/Gameplay/FactionHomebase";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Homebase() {
    const supabase = useSupabaseClient();
    const session = useSession();

    // const [userFaction, setUserFaction] = useState<number>();
    const [userData, setUserData] = useState(null);

    // Get user data from here, determine their faction
    const getUserFaction = async () => {
        if (!session) {
            return null;
        };

        try {
            const {
                data, error 
            } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id)
                .single();
            
            if (data) {
                setUserData(data);
            };

            if (error) {
                throw error;
            };
        } catch (error) {
            console.error(error.message);
        };
    };

    const { level, location, factions } = userData || {};

    useEffect(() => {
        const fetchData = async () => {
            if (session) {
                await getUserFaction();
            };
        };

        fetchData();
    }, [session]);

    if (!userData) {
        return (
            <div>Loading...</div>
        );
    };

    return (
        <Layout>
            <HomebaseSelector factionId={userData.factions} />
            
        </Layout>
    );
};