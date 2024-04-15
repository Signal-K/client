import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export function PickYourPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            supabase
                .from("profiles")
                .select()
                .eq("id", session.user.id)
                .then((result) => {
                    if (result.data && result.data.length > 0) {
                        setProfile(result.data[0]);
                    }
                    setLoading(false);
                })
        } else {
            setLoading(false);
        }
    }, [session]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!session) {
        return <p>Please sign in</p>;
    }

    if (profile) {
        return (
            <div>
                <p>Name: {profile.username}</p>
            </div>
        );
    };

    return <p>No profile found</p>;
};
