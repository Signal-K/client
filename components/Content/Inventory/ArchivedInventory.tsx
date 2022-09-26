import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "../../Section/Layout";
import OwnedPlanetsList from "../Planets/UserOwnedPlanets"; // Potentially this should be in a lists component dir
import OwnedItemsList from "./UserOwnedItems";
import MySpaceships from "./Vehicles/MySpaceships";

export default function V1Inventory() { // Inventory items for v1 of public schema, see notes below
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <Layout>
            <OwnedPlanetsList />
            <OwnedItemsList />
            <MySpaceships />
        </Layout>
    );
};

/*

1. I think explore.tsx  houses legacy content → i.e. owned spaceships, planets, items in the old architecture. Potentially we should move this archive into a different supabase schema and then have different versions that can be "staked" based on each release of Star Sailors (alpha versions). So we'll need to look into achieving calls into other (I'm assuming public) schemas
2. A lot of the explore page can actually be used, in terms of the components. Block layout for your "inventory". In reality it's more akin to an inventory page, the explore page should be designated towards exploring anomalies or other entities (a distinction would need to be made between the garden and explore pages, then).

*/