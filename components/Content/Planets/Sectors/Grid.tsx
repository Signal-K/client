import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Sector {
    id: number;
    name: string;
}

export default function PublicSectorsGrid() {
    const supabase = useSupabaseClient();

    const [sectors, setSectors] = useState<Sector[]>([]);

    async function fetchSectors() {
        try {
            const { data, error } = await supabase
                .from('basePlanetSectors')
                .select('*')
                .limit(10)

            if (error) {
                console.assert('Error fetching sector data: ', error.message);
                return;
            };

            setSectors(data);
        } catch (error) {
            console.error(error);
        };
    };

    useEffect(() => {
        fetchSectors();
    }, [])

    return (
        <div className="grid-container mb-24">
            {sectors.map(( sector ) => (
                <Link legacyBehavior key={sector.id} href={`/planets/sector/${sector.id}`}>
                    <a className="sector-link">
                        <div className="sector-square">
                            {/* {sector.coverUrl && (
                                <img src={sector.coverUrl} alt="Sector Cover" className="sector-cover" />
                            )} */}
                        </div>
                        <style jsx>{`
                            .grid-container {
                            display: grid;
                            grid-template-columns: repeat(5, 1fr);
                            grid-auto-rows: 1fr;
                            gap: 10px;
                            margin-top: 20px;
                            position: absolute;
                            bottom: 20px;
                            left: 50%;
                            transform: translateX(-50%);
                            z-index: 1;
                            }

                            .sector-square {
                            width: 100px;
                            height: 100px;
                            border: 1px solid white;
                            }
                    `}</style>
                    </a>
                </Link>
            ))}
        </div>
    );
};