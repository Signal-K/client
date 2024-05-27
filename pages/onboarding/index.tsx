import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function Onboarding() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet, setActivePlanet } = useActivePlanet();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activePlanet && activePlanet.id && session) {
            router.push("/");
        }
    }, [activePlanet, session, router]);

    const handleAssignLocation = async () => {
        setLoading(true);
        try {
            const randomLocation = Math.floor(Math.random() * 6) + 1;

            // Update the profile with the random location
            const { error: updateError } = await supabase
                .from("profiles")
                .upsert({ id: session?.user?.id, location: randomLocation });

            if (updateError) {
                throw updateError;
            }

            // Fetch the planet with the assigned location
            const { data: planetData, error: planetError } = await supabase
                .from("planets")
                .select("*")
                .eq("location", randomLocation)
                .single();

            if (planetError || !planetData) {
                throw planetError || new Error("Planet not found");
            }

            setActivePlanet(planetData); // Set the active planet

            // Redirect to the index page
            router.push("/");
        } catch (error) {
            console.error("Error assigning location:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Game</h1>
            <p className="mb-4">To get started, click the button below to assign your starting location.</p>
            <button
                onClick={handleAssignLocation}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {loading ? "Assigning..." : "Assign Location"}
            </button>
        </div>
    );
};
