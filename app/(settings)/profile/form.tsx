import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect } from "react";
import UserAvatar from "./Avatar"; 

export default function ProfileCardModal() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState<string | undefined>(undefined);
    const [full_name, setFull_name] = useState<string | undefined>(undefined);
    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

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

    async function updateProfile(event: React.FormEvent) {
        event.preventDefault();

        if (!username || !session?.user?.email) {
            setError("Username and email are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const updates = {
            id: session?.user?.id,
            username,
            full_name,
            avatar_url,
            updated_at: new Date(),
        };

        const { error } = await supabase.from("profiles").upsert(updates);

        if (error) {
            alert(error.message);
        } else {
            await checkAndCreateMission(); // Check and create the mission after updating the profile
        }

        setLoading(false);
    }

    async function checkAndCreateMission() {
        try {
            const { data: existingMissions, error: checkError } = await supabase
                .from("missions")
                .select("id")
                .eq("user", session?.user?.id)
                .eq("mission", 1370102);

            if (checkError) {
                throw checkError;
            }

            if (existingMissions.length === 0) {
                const missionData = {
                    user: session?.user?.id,
                    time_of_completion: new Date().toISOString(),
                    mission: 1370102,
                    configuration: null,
                    rewarded_items: [], // Add any rewarded items if applicable
                };

                const { error: missionError } = await supabase.from("missions").insert([missionData]);

                if (missionError) {
                    throw missionError;
                }

                console.log('Mission 1370102 created successfully.');
            } else {
                console.log('Mission 1370102 already completed.');
            }
        } catch (error: any) {
            console.error('Error checking or creating mission:', error);
        }
    }

    return (
        <form onSubmit={(e) => updateProfile(e)} className="form-widget p-6 rounded-md shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#85DDA2]">Edit profile</h2>
            <p className="text-[#85DDA2] mb-6">Provide details about yourself and any other pertinent information.</p>
            <div className="mb-4">
                <label htmlFor="avatar" className="block text-sm font-medium text-[#85DDA2]">Profile avatar</label>
                <UserAvatar
                    url={avatar_url}
                    size={150}
                    onUpload={(url) => setAvatarUrl(url)}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="full_name" className="block text-sm font-bold text-[#85DDA2]">Full name</label>
                <input
                    id="full_name"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={full_name || ''}
                    onChange={(e) => setFull_name(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-[#85DDA2]">Username</label>
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
                <label htmlFor="email" className="block text-sm font-medium text-[#85DDA2]">Email: </label>
                <input
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    id="email"
                    type="text"
                    value={session?.user?.email || ''}
                    disabled
                />
            </div>
            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}
            <div>
                <button
                    type="submit"
                    className="block w-full bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={loading}
                >
                    {loading ? "Loading ..." : "Update profile"}
                </button>
            </div>
        </form>
    );
};