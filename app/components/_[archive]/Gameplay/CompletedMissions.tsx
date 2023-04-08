import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Mission {
    id: number;
    name: string;
    description: string;
    rewards: number[]; // Array of reward item IDs
}

export default function CompletedMissionGroups() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);

    useEffect(() => {
        async function fetchMissions() {
            try {
                const res = await fetch("/api/gameplay/missions");
                const data = await res.json();
                setMissions(data);
            } catch (error) {
                console.error("Error fetching missions:", error);
            }
        }
        fetchMissions();
        fetchCompletedMissions();
    }, []);

    async function fetchCompletedMissions() {
        if (session && session.user) {
            console.log("Session User ID:", session.user.id);
            try {
                const { data, error } = await supabase
                    .from("missions")
                    .select("mission")
                    .eq("user", session.user.id);
                console.log("Completed Missions Data:", data);
                console.log("Error:", error);
                if (error) throw error;
                if (data) {
                    const completedMissionIds = data.map((mission) => mission.mission);
                    console.log("Completed Mission IDs:", completedMissionIds);
                    setCompletedMissions(completedMissionIds);
                }
            } catch (error: any) {
                console.error("Error fetching completed missions:", error.message);
            }
        }
    }
        

    const renderMissions = () => {
        console.log("Completed Missions:", completedMissions);
        console.log("All Missions:", missions);
        return missions.map((mission) => (
            <div key={mission.id}>
                <span style={{ textDecoration: completedMissions.includes(mission.id) ? "line-through" : "none" }}>
                    {mission.name}
                </span>
            </div>
        ));
    };    

    return (
        <div>
            <h2>Completed Missions</h2>
            {renderMissions()}
        </div>
    );
}
