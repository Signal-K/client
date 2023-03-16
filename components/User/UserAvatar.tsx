import React, { useState, useEffect } from "react";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function UserAvatar ({
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

    const [uploading, setUploading] = useState(false);
    let width = 'w-12';

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage(path: string) { // Get the avatar url from Supabase for the user (if it exists)
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            };
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    };
};

export function UserPostAvatar ({
    url,
    size,
}: {
    url: Profiles['avatar_url']
    size: number
}) {
    const supabase = useSupabaseClient<Database>();
    const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);

    const [uploading, setUploading] = useState(false);
    let width = 'w-12';

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage(path: string) { // Get the avatar url from Supabase for the user (if it exists)
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            };
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    };

    return (
        <div className="${width} rounded-lg overflow-hidden">
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
        </div>
    );
}