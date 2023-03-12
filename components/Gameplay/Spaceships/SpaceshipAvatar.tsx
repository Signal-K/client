import React, { useState, useEffect } from "react";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SpaceshipAvatar ({ uid, url, size }: {
    uid: string,
    url: string,
    size: number,
}) {
    let width = 'w-12';
    const [uploading, setUploading] = useState(false);

    const supabase = useSupabaseClient();
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage ( path: string ) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) { throw error; };
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading avatar for spaceship: ', error);
        };
    };

    return (
        <div className="${width} rounded-full overflow-hidden">
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
            {/*
            <div style={{ width: size }}>
                <label className="button primary block" htmlFor='single'>
                    {uploading ? 'Uploading ...': 'Upload'}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type='file'
                    id='single'
                    accept='image/*'
                    onChange={uploadAvatar}
                    disabled={uploading} // Disabled once upload button/process clicked/initiated
                />
            </div>
            */}
        </div>
    );
}