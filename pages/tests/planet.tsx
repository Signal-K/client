import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function PlanetPage({ id }: { id: string }) {
    const router = useRouter();

    const supabase = useSupabaseClient();
    const session = useSession();

    const [planetData, setPlanetData] = useState(null);
    const { id: planetId } = router.query; // Rename the variable to 'planetId'

    useEffect(() => {
        if (planetId) { // Use 'planetId' here
            getPlanetData();
        }
    }, [planetId]);

    const getPlanetData = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .select("*")
                .eq("id", planetId) // Use 'planetId' here
                .single();

            if (data) {
                setPlanetData(data);
            }

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error(error.message);
        }
    }

    if (!planetData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{planetData.content}</h1>
            {/* Display other fields from planetData */}
        </div>
    );
}