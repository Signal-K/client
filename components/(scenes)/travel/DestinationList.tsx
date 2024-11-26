import React from 'react';
import { Destination } from '@/types/Travel';

interface DestinationListProps {
  destinations: Destination[];
  onSelect: (destination: Destination) => void;
  selectedDestination: Destination | null;
}

const DestinationList: React.FC<DestinationListProps> = ({ destinations, onSelect, selectedDestination }) => {
  const solarDestinations = destinations.filter(d => d.type === 'solar');
  const exoplanets = destinations.filter(d => d.type === 'exoplanet');

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-[#B9E678]">Select Your Destination</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-[#5FCBC3]">Solar System</h3>
          <ul className="space-y-2">
            {solarDestinations.map(destination => (
              <li
                key={destination.id}
                className={`cursor-pointer p-2 rounded-md transition-colors ${
                  selectedDestination?.id === destination.id ? 'bg-[#2C4F64]' : 'hover:bg-[#2C4F64]'
                }`}
                onClick={() => onSelect(destination)}
              >
                {destination.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-[#5FCBC3]">Exoplanets</h3>
          <ul className="space-y-2">
            {exoplanets.map(destination => (
              <li
                key={destination.id}
                className={`cursor-pointer p-2 rounded-md transition-colors ${
                  selectedDestination?.id === destination.id ? 'bg-[#2C4F64]' : 'hover:bg-[#2C4F64]'
                }`}
                onClick={() => onSelect(destination)}
              >
                {destination.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DestinationList;