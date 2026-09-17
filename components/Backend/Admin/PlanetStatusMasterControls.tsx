import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Login from "../../../pages/login";

interface Planet {
    id: number;
    content: string;
}

const AdminPlanetStatusUpdater: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    if (!session) {
        return (
            <Login />
        )
    }

    const [planets, setPlanets] = useState<Planet[]>([]);
    useEffect(() => {
        fetchPlanets();
    }, []);

    const fetchPlanets = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .select('id, content')
            if (error) {
                console.error('Error fetching planets: ', error)
            } else {
                setPlanets(data);
            }
        } catch (error) {  
            console.error('Error fetching planets: ', error);
        };
    };

    const updatePlanetStatus = async (planetId: number) => {
        try {
            const { error } = await supabase.from('planet_status').upsert({
                planet_id: planetId,
                status: 'in progress',
                updated_by: ''
            });
            if (error) {
                console.error('Error updating planet status: ', error);
            } else { console.log('Planet status updated successfully'); };
        } catch (error) {
            console.error('Error updating planet status:', error);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800">Admin component</h2>
            {planets.map((planet) => (
                <div key={planet.id}>
                    <p>{planet.content}</p>
                    <button onClick={() => updatePlanetStatus(planet.id)}>Update status</button>
                </div>
            ))};
        </div>
    );
};

export default AdminPlanetStatusUpdater;