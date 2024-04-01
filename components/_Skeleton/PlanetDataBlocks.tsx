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
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        fetchSectorsForPlanet();
    }, [planetId, session])

    async function fetchSectorsForPlanet() {
        try {
            const { data, error } = await supabase
                .from("basePlanetSectors")
                .select('*')
                // .eq('anomaly', planetId) // This will show all your sectors by default
                .eq('owner', userId);

            if (error) {
                console.assert('Error fetching sectors data: ', error.message);
                return;
            };

            setSectors(data);

            } catch (error) {
              console.error(error);
            };
        };

    return (
        <><div className="grid-container mb-24">
              {sectors.map((sector) => (
                <Link legacyBehavior key={sector.id} href={`/planets/sector/${sector.id}`}>
                <a className="sector-link">
                    <div className="sector-square">
                    {/* {sector.coverUrl && (
                        <img src={sector.coverUrl} alt="Sector Cover" className="sector-cover" />
                    )} */}
                    </div>
                </a>
                </Link>
            ))}
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
        </>
    );
};