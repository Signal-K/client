import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link"; // Import Link from Next.js
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
  classification_status: string;
}

const PlanetTable: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]);

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

  // CSS styles as JavaScript objects
  const tableStyles = {
    width: "100%",
    overflowX: "auto" as React.CSSProperties["overflowX"],
  };

  const cellStyles = {
    padding: "8px 10px",
    border: "1px solid #ddd",
    textAlign: "left" as React.CSSProperties["textAlign"],
    cursor: "pointer", // Add cursor style to indicate clickable fields
  };

  return (
    <div style={tableStyles} className="mb-20">
      <div style={{ padding: "10px", whiteSpace: "nowrap" }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={{ ...cellStyles, backgroundColor: "#f2f2f2", fontWeight: "bold" }}>ID</th>
              <th style={cellStyles}>Content</th>
              <th style={cellStyles}>Owner</th>
              <th style={cellStyles}>Temperature</th>
              <th style={cellStyles}>Contract</th>
              <th style={cellStyles}>TIC ID</th>
              <th style={cellStyles}>Orbital Period</th>
              <th style={cellStyles}>Radius</th>
              <th style={cellStyles}>Classification Status</th>
              {/* Add other column headers here */}
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr key={planet.id.toString()}>
                <td style={cellStyles}>
                  <Link legacyBehavior  href={`/tests/planets/${planet.id}`}>
                    {/* Wrap in Link */}
                    {/* <a>{planet.id.toString()}</a> */}
                    <p>Hello</p>
                  </Link>
                </td>
                <td style={cellStyles}>{planet.content}</td>
                <td style={cellStyles}>{planet.owner}</td>
                <td style={cellStyles}>{planet.temperature}</td>
                <td style={cellStyles}>{planet.contract}</td>
                <td style={cellStyles}>{planet.ticId}</td>
                <td style={cellStyles}>{planet.orbital_period}</td>
                <td style={cellStyles}>{planet.radius}</td>
                <td style={cellStyles}>{planet.classification_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanetTable;