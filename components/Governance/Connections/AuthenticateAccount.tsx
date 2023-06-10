import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../../../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function AuthenticateWalletToDb () {
    const session = useSession();
    const supabase = useSupabaseClient();
    const address = useState()

    const [loading, setLoading] = useState(false);
    const [userAddress, setUserAddress] = useState();
    const [username, setUsername] = useState('');
    const [updated_at, setUpdate_at] = useState();

    async function getProfile () {
        try {
            setLoading(true);
            if (!session) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, address`)
                .eq('id', session?.user?.id)
                .single()
    
            if (error && status !== 406) {
                throw error; 
            }
    
            if (data) {
                setUsername(data.username);
                setUserAddress(data.address);
            }
        } catch (error) {
            //alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProfile();
    }, [session]);

    async function updateProfile({
        userAddress,
    } : {
        userAddress: Profiles['address']
    }) {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user authenticated');
            const updates = {
                id: session?.user?.id,
                address,
                updated_at: new Date().toISOString(),
            }
            let { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Off-chain PROFILE updated')
        } catch (error) {
            alert('Error updating your off-chain profile data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div>Loading</div>
        );
    }

    if (!userAddress) {
        return (
            <div>Please authenticate via Metamask</div>
        )
    }

    function updateProfileButton() {
        updateProfile(userAddress);
    }

    return (
        <div>
            <button onClick={updateProfileButton}>Update profile</button>
        </div>
    )
}