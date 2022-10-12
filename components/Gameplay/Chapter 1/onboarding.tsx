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

    async function updateUserLocation() {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ location: 3 })
                .eq('id', session?.user?.id);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error updating your profile's location: ", error.message);
        }
    };

    if (loading) {
        return (
            <>
            <style jsx global>
            {`
              body {
                background: url('/') center/cover;
                background-attachment: fixed;
              }
  
              @media only screen and (max-width: 767px) {
                .planet-heading {
                  color: white;
                  font-size: 24px;
                  text-align: center;
                  margin-bottom: 10px;
                }
              }
            `}
          </style>
        <p>Loading...

        </p></>
        )
    }

    if (!session) {
        return (
            <p>Please sign in</p>
        )
    };

    if (!profile) {
        return <p>No profile found</p>;
    }

    // Checking if profile location is one of the specified values
    if ([1, 2, 3, 4, 5, 6].includes(profile.location)) {
        return (
            <div>
                <p>Name: {profile.username}</p>
                <p>Location: {profile.location}</p>
            </div>
        );
    };

    return (
        <div>
            <p>Set your location</p>
            <button onClick={updateUserLocation}>Click me!</button>
        </div>
    );
};
