import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "../components/Section/Layout";
import OwnedPlanetsList from "../components/Content/Planets/UserOwnedPlanets";
import OwnedItemsList from "../components/Content/Inventory/UserOwnedItems";

export default function Explore() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <Layout>
            <OwnedPlanetsList />
            <OwnedItemsList />
        </Layout>
    )
}