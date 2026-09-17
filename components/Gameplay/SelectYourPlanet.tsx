import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function SelectYourBasePlanet () {
    const supabase = useSupabaseClient();
    const session = useSession();

    async function createPlanet() {
        supabase
            .from("inventoryPLANETS")
            //...
    }

    return (
        <p>Test</p>
    );
};