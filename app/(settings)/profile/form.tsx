"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect, FormEvent } from "react";
import UserAvatar from "./Avatar";

interface ProfileCardModalProps {
    avatarUrl: string | undefined;
};

export default function ProfileCardModal() { 
    const supabase = useSupabaseClient();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string | undefined>(undefined);
    const [full_name, setFull_name] = useState<string | undefined>(undefined);
    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        let ignore = false;
        async function getProfile() {
            setLoading(true);

            const { data, error } = await supabase
                .from("profiles")
                .select(`username, full_name, avatar_url`)
                .eq("id", session?.user?.id)
                .single();

            if (!ignore) {
                if (error) {
                    console.warn(error);
                } else if (data) {
                    setUsername(data.username);
                    setFull_name(data.full_name);
                    setAvatarUrl(data.avatar_url);
                }
            }

            setLoading(false);
        }

        getProfile();

        return () => {
            ignore = true;
        };
    }, [session, supabase]);

    async function updateProfile(event: React.ChangeEvent<HTMLInputElement>, avatarUrl: string | undefined) {
        event.preventDefault();

        setLoading(true);

        const updates = {
            id: session?.user?.id,
            username,
            full_name,
            avatar_url: avatarUrl,
            updated_at: new Date(),
        };

        const { error } = await supabase.from("profiles").upsert(updates);

        if (error) {
            alert(error.message);
        } else {
            setAvatarUrl(avatarUrl);
        }
        setLoading(false);
    }

    return (
        <form onSubmit={(e) => updateProfile(e as any, avatar_url)} className="form-widget bg-gray-50 p-6 rounded-md shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-red-800">Edit profile</h2>
            <p className="text-red-800 mb-6">Provide details about yourself and any other pertinent information.</p>
            <div className="mb-4">
                <label htmlFor="avatar" className="block text-sm font-medium text-red-800">Profile avatar</label>
                <UserAvatar
                    url={avatar_url}
                    size={150}
                    onUpload={(event, url) => {
                        updateProfile(event as React.ChangeEvent<HTMLInputElement>, url);
                    }}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="full_name" className="block text-sm font-bold text-red-800">Full name</label>
                <input
                    id="full_name"
                    type="url"
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={full_name || ''}
                    onChange={(e) => setFull_name(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-red-800">Username</label>
                <input
                    id="username"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-red-800">Email: </label>
                <input className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" id="email" type="text" value={session?.user?.email || ''} disabled />
            </div>
            <div>
                <button className="button block primary text-red-800" type="submit" disabled={loading}>
                    {loading ? "Loading ..." : "Update"}
                </button>
            </div>
        </form>
    );
}