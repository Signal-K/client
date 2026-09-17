export interface Planet {
    id: string;
    name: string;
    type: 'intra-solar' | 'interstellar';
    image: string;
    temperature: number;
    station: string;
    description: string;
    color: string;
    planetType: 'Unknown' | 'Terrestrial' | 'Gas Giant' | 'Ice Giant' | 'Dwarf Planet' | 'Lush' | string;
    orbitPosition: number;
    available: boolean;
};
  
export interface User {
    id: string;
    name: string;
    avatar: string;
    frequentFlyerNumber: string;
    frequentFlyerStatus: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
};
  
export interface Departure {
    id: string;
    rocketType: string;
    departureTime: string;
    price: number;
    duration: string;
    gate: string;
};
  
export interface BookingDetails {
    user: User;
    planet: Planet;
    departure: Departure;
};