import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
//import { UserContextProvider } from "../../context/UserContext";
import { UserContext } from "../../context/UserContext";
import PlanetCoverImage from "../../components/Gameplay/Planets/Cover";
import PlanetAvatar from "../../components/Gameplay/Planets/PlanetAvatar";
import PlanetTabs from "../../components/Gameplay/Planets/PlanetNavigation";
import { GameplayLayout } from "../../components/Core/Layout";
import { useContract, useContractRead, useContractWrite, useLazyMint } from "@thirdweb-dev/react";
import Link from "next/link";
import { PlanetCard } from "../../components/Gameplay/Planets/PlanetCard";
import { PostFormCardPlanetTag } from "../../components/PostFormCard";
import { planetsImagesCdnAddress } from "../../constants/cdn";
import PostCard from "../../components/PostCard";
import { SocialGraphHomeNoSidebarIndividualPlanet } from "../posts";

// import { Database } from "../../utils/database.types"; // Use this for later when we are drawing from the Planets table
// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetPage () {
    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'planet'; // Planet stats & information
    const planetId = router.query.id;

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

    const { contract } = useContract(planet?.contract);
    /*const { mutateAsync: lazyMint, isLoading } = useContractWrite(contract, "lazymint");
    const lazyMintAnomaly = async () => {
        try {
            const data = await lazyMint([ _amount, _baseURIForTokens, _data ]);
            console.info('contract call success: ', data);
        } catch (err) {
            console.error('contract call failure: ', err);
        }
    }*/
    const {
        mutate: lazyMint,
        isLoading,
        error,
    } = useLazyMint(contract);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!planetId) { return; }
        fetchPlanet();
        //console.log(planet?.id);
    })

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

    function fetchPlanet () {
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

    function showNftMetadataUri (planet) {
        const { contract } = useContract(`{planet?.contract}`);
        const { data, isLoading } = useContractRead( contract, "uri", `{planet?.tokenId}`)
        if ( data ) {
            setPlanetUri( data );
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

    function fetchPosts () {
        supabase.from('posts')
            .select('id, content, created_at, media, profiles(id, avatar_url, username)') // Reset id on testing playground server later
            .order('created_at', { ascending: false })
            .then( result => { setPosts(result.data); });
        supabase.from('posts_duplicate')
          .select('id, content, created_at, media, planets2, profiles(id, avatar_url, username)') // Reset id on testing playground server later
          .order('created_at', { ascending: false })
          .then( result => { setPlanetPosts(result.data); });
      }

    return (
        <GameplayLayout>
            <Layout hideNavigation={true}> {/* Should be set to <ProfileLayout /> */}
                <Card noPadding={true}>
                    <div className="relative overflow-hidden rounded-md mb-5">
                        <PlanetCoverImage url={planet?.cover} editable={true} onChange={fetchPlanet()} />
                        <div className="absolute top-40 mt-12 left-5">
                            {/*{planet && (<PlanetAvatar // Add upload handler from AccountAvatarV1
                                uid={''} // Behaviour for profile: `{session?.user!.id}`. Right now it's just set to a default, so same planet every time. In practice, it should infer the planet id based on the url (which will have the id inside it)
                                url={planet?.avatar_url}
                                size={120} /> )}*/}
                        </div>
                        <div className="p-4 pt-0 md:pt-4 pb-0">
                        <div className="ml-24 md:ml-10 mt-1"> {/* Should be ml-40 when avatar is added back */}
                            <br /><div className="flex ml--2"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{planet?.content}</h1>{/* Only show userma,e on mouseover, along with the address (like a metamask profile view) <p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p>*/}</div>
                            <div className="text-gray-500 mt-1 ml-0">{planet?.temperature} KELVIN</div>{/*<div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                                <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */} {/*
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                            </div>*/}
                            
                            {/*<div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | Only show this on mouseover {profile?.username}*/}{/*</div> {/* Profile Location (from styles css) */}
                        </div>
                        <PlanetTabs activeTab={tab} planetId={planet?.id} /><br /><br />
                        <center><h1 className="display-5">Star's Lightcurve (KEPLER)</h1></center><br />
                        <img src={planetsImagesCdnAddress + planet?.id + '/' + 'download.png'} />
                        Planet temperature: {planet?.temperature} <br />
                        <button onClick={claimPlanet}>Claim Planet</button>
                        <p>Owner of this anomaly: {planet?.owner}</p>
                        </div>
                    </div>
                </Card>
                <PlanetCard activeTab={tab} planetId={planetId} />
                <UserContext.Provider value={{profile}}><PostFormCardPlanetTag onPost={fetchPosts} /></UserContext.Provider><br />
                <center><h1 className="display-6">Related Posts</h1></center>
                {planetPosts?.length > 0 && planetPosts.map(post => (
                    <PostCard key = { post.id } {...post} />
                ))}
                {posts?.length > 0 && posts.map(post => (
                    <PostCard key = { post.id } {...post} />
                ))}
                {/*<SocialGraphHomeNoSidebarIndividualPlanet planetId={ planetId } />*/}
                <SocialGraphHomeNoSidebarIndividualPlanet planetId={ session?.user?.id } />
            </Layout>
        </GameplayLayout>
    );
};