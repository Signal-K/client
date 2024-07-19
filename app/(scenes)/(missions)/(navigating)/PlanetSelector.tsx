"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Anomaly } from "@/types/Anomalies";
import { useActivePlanet } from "@/context/ActivePlanet";

const PlanetGrid: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [planets, setPlanets] = useState<Anomaly[]>([]);
    const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();
    
    const [loading, setLoading] = useState(false);

    const fetchAnomalies = async () => {
        const { data, error } = await supabase
          .from('anomalies')
          .select('id, anomalytype, avatar_url')
          .eq('anomalytype', 'planet');
    
        if (error) {
          console.error(error);
        } else {
          setPlanets(data);
        }
        setLoading(false);
    };

    const handlePlanetSelect = async (planetId: number) => {
        try {
          // Fetch the full details of the selected planet
          const { data: planetData, error: planetError } = await supabase
            .from('anomalies')
            .select('*')
            .eq('id', planetId)
            .single();
    
            if (planetError) {
                throw planetError;
            };
        
            if (!planetData) {
                throw new Error('Planet data not found');
            };
        
            // Update planet location with the planet id, not the whole object
            await updatePlanetLocation(planetId);
        
            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 1,
                configuration: null,
                rewarded_items: null,
            };
        
            const { data: newMission, error: missionError } = await supabase
                .from("missions")
                .insert([missionData]);
        
            if (missionError) {
                throw missionError;
            };

            const inventoryData = {
                item: 29,
                owner: session?.user?.id,
                quantity: 1,
                notes: "Created upon the completion of mission 1",
                parentItem: null,
                time_of_deploy: new Date().toISOString(),
                anomaly: planetData.id,
            };
    
            const { data: newInventoryEntry, error: inventoryError } = await supabase
                .from("inventory")
                .insert([inventoryData]);
        
            if (inventoryError) {
                throw inventoryError;
            };
    
            setActivePlanet(planetData); // Update the active planet in the context
        } catch (error: any) {
          console.error("Error handling planet selection:", error.message);
        };
    };

    useEffect(() => {
        fetchAnomalies();
    }, [supabase]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
            {planets.map((anomaly) => (
                <div
                    key={anomaly.id}
                    className="flex justify-center items-center p-1 cursor-pointer"
                    onClick={() => handlePlanetSelect(anomaly.id)}
                >
                    <img src={anomaly.avatar_url} alt={`Planet ${anomaly.id}`} className="w-24 h-24 object-cover" />
                </div>
            ))}
        </div>
    );
};

export default PlanetGrid;