// aka vehicle.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import CoreLayout from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

import SpaceshipCoverImage from "../../components/Gameplay/Spaceships/SpaceshipCover";
import SpaceshipAvatar from "../../components/Gameplay/Spaceships/SpaceshipAvatar";
import SpaceshipTabs from "../../components/Gameplay/Spaceships/SpaceshipTabs";

export default function SpaceshipPage () {
    const router = useRouter();
    const tab = router?.query?.tab?.[0] || 'spaceship';
    const spaceshipId = router.query.id;
    const [loading, setLoading] = useState(false);
    let width = 'w-12';

    const supabase = useSupabaseClient();
    const session = useSession();
    const [spaceship, setSpaceship] = useState(null);
    const [spaceshipOwner, setSpaceshipOwner] = useState(null);
    const [playerReputation, setPlayerRepuation] = useState<number>();
    const [username, setUsername] = useState<string>('');

    function fetchSpaceship () {
        supabase.from('spaceships')
            .select('*')
            .eq('id', spaceshipId)
            .then (result => {
                if (result.error) { throw result.error; };
                if ( result.data ) { setSpaceship( result.data[0]); };
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

    const claimShip = async () => {
        try {
            const { data, error } = await supabase
                .from('spaceships')
                .update([
                    { owner: session?.user?.id, /*userId: username*/ }
                ])
                .eq('id', spaceshipId);
                updatePlayerReputation(); // Do this for posts, journals as well
            
                if (error) throw error;
        } catch (error: any) {
            console.log(error);
        }
    }

    return (
        <CoreLayout>
            <Layout hideNavigation={true}>
                <Card noPadding={true}>
                   <div className="relative overflow-hidden">
                        <SpaceshipCoverImage url={spaceship?.cover} editable={true} onChange={fetchSpaceship()} />
                        {/*<div className="absolute top-40 mt-12 left-5">
                            {spaceship && (<SpaceshipAvatar
                                uid={''}
                                url={spaceship?.image}
                                size={120} /> 
                            )}
                        </div>*/}
                        <div className="p-4 pt-0 md:pt-4 pb-0">
                            <div className="ml-24 md:ml-5 mt-1">
                                <br /><div className="flex ml--2">
                                    <h1 className="text-3xl font-bold">{spaceship?.name}</h1>
                                </div>
                                <div className="text-gray-500 mt-1 ml-0">{spaceship?.speed} AU/day</div>
                            </div>
                            <SpaceshipTabs activeTab={tab} spaceshipId={spaceship?.id} /><br /><br />
                            <p>Spaceship ID: {spaceship?.id}</p>
                            <p>Owner of this spaceship: {spaceship?.owner}</p>
                            {spaceship?.owner != session?.user?.id && (
                                <button onClick={claimShip}>Claim ship</button>
                            )}
                            {spaceship?.owner == session?.user?.id && (
                                <><div>You own this ship! Your id: {session?.user?.id}</div></>
                            )}<br /><br />
                        </div>
                    </div> 
                </Card>
            </Layout>
        </CoreLayout>
    )
}