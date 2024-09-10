interface ClassificationResultProps {
    classificationConfiguration: { [key: string]: boolean } | null;
};

export const ClassificationResult: React.FC<ClassificationResultProps> = ({ classificationConfiguration }) => {
    if (!classificationConfiguration) return null; // Don't show if no classification data is available

    return (
        <div className="p-4 mt-4 w-full bg-[#4C566A] text-white rounded-md">
            <h3 className="text-lg font-bold mb-2">Classification Result</h3>
            <ul className="list-disc list-inside">
                {Object.entries(classificationConfiguration).map(([key, value]) => (
                    <li key={key}>
                        {key}: {value ? "Selected" : "Not Selected"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ClassificationOutputProps {
    configuration: {
        [key: string]: boolean;
    };
}

// Create a mapping between terrain types and mineral/item IDs
import React, { useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

// Create a mapping between terrain types and mineral/item IDs
const terrainToMineralsMap: { [key: string]: string[] } = {
    'Dried-up water channels': ['21', '13', '15'],
    'Pebbles/medium-sized rocks': ['13', '15', '16'],
    'Hills/mountain formations': ['19', '15', '20'],
    'Volcano (dormant/extinct)': ['20', '16', '13'],
    'Mineral deposits': ['17', '19', '15'],
    'Sandy/rocky terrain': ['13', '11', '17'],
};

interface ClassificationOutputProps {
    configuration: { [key: string]: boolean };
};

export const ClassificationOutput: React.FC<ClassificationOutputProps> = ({ configuration }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const { activePlanet } = useActivePlanet();

    // Get selected terrain types
    const selectedTerrainTypes = Object.keys(configuration).filter(key => configuration[key]);

    // Get minerals based on selected terrain types
    const selectedMinerals = selectedTerrainTypes.reduce<string[]>((acc, terrain) => {
        const minerals = terrainToMineralsMap[terrain] || [];
        return acc.concat(minerals);
    }, []);

    // Calculate mineral quantities
    const mineralQuantities: { [mineralId: string]: number } = selectedMinerals.reduce((acc, mineralId) => {
        acc[mineralId] = (acc[mineralId] || 0) + 1;
        return acc;
    }, {} as { [mineralId: string]: number });

    // Insert entries into mineralDeposits table
    const insertMineralDeposits = async () => {
        if (session && activePlanet) {
            try {
                // Prepare deposits with properly formatted mineralconfiguration
                const deposits = Object.entries(mineralQuantities).map(([mineralId, count]) => ({
                    anomaly: activePlanet.id,
                    owner: session.user.id,
                    mineralconfiguration: {
                        mineral: mineralId,
                        quantity: 7 * count // Quantity = 7 times the number of mentions
                    }
                }));
    
                const { data, error } = await supabase
                    .from('mineralDeposits')
                    .insert(deposits);
    
                if (error) {
                    console.error("Error inserting mineral deposits:", error.message);
                } else {
                    console.log("Mineral deposits inserted:", data);
                }
            } catch (error) {
                console.error("Error inserting mineral deposits:", error);
            }
        }
    };
    

    // Run insertion after component mounts or when configuration changes
    useEffect(() => {
        insertMineralDeposits();
    }, [configuration]);

    return (
        <div className="p-4 w-full max-w-4xl mx-auto rounded-lg h-full w-full bg-[#2C4F64]/30 text-white rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            <h2 className="text-xl font-bold mb-4">Classification Output</h2>

            <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Selected Terrain Types:</h3>
                <ul>
                    {selectedTerrainTypes.map((terrain, index) => (
                        <li key={index}>{terrain}</li>
                    ))}
                </ul>
            </div>

            {selectedMinerals.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                    <h3 className="font-semibold">Relevant Minerals/Items:</h3>
                    <ul>
                        {selectedMinerals.map((mineral, index) => (
                            <li key={index}>{mineral}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};