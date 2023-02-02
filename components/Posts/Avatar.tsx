import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '../../styles/social-graph/PostForm.module.css';
import { Database } from '../../utils/database.types';
import { useState, useEffect } from 'react';

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function Avatar () {
    return (
        <div>
            <div className={styles.avatarWrapper}><img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" /></div>
        </div>
    )
}

export function AvatarFromTable ({
    uid,
    url,
    size
}: {
    uid: string,
    url: Profiles['avatar_url']
    size: number
}) {
    const supabase = useSupabaseClient<Database>();
    const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);

    async function downloadImage( path: string ) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            };
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading user avatar: ', error);
        }
    }
    
    return (
        <div>
            <div className={styles.avatarWrapper}>
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt='Avatar'
                        className="avatar image"
                        style={{ height: size, width: size }}
                    />
                ) : (
                    <div className="avatar no-image" style={{ height: size, width: size }} />
                )}
                <img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" />
            </div>
        </div>
    )
}

export function BigAvatar () {
    return (
        <div>
            <div className={styles.bigAvatarWrapper}><img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" /></div>
        </div>
    )
}