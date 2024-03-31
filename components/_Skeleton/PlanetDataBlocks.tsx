import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ContentPlaceholder from "../Content/Planets/PlanetData/ContentPlaceholder"
import { useEffect, useState } from "react";

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