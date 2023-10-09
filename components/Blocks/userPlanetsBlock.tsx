import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';

interface OwnedPlanet {
  id: number;
  planet_id: number;
}

interface Planet {
  id: number;
  content: string; // Changed 'name' to 'content' based on your interface definition
  cover: string; // Changed 'avatar_url' to 'cover' based on your interface definition
}

const OwnedPlanetsListBlock: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [ownedPlanets, setOwnedPlanets] = useState<OwnedPlanet[]>([]);
  const [planetDetails, setPlanetDetails] = useState<Planet[]>([]);

  useEffect(() => {
    async function fetchOwnedPlanets() {
      if (session) {
        try {
          const user = session.user.id;
          const { data, error } = await supabase
            .from('inventoryPLANETS')
            .select('*')
            .eq('owner_id', user)
            .limit(1);

          if (error) {
            throw error;
          }

          if (data) {
            setOwnedPlanets(data);
          }
        } catch (error) {
          console.error('Error fetching owned planets:', error);
        }
      }
    }

    fetchOwnedPlanets();
  }, [session]);

  useEffect(() => {
    async function fetchPlanetDetails() {
      if (ownedPlanets.length > 0) {
        const planetIds = ownedPlanets.map((planet) => planet.planet_id);
        const { data, error } = await supabase
          .from('planetsss')
          .select('*')
          .in('id', planetIds);

        if (error) {
          console.error('Error fetching planet details:', error);
        }

        if (data) {
          setPlanetDetails(data);
        }
      }
    }

    fetchPlanetDetails();
  }, [ownedPlanets]);

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Your recent classifications</h2>
        <ul className="grid gap-4">
          {planetDetails.map((planet) => (
            <Link legacyBehavior key={planet.id} href={`https://play.skinetics.tech/tests/planets/${planet.id}`}>
              <a>
                <li className="bg-white shadow-md p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">{planet?.content}</h3>
                  <div className="mb-2">
                    <img src={planet.cover} alt={planet?.content} className="w-full h-auto" />
                  </div>
                  {/* Add additional planet details here */}
                </li>
              </a>
            </Link>
          ))}
        </ul>
      </div>
      <br />
    </>
  );
};

export default OwnedPlanetsListBlock;