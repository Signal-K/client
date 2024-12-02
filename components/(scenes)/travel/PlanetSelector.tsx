'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Planet } from '@/types/Travel';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import BoardingPass from './BoardingPass';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface PlanetSelectorProps {
  user: User
  onSelect: (planet: Planet) => void
};

const initialPlanets: Planet[] = [
  {
    id: 'mars',
    name: 'MARS',
    station: 'Olympus Base',
    image: '/placeholder.svg?height=400&width=400',
    color: '#FF4D4D',
    temperature: -63,
    type: 'intra-solar',
    planetType: 'Terrestrial',
    description: 'The Red Planet, fourth from the Sun.',
    orbitPosition: 0,
    available: true
  },
  {
    id: 'moon',
    name: 'MOON',
    station: 'Tranquility Base',
    image: '/placeholder.svg?height=400&width=400',
    color: '#F7F5E9',
    temperature: -20,
    planetType: 'Terrestrial',
    type: 'intra-solar',
    description: 'Earth\'s only natural satellite.',
    orbitPosition: 1,
    available: true
  },
  {
    id: 'europa',
    name: 'EUROPA',
    station: 'Galileo Station',
    image: '/placeholder.svg?height=400&width=400',
    color: '#5FCBC3',
    temperature: -160,
    planetType: "Frozen",
    type: 'intra-solar',
    description: 'Jupiter\'s icy moon with a subsurface ocean.',
    orbitPosition: 2,
    available: false
  },
  {
    id: 'venus',
    name: 'VENUS',
    station: 'Cloud City',
    image: '/placeholder.svg?height=400&width=400',
    color: '#FFD700',
    temperature: 462,
    planetType: "Hellish",
    type: 'intra-solar',
    description: 'The hottest planet in our solar system.',
    orbitPosition: 3,
    available: false
  },
]

const getParentStarColor = (type: 'intra-solar' | 'interstellar') => {
  if (type === 'intra-solar') {
    return 'bg-gradient-radial from-yellow-400 to-orange-500';
  }
  const hue = Math.floor(Math.random() * 60);
  return `bg-gradient-radial from-[hsl(${hue},100%,50%)] to-[hsl(${hue},100%,30%)]`;
};

