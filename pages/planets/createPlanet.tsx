import React, { useContext, useEffect, useState } from "react";
import Card from "../../components/Card";
import { ClimbingBoxLoader } from "react-spinners";

import { UserContext } from "../../context/UserContext";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AccountAvatar from "../../components/AccountAvatar";

export default function PlanetFormCard ( { onCreate } ) {
    // Take TIC id/stellar id, generate in python, return. Require reputation, take reputation. Long-term: generate planets via tic id with dynamic routes
    const supabase = useSupabaseClient();
    const [content, setContent] = useState('');
    const session = useSession();

    const [userReputation, setUserReputation] = useState(null);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [username, setUsername] = useState('');
    const [name, setPlanetName] = useState('');
    const [planetTemperature, setPlanetTemperature] = useState();
    const [planetRadius, setPlanetRadius] = useState();
    const [ticId, setTicId] = useState(''); // Will later be calculated/generated randomly by python
    const [planetAvatar_url, setPlanetAvatarUrl] = useState(''); // This will be set upon returning the image from python
    const [planetContract, setPlanetContract] = useState(''); // This will be set by default to `0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43`
    const [planetTokenId, setPlanetTokenId] = useState(); // This will be set by Thirdweb after it is lazy minted
    const [planetChainId, setPlanetChainId] = useState(''); // Set by default to Goerli, will be changed either by user or by default later
    // forks, forkFrom, posts, articles, datasets, generator (params)
    const [planetMultiplier, setPlanetMultiplier] = useState(); // Set by default to 1
    const [ownerAddress, setOwnerAddress] = useState('');
    const [ownerId2, setOwnerId2] = useState(''); // Used specifically for testing, will not be in prod

    const [loading, setLoading] = useState(false);

    async function getProfile () {
        try {
            setLoading(true);
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, reputation, address`)
                .eq('id', session?.user?.id)
                .single()

            if (error && status !== 406) { throw error; };
            if ( data ) {
                setUsername(data.username);
                setUserReputation(data.reputation);
                setOwnerAddress(data.address);
            };
        } catch ( error ) {
            console.log(error);
        } finally {
            setLoading(false);
        };
    };
    
    function createPlanet () {
        supabase.from('planets').insert({
            temperature: planetTemperature,
            ticId,
            radius: planetRadius,
            userId: session?.user?.id,
            name,
            contract: '0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43',
            tokenId: 0,
            chainId: 'goerli',
            ownerAddress,
        })
    }

    useEffect (() => {
        supabase.from('profiles')
            .select(`avatar_url`)
            .eq('id', session?.user?.id)
            .then(result => {
                setAvatarUrl(result.data[0].avatar_url);
            });
    }, []);

    useEffect(() => {
        getProfile();
    }, [session]);

    if ( userReputation < 1 ) return (
        <div>You need to improve your reputation to be able to afford this planet</div>
    );

    return (
        <Card noPadding={false}>
            <div className="flex gap-2">
                <div>
                    <AccountAvatar uid={session?.user?.id}
                        url={avatar_url}
                        size={60} />
                </div> { session?.user?.id && (
                    <textarea value={name} onChange={e => setContent(e.target.value)} className="grow p-3 h-14" placeholder={`What do you want to call this new planet, ${username}?`} /> )}
            </div>
        </Card>
    )
}