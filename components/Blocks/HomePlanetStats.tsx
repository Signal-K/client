import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export default function HomePlanetStats() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [homePlanetData, setHomePlanetData] = useState(null);
    
    useEffect(() => {
        const fetchPlanetData = async () => {
            if (!session) {
                return;
            };

            try {
                const { data, error } = await supabase
                    .from('basePlanets')
                    .select('*')
                    // .eq('id', 1)
                    .single();
                
                if (data) {
                    setHomePlanetData(data);
                };

                if (error) {
                    throw error;
                }

                console.log(data);
            } catch (error: any) {
                console.error(error.message);
            };
        };
    }, [session]);

    // if (!homePlanetData) {
    //     return null;
    // }

    // const { content, avatar_url, type, deepnote, cover, ticId, temperatureEq, smaxis, mass } = homePlanetData;

    return (
        <center><div className="w-[1231px] h-[792px] px-2.5 py-5 bg-gray-200 rounded-[15px] flex-col justify-between items-center inline-flex">
    <div className="h-[621px] p-5 justify-center items-center gap-[69px] inline-flex">
        <div className="w-11 h-11 relative" />
        <div className="self-stretch py-5 flex-col justify-start items-center gap-8 inline-flex">
            <div className="self-stretch h-[63.02px] pb-[26px] flex-col justify-start items-center gap-[5px] flex">
                {/* <div className="text-center text-gray-50 text-[32px] font-normal font-['Anonymous Pro'] tracking-[10.24px]">{content}</div> */}
                <div className="w-[472px] h-[0px] border-2 border-gray-200"></div>
            </div>
            <div className="w-[350px] h-[350px] pl-[17px] pr-[18px] pt-2.5 pb-[10.38px] justify-center items-center inline-flex">
                <div className="w-[315px] h-[329.62px] flex-col justify-center items-center inline-flex" />
            </div>
            <div className="self-stretch h-[54px] px-5 justify-between items-center inline-flex">
                <div className="w-[109px] self-stretch p-4 bg-white bg-opacity-25 rounded-md shadow justify-center items-center gap-2 flex">
                    <div className="text-neutral-50 text-xl font-medium font-['Inter'] leading-tight">Preview</div>
                </div>
                <div className="w-[109px] h-[54px] p-4 bg-stone-950 rounded-md shadow justify-center items-center gap-2 flex">
                    <div className="text-neutral-50 text-xl font-medium font-['Inter'] leading-tight">Select</div>
                </div>
            </div>
        </div>
        <div className="w-[404px] pl-[26px] pr-5 pt-[30px] pb-10 bg-stone-950 rounded-[10px] flex-col justify-start items-start gap-[30px] inline-flex">
            <div className="self-stretch h-[68px] py-5 flex-col justify-start items-start gap-2.5 flex">
                <div className="justify-start items-center gap-2.5 inline-flex">
                    <div className="text-white text-[32px] font-semibold font-['Inter'] leading-7">Planet Overview</div>
                </div>
            </div>
            <div className="self-stretch h-[433.77px] flex-col justify-start items-start gap-[30px] flex">
                <div className="flex-col justify-start items-start gap-[4.75px] flex">
                    <div className="text-center text-white text-opacity-40 text-2xl font-semibold font-['Inter'] tracking-[3.84px]">GALAXY</div>
                    <div className="text-center text-white text-opacity-30 text-2xl font-normal font-['Inter']">Sombrero</div>
                </div>
                <div className="flex-col justify-start items-start gap-[4.75px] flex">
                    <div className="text-center text-white text-opacity-40 text-2xl font-semibold font-['Inter'] uppercase tracking-[3.84px]">Diameter</div>
                    <div className="text-center text-white text-opacity-30 text-2xl font-normal font-['Inter']">56,780 km</div>
                </div>
                <div className="flex-col justify-start items-start gap-[4.75px] flex">
                    <div className="text-center text-white text-opacity-40 text-2xl font-semibold font-['Inter'] uppercase tracking-[3.84px]">Day Length</div>
                    <div className="text-center text-white text-opacity-30 text-2xl font-normal font-['Inter']">12 Earth hours</div>
                </div>
                <div className="flex-col justify-start items-start gap-[4.75px] flex">
                    <div className="text-center text-white text-opacity-40 text-2xl font-semibold font-['Inter'] uppercase tracking-[3.84px]">Avg Temperature</div>
                    <div className="text-center text-white text-opacity-30 text-2xl font-normal font-['Inter']">60°C to 90°C</div>
                </div>
                <div className="flex-col justify-start items-start gap-[4.75px] flex">
                    <div className="text-center text-white text-opacity-40 text-2xl font-semibold font-['Inter'] uppercase tracking-[3.84px]">Climate</div>
                    <div className="text-center text-white text-opacity-30 text-2xl font-normal font-['Inter']">Tropical</div>
                </div>
            </div>
        </div>
        <div className="w-11 h-11 relative origin-top-left rotate-180" />
    </div>
</div></center>
    );
};