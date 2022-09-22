import React, { useState, useEffect, useTransition, lazy } from "react";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
//import { UserContextProvider } from "../../context/UserContext";
import { UserContext } from "../../context/UserContext";
import PlanetCoverImage from "../../components/Gameplay/Planets/Cover";
import PlanetAvatar from "../../components/Gameplay/Planets/PlanetAvatar";
import PlanetTabs from "../../components/Gameplay/Planets/PlanetNavigation";
import CoreLayout from "../../components/Core/Layout";
import Link from "next/link";
import { PlanetCard } from "../../components/Gameplay/Planets/PlanetCard";
import { PostFormCardPlanetTag } from "../../components/PostFormCard";
import { planetsImagesCdnAddress } from "../../constants/cdn";
import PostCard, { PlanetPostCard } from "../../components/PostCard";
// import { SocialGraphHomeNoSidebarIndividualPlanet, SocialGraphHomeNoSidebarIndividualPlanetReturn } from "../posts";
import UnityBuildLod1 from "../../components/Gameplay/Unity/Build/LOD-Rocky";
// import PlanetEditor from "../generator/planet-editor";

const HeavyComponent = lazy(() => import ('../generator/planet-editor'));

// import { StarSystem } from 'stellardream';

//import * as astro from 'astrojs';
//import { Line } from 'react-chartjs-2';

// import { Database } from "../../utils/database.types"; // Use this for later when we are drawing from the Planets table
// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetPage () {
    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'planet'; // Planet stats & information
    const planetId = router.query.id;

    useEffect(() => {
        console.log(planetId);
    })

    const supabase = useSupabaseClient();
    const session = useSession();
    const [profile, setProfile] = useState(null);
    const [planet, setPlanet] = useState(null);
    const [planetOwner, setPlanetOwner] = useState(null);
    const [planetUri, setPlanetUri] = useState();
    const [username, setUsername] = useState('');
    const [playerReputation, setPlayerRepuation] = useState<number>();
    const [planetPosts, setPlanetPosts] = useState([]);
    const [posts, setPosts] = useState([]);

    // For loading planet editor
    const [, startTransition] = useTransition();
    const [load, setLoad] = useState(false);

    useEffect(() => {
        //const starSystem = new StarSystem(1);
        // console.log(JSON.stringify(starSystem, null, 2))
    }, [session?.user])

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!planetId) { return; }
        fetchPlanet(planetId);
        //FetchPlanetPosts(planetId);
        //console.log(planet?.id);
    }, [session?.user?.id]);

    // Getting profile information -> for postform
    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
    
        supabase.from('profiles')
            .select()
            .eq('id', session?.user?.id)
            .then(result => {
                if (result.data.length) {
                    setProfile(result.data[0]);
                }
            })
    }, [session?.user?.id]); // Run it again if auth/session state changes

    function fetchPlanet (planetId) {
        supabase.from('planetsss')
            .select("*")
            .eq('id', planetId) // How should the ID be generated -> similar to how `userId` is generated? Combination of user + org + article + dataset number??
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); /*console.log(planet);*/ setPlanetOwner(planet?.ownerId); };
            }
        );
    }

    async function getProfile () {
        try {
            setLoading(true);
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, reputation`)
                .eq('id', session?.user?.id)
                .single()
            
            if (error && status !== 406) { throw error; };
            if (data) { setUsername(data.username); setPlayerRepuation(data.reputation); };
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    function updatePlanetTic ( ) {

    }

    const updatePlayerReputation = async () => {
        let newReputation = playerReputation + 1;
        setPlayerRepuation(newReputation);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update([
                    { reputation: newReputation, }
                ])
                .eq('id', session?.user?.id);

                if (error) throw error;
        } catch (error: any) {
            console.log(error);
        }
    }

    const claimPlanet = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .update([
                    { owner: session?.user?.id, /*userId: username*/ }
                ])
                .eq('id', planetId);
                updatePlayerReputation(); // Do this for posts, journals as well
            
                if (error) throw error;
        } catch (error: any) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchPostsForPlanet(planetId);
    }, [planetId, session?.user?.id])

    function fetchPostsForPlanet(planetId) {
        supabase
          .from('posts_duplicate')
          .select('id, content, created_at, media, profiles(id, avatar_url, username)')
          .eq('planets2', planetId)
          .order('created_at', { ascending: false })
          .then(result => {
            setPlanetPosts(result.data);
        });
    }

    const period = 3.5; // days
    const radius = 1.5; // Jupiter radii
    const inclination = 89; // degrees

    return (
        <CoreLayout>
            <Layout hideNavigation={true}> {/* Should be set to <ProfileLayout /> */}
                <Card noPadding={true}>
                    <div className="relative overflow-hidden rounded-md mb-5">
                        {/*<PlanetCoverImage url={planet?.cover} editable={true} onChange={fetchPlanet()} />*/}
                        <div className="absolute left-5">
                            {planet && (<PlanetAvatar // Add upload handler from AccountAvatarV1
                                uid={''} // Behaviour for profile: `{session?.user!.id}`. Right now it's just set to a default, so same planet every time. In practice, it should infer the planet id based on the url (which will have the id inside it)
                                url={planet?.avatar_url}
                                size={120} /> )}
                        </div>
                        <div className="p-4 pt-0 md:pt-4 pb-0">
                        <div className="ml-24 md:ml-40 mt-1">
                            <br /><div className="flex ml--2"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{planet?.content}</h1>{/* Only show userma,e on mouseover, along with the address (like a metamask profile view) <p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p>*/}</div>
                            <div className="text-gray-500 mt-1 ml-0">{planet?.temperature} KELVIN</div>{/*<div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                                <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */} {/*
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                            </div>*/}
                            
                            {/*<div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | Only show this on mouseover {profile?.username}*/}{/*</div> {/* Profile Location (from styles css) */}
                        </div>
                        <PlanetTabs activeTab={tab} planetId={planet?.id} /><br /><br />
                        <center><h1 className="display-5">Star's Lightcurve</h1></center><br />
                        <img src={planetsImagesCdnAddress + planet?.id + '/' + 'download.png'} />
                        
                        <button className="hidden p-2 mr-3 text-gray-600 rounded cursor-pointer lg:inline hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" onClick={claimPlanet}>Claim Planet</button>
                        {/* {planet?.owner && (
                            <p>Owner of this anomaly: {planet?.owner}</p>
                        )} */}
                        </div>
                    </div>
                </Card>
                <PlanetCard activeTab = { tab } planetId = { planetId } />
                <UserContext.Provider value={{profile}}><PostFormCardPlanetTag planetId2={planet} onPost={ fetchPostsForPlanet(planetId)} /></UserContext.Provider><br />

                <center><h2 className="display-6">{planet?.content} Discussion</h2></center><br />
                {planetPosts?.length > 0 && planetPosts.map(post => (
                    <PlanetPostCard key = { post.id } {...post} planets2 = { planetId } />
                ))} <br />

                <center><h2 className="display-6">Paint your planet</h2></center><br />
                <center><button
                    onClick = {() => {
                        startTransition(() => {
                            setLoad(true);
                        });
                    }}
                >Load planet editor</button></center>
                {load && <> <UnityBuildLod1 /> {/*<HeavyComponent />*/} </>}
                {/* <Card noPadding={false}><PlanetEditor /></Card> */}
            </Layout>
        </CoreLayout>
    );
};