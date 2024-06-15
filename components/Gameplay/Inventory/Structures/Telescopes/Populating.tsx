"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export const SurveyorStructureModal: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [isActionDone, setIsActionDone] = useState(false);
    const { activePlanet } = useActivePlanet();
    const [configuration, setConfiguration] = useState<any>(null); // Adjust type as per your configuration structure

    useEffect(() => {
        async function fetchConfiguration() {
            try {
                const { data, error } = await supabase
                    .from('anomalies')
                    .select('configuration')
                    .eq('id', activePlanet?.id)
                    .single();

                if (error) {
                    throw error;
                }

                setConfiguration(data?.configuration);
            } catch (error: any) {
                console.error('Error fetching configuration:', error.message);
            }
        }

        fetchConfiguration();
    }, [activePlanet, supabase]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    {/* <h2 className="text-xl font-bold">{structure.name}</h2> */}
                </div>
                <div className="flex flex-col items-center mt-4">
                    {configuration && (
                        <div>
                            <p>Configuration ID: {configuration.id}</p> {/* Adjust according to your configuration structure */}
                            <p>Configuration Name: {configuration.name}</p> {/* Example fields, adjust as per your structure */}
                            {/* Render other configuration details */}
                        </div>
                    )}
                    {!configuration && <p>Loading configuration...</p>}
                </div>
            </div>
        </div>
    );
};