import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Card from "../../../Card";

export default function BasePlanetSectors({ planetId }: { planetId: string }) {
    const router = useRouter();
    const { id: planetid } = router?.query;

    const supabase = useSupabaseClient();
    const session = useSession();

    const [planetData, setPlanetData] = useState(null);
    const [sectorsData, setSectorsData] = useState(null);

    const getPlanetSectors = async () => {
        if (!planetId) {
            return null;
        };

        if (!session) {
            return null;
        };

        if (!supabase) {
            return null;
        };

        try {
            const { data, error } = await supabase
                .from('basePlanetSectors')
                .select('*')
                .eq('anomaly', planetId)

            if (data) {
                setSectorsData(data);
            };

            console.log(data);

            if (error) {
                throw error;
            };
        } catch (error) {
            console.error(error.message);
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            if (planetId) {
                await getPlanetSectors();
            };
        }

        fetchData();
    }, [planetId]);

    if (!planetId) {
        return (
            <div>Loading...</div>
        );
    };

    return (
        <>
            <div className="">
                {sectorsData}
            </div>
        </>
    );
};