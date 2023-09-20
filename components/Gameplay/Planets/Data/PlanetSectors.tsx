import React from 'react';

interface Sector {
  id: number;
  metadata: string;
  // Add more fields as needed
}

interface PlanetSectorsProps {
  sectors: Sector[];
}

const PlanetSectors: React.FC<PlanetSectorsProps> = ({ sectors }) => {
  return (
    <div className="sector-container">
      {sectors.map((sector, index) => (
        <div key={index} className="sector">
          <div className="sector-number">{index + 1}</div>
          <div className="sector-metadata">{sector.metadata}</div>
          {/* Add more sector information here */}
        </div>
      ))}
    </div>
  );
};

export default PlanetSectors;