import React, { useEffect, useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BirdIcon } from "lucide-react";
import { zoodexDataSources } from "@/components/Data/ZoodexDataSources";

const ZoodexComponent: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [configuration, setConfiguration] = useState<any>(null);
    const [hasZoodex, setHasZoodex] = useState<boolean>(true);

    useEffect(() => {
        const fetchConfiguration = async () => {
            if (!session || !activePlanet) {
                return;
            } 

            const { data: inventoryData, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('item', 3104)
                .eq('anomaly', activePlanet.id);

            if (inventoryData && inventoryData.length > 0) {
                setConfiguration(inventoryData[0].configuration);
            } else {
                setHasZoodex(false);
            }
        };
        fetchConfiguration();
    }, [session, activePlanet, supabase]);

    if (!hasZoodex) {
        return <div>You don't have a Zoodex in your inventory.</div>;
    }

    if (!configuration) {
        return <div>Loading configuration...</div>;
    }

    const unlockedMissions = configuration['missions unlocked'] || [];
    // const availableProjects = zoodexDataSources
    //     .flatMap(category => category.items)
    //     .filter(project => unlockedMissions.includes(project.identifier));

    return (
        <div className="zoodex-component">
            <h2>Zoodex Projects</h2>
            <div className="project-buttons">
                {/* {availableProjects.length > 0 ? (
                    availableProjects.map((project, index) => (
                        <button
                            key={index}
                            className="project-button"
                            // onClick={() => alert(`Opening ${project.name}`)}
                        >
                            <BirdIcon className="icon" />
                            {/* {project.name} 
                        </button>
                    ))
                ) : (
                    <p>No missions unlocked yet for this Zoodex.</p>
                )} */}
            </div>
        </div>
    );
};

export default ZoodexComponent;