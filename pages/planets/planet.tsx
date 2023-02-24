import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Layout, { ProfileLayout } from "../../components/Layout";
import Card from "../../components/Card";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetCoverImage from "../../components/Planets/Cover";
import PlanetAvatar from "../../components/Planets/PlanetAvatar";
import PlanetTabs from "../../components/Planets/PlanetNavigation";
import PlanetEditor, { PlanetEditorFromData } from "../generator/planet-editor";

// import { Database } from "../../utils/database.types"; // Use this for later when we are drawing from the Planets table
// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetPage () {
    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'planet'; // Planet stats & information
    const planetId = router.query.id;

    const supabase = useSupabaseClient();
    const [planet, setPlanet] = useState(null);

    useEffect(() => {
        if (!planetId) { return; }
    })

    function fetchPlanet () {
        supabase.from('planets')
            .select()
            .eq('id', planetId) // How should the ID be generated -> similar to how `userId` is generated? Combination of user + org + article + dataset number??
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); };
            }
        );
    };

    return (
        <Layout hideNavigation={false}> {/* Should be set to <ProfileLayout /> */}
            <Card noPadding={true}>
                <div className="relative overflow-hidden rounded-md">
                    <PlanetCoverImage url={planet?.cover} editable={true} onChange={fetchPlanet()} />
                    <div className="absolute top-40 mt-12 left-4 w-full z-20">
                        {planet && (<PlanetAvatar // Add upload handler from AccountAvatarV1
                            uid={''} // Behaviour for profile: `{session?.user!.id}`. Right now it's just set to a default, so same planet every time. In practice, it should infer the planet id based on the url (which will have the id inside it)
                            url={planet?.avatar_url}
                            size={120} /> )}
                    </div>
                    <div className="p-4 pt-0 md:pt-4 pb-0">
                    <div className="ml-24 md:ml-40 mt-1">
                        <div className="flex ml-0"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{planet?.name}</h1>{/* Only show userma,e on mouseover, along with the address (like a metamask profile view) <p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p>*/}</div>
                        <div className="text-gray-500 leading-4 mt-1 ml-0">{planet?.temperature} KELVIN</div>{/*<div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                            <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */} {/*
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                        </div>*/}
                        {/*<div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | Only show this on mouseover {profile?.username}*/}{/*</div> {/* Profile Location (from styles css) */}
                    </div>
                    <PlanetTabs activeTab={tab} planetId={planet?.id} />
                    </div>
                </div>
            </Card>
        </Layout>
    );
};