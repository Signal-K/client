"use client";

import React from 'react';
import { lidarDataSources, roverDataSources, telescopeDataSources, zoodexDataSources } from '../../(structures)/Data/ZoodexDataSources';

interface Mission {
    name: string;
    description: string;
    identifier: string;
    researchId: string;
    researcher: string;
    unlocked: boolean;
    compatiblePlanetTypes: string[];
};

interface DataSource {
    category: string;
    items: Mission[];
};

interface MissionListProps {
    planetType: string;
};

const AvailableMissionsListForPlanet: React.FC<MissionListProps> = ({ planetType }) => {
    const allDataSources: DataSource[] = [
        ...zoodexDataSources,
        ...telescopeDataSources,
        ...lidarDataSources,
        ...roverDataSources,
    ];

    const compatibleMissions = allDataSources
        .flatMap(source => source.items)
        .filter(mission => mission.compatiblePlanetTypes.includes(planetType));

    return (
        <div>
            <h2>Available missions:</h2>
            {compatibleMissions.length > 0 ? (
                <ul>
                    {compatibleMissions.map(mission => (
                        <li key={mission.identifier}>
                            <h3><strong>{mission.name}</strong>: {mission.description}</h3>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No compatible missions available for {planetType}.</p>
            )}
        </div>
    );
};

export default AvailableMissionsListForPlanet;