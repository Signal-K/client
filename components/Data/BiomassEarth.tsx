'use client';

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function BiomassOnEarth() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [zoodexCount, setZoodexCount] = useState<number | null>(null);
    const biomass = zoodexCount !== null ? 0.831 * 0.001 * zoodexCount : null;

    useEffect(() => {
        const fetchZoodexCount = async () => {
            try {
            const { count, error } = await supabase
                .from("classifications")
                .select("id", { count: "exact" })
                .like("classificationtype", "%zoodex%");

            if (error) throw error;
            setZoodexCount(count);
            } catch (err: any) {
            console.error("Error fetching Zoodex classifications:", err.message);
            setZoodexCount(0);
            }
        };

        fetchZoodexCount();
    }, [supabase]);

    return (
        <div>
            <p className="inline text-[#2C4F65]">Biomass: </p>
            <p className="inline text-blue-200">{biomass !== null ? biomass.toFixed(6) : "Loading..."}</p>
        </div>
    );
};