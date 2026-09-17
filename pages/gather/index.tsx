import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import React from "react";
import Link from "next/link";
import Layout from "../../components/_Core/Section/Layout";
import CreateBasePlanetSector, { AllSectors, UserOwnedSectorGrid } from "../../components/Content/Planets/Sectors/SectorSetup";

export default function GatherResourcesPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

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