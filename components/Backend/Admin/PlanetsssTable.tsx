import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Login from "../../../pages/login";

interface Planet {
  id: bigint;
  content: string;
  owner: string;
  created_at: string;
  media: any; // Update with the correct data type
  planets: string[]; // Update with the correct data type
  temperature: string;
  ownerAddress: string;
  avatar_url: string;
  cover: string;
  contract: string;
  ticId: string;
  orbital_period: number;
  radius: number;
  deepnote: string;
  difficulty: bigint;
}

const PlanetTable: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]);

//   if (!session) {
//     return <Login />
//   }

  useEffect(() => {
    fetchPlanets();
  }, []);

  const fetchPlanets = async () => {
    try {
        const { data, error } = await supabase.from("planetsss").select("*");

      if (data) {
        setPlanets(data);
      }

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error fetching planets:", error.message);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Content</th>
            <th>Owner</th>
            <th>Created At</th>
            <th>Media</th>
            <th>Planets</th>
            <th>Temperature</th>
            <th>Owner Address</th>
            <th>Avatar URL</th>
            <th>Cover</th>
            <th>Contract</th>
            <th>TIC ID</th>
            <th>Orbital Period</th>
            <th>Radius</th>
            <th>Deepnote</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet) => (
            <tr key={planet.id.toString()}>
              <td>{planet.id.toString()}</td>
              <td>{planet.content}</td>
              <td>{planet.owner}</td>
              <td>{planet.created_at}</td>
              {/* Add rendering logic for other columns */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetTable;