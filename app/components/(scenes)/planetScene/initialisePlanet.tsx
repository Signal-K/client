"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface Mission {
    id: number;
    name: string;
    anomaly: number;
};

interface InitialisePlanetProps {
    planetId: number;
};

export default function InitialisePlanet({ planetId }: InitialisePlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasMission, setHasMission] = useState<boolean>(false);

    useEffect(() => {
        const fetchMission = async () => {
            const response = await fetch('/api/gameplay/missions/planets/initialisation');
            const missions: Mission[] = await response.json();

            const foundMission = missions.find(m => m.anomaly === planetId);
            setMission(foundMission || null);
            setLoading(false);
        };

        fetchMission();
    }, [planetId]);

    useEffect(() => {
        const checkExistingMission = async () => {
            if (!session || !mission) return;

            const { data, error } = await supabase
                .from("missions")
                .select("*")
                .eq("user", session.user.id)
                .eq("mission", mission.id);

            if (error) {
                console.error('Error checking existing missions: ', error.message);
                return;
            };

            setHasMission(data && data.length > 0);
        };

        checkExistingMission();
    }, [session, mission]);

    const handleInitialisePlanet = async () => {
        if (!session || !mission) return;

        const { error } = await supabase
            .from("missions")
            .insert([{ user: session.user.id, mission: mission.id }]);

        if (error) {
            console.error('Error creating mission: ', error.message);
        } else {
            console.log('Planet initialized successfully');
            setHasMission(true)
        };
    };

    if (loading) {
        return <p>Loading...</p>;
    };

    if (!mission) {
        return <p>No mission found for this planet.</p>;
    };

    if (hasMission) {
        return null;
    };

    return (
        <button
            onClick={handleInitialisePlanet}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700"
        >
            Initialise Planet
        </button>
    );
};