import React from 'react';
import { PlanetGalleryIndexComp } from '../../../../pages/tests/planets';

interface Anomaly {
 id: string;
 name: string;
 icon: string;
}

interface GardenProps {
 anomalies: Anomaly[];
}

const Garden: React.FC<GardenProps> = ({ anomalies }) => {
 return (
    <div style={{ backgroundImage: `url('/garden.png')` }} className="bg-cover bg-center h-screen w-screen flex items-center justify-center relative">
   {/* <button className="p-2 bg-blue-500 text-white">Add Anomaly</button> */}
   <PlanetGalleryIndexComp />
     {anomalies.map((anomaly) => (
       <img key={anomaly.id} src={anomaly.icon} alt={anomaly.name} className="absolute top-0 left-0 w-16 h-16" />
     ))}
   </div>
 );
};

export default Garden;