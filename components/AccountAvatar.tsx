import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row']

export default function AccountAvatar ({
    uid,
    url,
    size,
    //onUpload
}: {
    uid: string,
    url: Profiles['avatar_url']
    size: number
    //onUpload: (url: string) => void
}) {
    let width = 'w-12';
    //width = 'w-24 md:w-36';

    const supabase = useSupabaseClient<Database>();
    const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [uploading, setUploading] = useState(false);
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
    }

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
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
        </div>
    );
}

export function PostCardAvatar ({
    url,
    size,
    //onUpload
}: {
    url: Profiles['avatar_url']
    size: number
    //onUpload: (url: string) => void
}) {
    let width = 'w-12';
    //width = 'w-24 md:w-36';

    const supabase = useSupabaseClient<Database>();
    const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [uploading, setUploading] = useState(false);
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
        </div>
    );
}