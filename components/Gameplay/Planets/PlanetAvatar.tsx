import React, { useState, useEffect } from "react";

import { Database } from "../../../utils/database.types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetAvatar ({ uid, url, size, /*onUpload*/ }: {
    uid: string,
    url: Planets['avatar_url'],
    size: number,
}) {
    let width = 'w-12';
    const [uploading, setUploading] = useState(false); // Uploading/updating avatar should only be supported if user owns the object/entity. Either the avatar or cover should be an image/source of the entity

    const supabase = useSupabaseClient<Database>();
    const [avatarUrl, setAvatarUrl] = useState<Planets['avatar_url']>(null);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage (path: string) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) { throw error; };
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading avatar for planet anomaly: ', error);
        };
    };

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => { // Keep this function disabled until we've set up a differentiation between the upload behaviour (and backend structure) of profile avatars & planet/datapoint avatars
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) { // If there is no file selected
                throw new Error('You must select an image to upload');
            };

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${uid}.${fileExt}`;
            const filePath = `${fileName}`;
            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })
            if (uploadError) {
                throw uploadError;
            };
            
            //onUpload(filePath);
        } catch (error) {
            alert('Error uploading avatar, check console');
            console.log(error);
        } finally {
            setUploading(false);
        }
    }

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