import React from 'react';
import Layout from '../Section/Layout';
import Footer from '../Core/Footer';
import MusicPlayer from '../Core/assets/MusicPlayer';
import Bottombar from '../Core/BottomBar';
// import { PlanetGalleryIndexComp } from '../../../../pages/tests/planets';

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
    <div style={{ backgroundImage: `url('/bg.jpg')` }} className="bg-cover bg-center h-screen w-screen flex items-center justify-center relative">
   {/* <button className="p-2 bg-blue-500 text-white">Add Anomaly</button> */}
   {/* <PlanetGalleryIndexComp /> */}
     {anomalies.map((anomaly) => (
       <img key={anomaly.id} src={anomaly.icon} alt={anomaly.name} className="absolute top-0 left-0 w-16 h-16" />
     ))}
     <Bottombar />
   </div>
 );
};

export default Garden;