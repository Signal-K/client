import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ContentPlaceholder from "../Content/Planets/PlanetData/ContentPlaceholder"
import { useEffect, useState } from "react";
import Link from "next/link";

export const ContentPlaceholderBlockTest = () => {
    return (
        // <ContentPlaceholder />
        <>Content Placeholder</>
    );
};

interface PlanetData {
    content: string;
    avatar_url: string;
    type: string;
    deepnote: string;
    cover: string;
    ticId: string;
    temperatureEq: number;
    smaxis: number;
    mass: number;
};

interface Sector {
    id: string;
    coverUrl: string;
    // Add other properties according to the actual structure of your 'basePlanetSectors' table
};

export const PlanetStatBlock = () => {
    const supabase = useSupabaseClient();
    
    const [planetData, setPlanetData] = useState<PlanetData | null>(null);
    const planetId = '2';

    useEffect(() => {
        getPlanetData();
    }, [supabase]);

    const getPlanetData = async () => {
        try {
            const { data, error } = await supabase
                .from('basePlanets')
                .select("*")
                .eq("id", planetId)
                .single();

            if (data) {
                setPlanetData(data);
            } else if (error) {
                console.error("Error fetching planet data:", error);
            }
        } catch (error) {
            console.error("Unexpected error fetching planet data:", error);
        }
    };

    // Check if planetData is null before destructuring
    if (!planetData) {
        return <div>Loading...</div>;
    }

    const { content, avatar_url, type, deepnote, cover, ticId, temperatureEq, smaxis, mass } = planetData;

    return (
        <div className="flex items-start gap-8 top-20">
          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">Mass {mass}</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Semi-Major Axis {smaxis}</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Anomaly type {type} </div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Eq. Temperature {temperatureEq}</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">TIC ID {ticId}</div>
          </div>
        </div>
    );
};

export const SectorsInsidePlanetBlock = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const planetId = "2";
    const userId = session?.user?.id;
    const [sectors, setSectors] = useState<Sector[]>([]);

    useEffect(() => {
        fetchSectorsForPlanet();
    }, [planetId, session]);

    async function fetchSectorsForPlanet() {
        try {
            const { data, error } = await supabase
                .from("basePlanetSectors")
                .select('*')
                // .eq("id", planetId);
                .eq("owner", userId);

            if (error) {
                console.error('Error fetching sectors data: ', error.message);
                return;
            }

            setSectors(data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="grid-container" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1454789591675-556c287e39e2?q=80&w=3272&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")' }}>
            {sectors.map((sector) => (
                <Link legacyBehavior key={sector.id} href={`/planets/sector/${sector.id}`}>
                    <a className="sector-link">
                        <div className="sector-square">
                            {sector.coverUrl && (
                                <img src={sector.coverUrl} alt="Sector Cover" className="sector-cover" />
                            )}
                        </div>
                    </a>
                </Link>
            ))}
            <style jsx>{`
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    grid-auto-rows: 20rem; /* Adjust height as needed */
                    gap: 10px;
                    padding: 20px; /* Add padding to ensure spacing */
                }

                .sector-square {
                    width: 100%;
                    height: 50%;
                    border: 1px solid white;
                    background-size: cover;
                    background-position: center;
                    position: relative;
                }

                .sector-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sector-link {
                    display: block;
                    width: 100%;
                    height: 100%;
                    text-decoration: none;
                    color: inherit;
                }
            `}</style>
        </div>
    );
};