export default function PlanetSelector({ user, onSelect }: PlanetSelectorProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [planets, setPlanets] = useState<Planet[]>([...initialPlanets]); // Use renamed constant here
    const [selectedPlanet, setSelectedPlanet] = useState<Planet>(initialPlanets[0]);
    const [selectedType, setSelectedType] = useState<'intra-solar' | 'interstellar'>('intra-solar');
    const [isBooked, setIsBooked] = useState(false);
  
    useEffect(() => {
        const fetchExoplanets = async () => {
            try {
              const userId = session?.user?.id; // Ensure `session.user.id` is available
              if (!userId) {
                console.error('User is not logged in');
                return;
              }
          
              // Fetch classifications first
              const { data: classifications, error: classificationsError } = await supabase
                .from('classifications')
                .select('anomaly')
                .eq('author', userId)
                .neq('anomaly', null);
          
              if (classificationsError) throw classificationsError;
          
              // Extract anomaly IDs
              const anomalyIds = classifications.map((classification) => classification.anomaly);
          
              if (anomalyIds.length === 0) {
                console.warn('No anomalies found for the user.');
                return;
              }
          
              // Fetch anomalies using the anomaly IDs
              const { data, error } = await supabase
                .from('anomalies')
                .select(`
                  id,
                  content,
                  anomalytype,
                  avatar_url,
                  anomalySet
                `)
                .in('id', anomalyIds)
                .eq('anomalySet', 'tess');
          
              if (error) throw error;
          
              // Map data to Planet objects
              const exoplanetsData: Planet[] = data.map((exoplanet) => ({
                id: exoplanet.id as string,
                name: exoplanet.content || 'Unknown Name',
                color: '#5FCBC3',
                station: 'Unknown Station',
                temperature: NaN, // No temperature in the query
                planetType: exoplanet.anomalytype || 'Unknown',
                type: 'interstellar',
                description: exoplanet.content || 'No description available',
                image: exoplanet.avatar_url || '/assets/Planets/DefaultExoplanet.png',
                orbitPosition: Math.floor(Math.random() * 5),
                available: true,
              }));
          
              setPlanets((prevPlanets) => [...prevPlanets, ...exoplanetsData]);
            } catch (error) {
              console.error('Error fetching exoplanets:', error);
            }
          };
          
      
        fetchExoplanets();
      }, [supabase, session]);      
  
    const filteredPlanets = planets.filter((planet) => planet.type === selectedType);
  
    const handlePlanetSelect = (planet: Planet) => {
      if (planet.available) {
        setSelectedPlanet(planet);
        setIsBooked(false);
      }
    };
  
    const handleBook = () => {
      setIsBooked(true);
      onSelect(selectedPlanet);
    };
  
    const handleBeginTrip = () => {
      console.log('Beginning trip to', selectedPlanet.name);
    };
  
    if (isBooked) {
      return (
        <BoardingPass
          planet={selectedPlanet}
          user={user}
          onBeginTrip={handleBeginTrip}
          onCancelBooking={() => setIsBooked(false)}
        />
      );
    }

  return (
    <div className="min-h-screen p-6 sm:p-8 md:p-10 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <span className="text-sm text-[#F7F5E9]/60">Welcome,</span>
          <h1 className="text-xl font-medium">{user.name}</h1>
        </div>
        <Image
          src={user.avatar}
          alt="User avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
      </header>

      <div className="flex-grow flex flex-col justify-between space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-4xl font-bold mb-2">Let's book your</h2>
          <h2 className="text-4xl font-bold text-[#5FCBC3]">trip to</h2>
        </div>

        <div className="flex justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
          <button
            className={`px-4 py-2 rounded-full ${selectedType === 'intra-solar' ? 'bg-[#5FCBC3] text-[#1D2833]' : 'bg-[#2C4F64] text-[#F7F5E9]'}`}
            onClick={() => setSelectedType('intra-solar')}
          >
            Intra-Solar
          </button>
          <button
            className={`px-4 py-2 rounded-full ${selectedType === 'interstellar' ? 'bg-[#5FCBC3] text-[#1D2833]' : 'bg-[#2C4F64] text-[#F7F5E9]'}`}
            onClick={() => setSelectedType('interstellar')}
          >
            Interstellar
          </button>
        </div>

        <div className="relative px-4 sm:px-8">
          <div className="absolute left-4 right-4 sm:left-8 sm:right-8 h-1 bg-[#2C4F64] top-1/2 -translate-y-1/2">
            <div 
              className="absolute inset-y-0 left-0 bg-[#5FCBC3] transition-all duration-300 ease-in-out"
              style={{ width: `${((filteredPlanets.findIndex(p => p.id === selectedPlanet.id) + 1) / filteredPlanets.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between relative">
            {filteredPlanets.map((planet, index) => (
              <motion.div
                key={planet.id}
                className={`w-3 h-3 rounded-full cursor-pointer relative group ${planet.available ? 'bg-[#2C4F64]' : 'bg-[#4A4A4A]'}`}
                whileHover={{ scale: 1.2 }}
                onClick={() => handlePlanetSelect(planet)}
                style={{
                  backgroundColor: planet.id === selectedPlanet.id ? planet.color : (planet.available ? '#2C4F64' : '#4A4A4A')
                }}
              >
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-sm font-medium ${planet.available ? '' : 'text-[#4A4A4A]'}`}>{planet.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="relative w-full max-w-lg mx-auto mt-8 aspect-[4/3]"
          key={selectedPlanet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={selectedPlanet.image}
            alt={selectedPlanet.name}
            fill
            className="rounded-3xl object-cover"
          />
          <div className={`absolute top-4 right-4 w-16 h-16 rounded-full ${getParentStarColor(selectedPlanet.type)}`}></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#1D2833] to-transparent">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1">{selectedPlanet.name}</h3>
                <p className="text-xs sm:text-sm text-[#F7F5E9]/60">{selectedPlanet.station}</p>
              </div>
              <button
                onClick={handleBook}
                className={`px-4 py-2 rounded-full flex items-center justify-center transition-colors ${
                  selectedPlanet.available 
                    ? 'bg-[#5FCBC3] hover:bg-[#B9E678] text-[#1D2833]' 
                    : 'bg-[#4A4A4A] cursor-not-allowed text-[#F7F5E9]'
                }`}
                disabled={!selectedPlanet.available}
              >
                Book Trip
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};