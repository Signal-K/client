import { useState, useEffect } from "react";
import { useUser, useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import { Database } from '../../utils/database.types';
import AccountAvatar from "./AccountAvatar";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function OffchainAccount({ session }: { session: Session}) {
    const supabase = useSupabaseClient<Database>();
    const user = useUser();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<Profiles['username']>(null);
    const [website, setWebsite] = useState<Profiles['website']>(null); // I believe this is the email field
    const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [address, setAddress] = useState<Profiles['address']>(null); // This should be set by the handler eventually (connected address).

    useEffect(() => {
        getProfile();
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, address`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
                setAddress(data.address);
            }
        } catch (error) {
            alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile({
        username,
        website,
        avatar_url,
        address,
    } : {
        username: Profiles['username']
        website: Profiles['website']
        avatar_url: Profiles['avatar_url']
        address: Profiles['address']
    }) {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated!');
            const updates = {
                id: user.id,
                username,
                website,
                avatar_url,
                address,
                updated_at: new Date().toISOString(),
            }
            let { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Off-chain Profile updated');
        } catch (error) {
            alert('Error updating your profile data:');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-widget">
            <AccountAvatar
                uid={user!.id}
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                    setAvatarUrl(url)
                    updateProfile({ username, website, avatar_url: url, address})
                }}
            />
            <div>
                <label htmlFor='email'>Email</label>
                <input id='email' type='text' value={session.user.email} disabled />
            </div>
            <div>
                <label htmlFor='username'>Username</label>
                <input
                    id='username'
                    type='text'
                    value={ username || '' }
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor='website'>Website</label>
                <input
                    id='website'
                    type='website'
                    value={ website || '' }
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor='address'>Address</label>
                <input
                    id='address'
                    type='text'
                    value={ address || '' }
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>
            <div>
                <button
                    className="button primary block"
                    onClick={() => updateProfile({ username, website, avatar_url, address })}
                    disabled={loading}
                >
                    {loading ? 'Loading ...' : 'Update'}
                </button>
            </div>
            <div>
                <button className="button block" onClick={() => supabase.auth.signOut()}>
                    Sign Out
                </button>
            </div>
        </div>
    )
}