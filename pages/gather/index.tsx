import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import React from "react";
import Link from "next/link";
import Layout from "../../components/Section/Layout";
import { ImagesGrid } from "../../components/Content/Planets/Base/SectorGrid";
import CreateBasePlanetSector, { AllSectors, UserOwnedSectorGrid } from "../../components/Content/Planets/Sectors/SectorSetup";

export default function GatherResourcesPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const sectorImageUrls = [
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00090/ids/edr/browse/edl/EBE_0090_0674952393_193ECM_N0040048EDLC00090_0030LUJ01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00088/ids/edr/browse/ncam/NLF_0088_0674754382_784ECM_N0040048NCAM00503_01_295J01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00898/ids/edr/browse/ncam/NLF_0898_0746644503_691ECM_N0440830NCAM00501_01_295J01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00452/ids/edr/browse/ncam/NLG_0452_0707069810_116ECM_N0260000NCAM00521_00_2I4J01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00142/ids/edr/browse/ncam/NLE_0142_0679544984_506ECM_N0051812NCAM00208_04_0LLJ01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00014/ids/edr/browse/ncam/NLM_0014_0668187567_632ECM_N0030074AUT_04096_00_2LLJ01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00214/ids/edr/browse/ncam/NLF_0214_0685920377_855ECM_N0072050NCAM00514_01_295J01_1200.jpg',
        'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00721/ids/edr/browse/ncam/NLF_0721_0730956964_909ECM_N0345120NCAM15721_01_195J01_1200.jpg',
    ];

    if (!session) {
        return (
            <div className='w-80%'><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' /></div>
        );
    };

    return (
        <Layout>
            <div className="p-5">
                <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">Your planet</h1>
                {/* <pre>You've currently got one planet in your inventory (as we're only exploring base planets for now). Here's the latest rover image set.</pre> */}
                {/* <h2 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">Your owned sectors (of planet)</h2> */}
                <CreateBasePlanetSector />
                <UserOwnedSectorGrid />
                <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">All sectors</h1>
                <AllSectors />
            </div>
        </Layout>
    );
};