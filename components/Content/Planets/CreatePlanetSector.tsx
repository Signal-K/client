import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

function CreatePlanetSectorComponent ({ planetId }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [isLoading, setIsLoading] = useState(false);

    const createSector = () => {
        if (!session) { return; };

        if (!planetId) { return; };

        // Generate random mineral deposits - will later be set in db
        const depsitCount = Math.floor(Math.random() * 5);
    }
}