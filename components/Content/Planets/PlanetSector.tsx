import React from "react";

interface Sector { 
    id: number;
    metadata: string;
};

interface PlanetSectorsProps {
    sectors: Sector[];
}

const PlanetSector: React.FC<PlanetSectorsProps> = ({ sectors }) => {
    return (
        <div className="sector-container">
            {sectors.map((sector, index) => (
                <div key={index} className="sector">
                    <div className="sector-number">{index + 1}</div>
                    <div className="sector-metadata">{sector.metadata}</div>
                </div>
            ))}
        </div>
    );
};

export default PlanetSector;