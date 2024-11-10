import React, { useEffect, useState } from "react";
import { telescopeDataSources } from "@/components/Data/ZoodexDataSources";
import { TelescopeIcon } from "lucide-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const TelescopeComponent: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [configuration, setConfiguration] = useState<any>(null);
    const [hasTelescope, setHasTelescope] = useState<boolean>(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    useEffect(() => {
        const fetchConfiguration = async () => {
            if (!session || !activePlanet) {
                return;
            }

            const { data: inventoryData, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('item', 3103)
                .eq('anomaly', activePlanet.id);

            if (inventoryData && inventoryData.length > 0) {
                setConfiguration(inventoryData[0].configuration);
            } else {
                setHasTelescope(false);
            }
        };
        fetchConfiguration();
    }, [session, activePlanet, supabase]);

    if (!hasTelescope) {
        return <div>You don't have a telescope in your inventory.</div>;
    } 

    if (!configuration) {
        return <div>Loading configuration...</div>;
    }

    const unlockedMissions = configuration['missions unlocked'] || [];
    const availableProjects = telescopeDataSources
        .flatMap(category => category.items)
        .filter(project => unlockedMissions.includes(project.identifier));

    return (
        <div className="telescope-component">
            <h2>Telescope Projects</h2>
            <div className="project-buttons">
                {availableProjects.length > 0 ? (
                    availableProjects.map((project, index) => (
                        <button
                            key={index}
                            className="project-button"
                            onClick={() => setSelectedProject(project)}
                        >
                            <TelescopeIcon className="icon" />
                            {project.name}
                        </button>
                    ))
                ) : (
                    <p>No missions unlocked yet for this telescope.</p>
                )}
            </div>

            {selectedProject && (
                <div className="project-component">
                    <h3>{selectedProject.name}</h3>
                    {selectedProject.dynamicComponent}
                </div>
            )}
        </div>
    );
};

export default TelescopeComponent;