import React from 'react';
import { Departure } from '@/types/Travel';

interface DepartureListProps {
  departures: Departure[];
  onSelect: (departure: Departure) => void;
  selectedDeparture: Departure | null;
}

const DepartureList: React.FC<DepartureListProps> = ({ departures, onSelect, selectedDeparture }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-[#B9E678]">Select Your Departure</h2>
      <ul className="space-y-2">
        {departures.map(departure => (
          <li
            key={departure.id}
            className={`cursor-pointer p-2 rounded-md transition-colors ${
              selectedDeparture?.id === departure.id ? 'bg-[#2C4F64]' : 'hover:bg-[#2C4F64]'
            }`}
            onClick={() => onSelect(departure)}
          >
            <span className="font-semibold">{departure.rocketType}</span> - Departs at{' '}
            {new Date(departure.departureTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepartureList;