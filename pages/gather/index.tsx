import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import React from "react";
import Layout from "../../components/Section/Layout";
import { ImageGrid } from "../../components/Content/Planets/Base/SectorGrid";

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
            <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">Your planet</h1>
            <pre>You've currently got one planet in your inventory (as we're only exploring base planets for now). Here's the latest rover image set.</pre>
            <ImageGrid imageUrl='https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00116/ids/edr/browse/ncam/NLF_0116_0677245872_058ECM_N0041250NCAM02116_01_195J01_1200.jpg' />
        </Layout>
    );
};