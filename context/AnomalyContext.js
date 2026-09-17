import { createContext, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export const AnomalyContext = createContext ( { } );

export default function AnomalyContextProvider ( { children, planetId } ) {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [planet, setAnomaly] = useState(null);

    useEffect(() => {
        if (!session?.user?.id) { return; };
        supabase.from('planetsss') // Change to specific anomaly table
            .select()
            .eq('id', planetId )
            .then( result => {
                setAnomaly ( result.data?.[0] );
            });
    }, [planetId]);

    return (
        <AnomalyContext.Provider value={{ planet }}>
            { children }
        </AnomalyContext.Provider>
    );
};