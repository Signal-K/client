"use client";

import { UserProfile, User } from "@/types/User";
import { Mission } from "@/types/Missions";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect, FormEvent } from "react";

interface ProfileModal {
    event: any;
    avatarUrl: any;
}

export default function ProfileCardModal() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [avatar_url, setAvatarUrl] = useState<string | null>(null);

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
                    setFullName(data.full_name);
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

    async function updateProfile(event: FormEvent<HTMLFormElement>, avatarUrl: string | null) {
        event.preventDefault();

        setLoading(true);

        const updates = {
            id: session?.user?.id,
            username,
            fullName,
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
        <form onSubmit={(e) => updateProfile(e, avatar_url)} className="form-widget">
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="text" value={session?.user?.email || ''} disabled />
            </div>
            <div>
                <label htmlFor="username">Name</label>
                <input
                    id="username"
                    type="text"
                    required
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    type="url"
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>

            <div>
                <button className="button block primary" type="submit" disabled={loading}>
                    {loading ? "Loading ..." : "Update"}
                </button>
            </div>

            <div>
                <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
                    Sign Out
                </button>
            </div>
        </form>
    );
};