import React, { useState } from 'react';

interface Sector {
  id: number;
  metadata: string;
  // Add more fields as needed
}

interface SectorGridProps {
  sectors: Sector[];
}

const SectorGrid: React.FC<SectorGridProps> = ({ sectors }) => {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  const handleHexagonClick = (sector: Sector) => {
    setSelectedSector(sector);
  };

  return (
    <div className="sector-grid">
      {sectors.map((sector, index) => (
        <div key={index} className="hexagon" onClick={() => handleHexagonClick(sector)}>
          <div className="sector-number">{index + 1}</div>
        </div>
      ))}
      {selectedSector && (
        <div className="sector-info">
          <h2>Sector Information</h2>
          <p>ID: {selectedSector.id}</p>
          <p>Metadata: {selectedSector.metadata}</p>
          {/* Add more sector information here */}
        </div>
      )}
    </div>
  );
};

export default SectorGrid;