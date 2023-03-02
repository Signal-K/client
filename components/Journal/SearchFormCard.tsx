import React, { useEffect, useState } from "react";

import Card from "../Card";
import { ClimbingBoxLoader } from "react-spinners";

import AccountAvatar from "../AccountAvatar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SearchFormCard ( { onSearch } ) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [searchContent, setSearchContent] = useState('');
    const [avatar_url, setAvatarUrl] = useState(null);

    function search () {
        console.log(`${searchContent} sent as request to flask`)
    };

    useEffect(() => {
        supabase.from('profiles')
            .select(`avatar_url`)
            .eq('id', session?.user?.id)
            .then( result => {
                setAvatarUrl(result?.data[0].avatar_url);
            })
    }, []);

    return (
        <Card noPadding={false}>
            <div className="flex gap-2">
                <div>
                    <AccountAvatar uid={session?.user?.id}
                        url={avatar_url}
                        size={60} 
                    />
                </div>
                { session?.user?.id && (
                    <textarea value={searchContent} onChange = { e => setSearchContent( e.target.value )} className='grow p-3 h-14' placeholder={`Search for a paper here`} />
                )}
                <div className="grow text-right">
                    <button onClick={search} className='bg-socialBlue text-white px-6 py-1 rounded-md'>Search</button>
                </div>
            </div>
        </Card>
    )
}