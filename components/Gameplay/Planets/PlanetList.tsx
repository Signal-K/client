import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Table } from "react-bootstrap";

import Login from "../../../pages/login";
import DashboardLayout from "../../Tests/Layout/Dashboard";

interface Planet {
  id: number;
  content: string; // Add other properties as needed
  radius: number;
  ticId: string;
}

interface PlanetListProps {
  id: string; // Assuming id is a string, adjust the type if needed
}

export default function PlanetList({ id }: PlanetListProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]); // Specify the type for planets

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async () => {
    try {
      const { data, error } = await supabase
        .from("planetsss") // Specify the type for the table and data
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .lt("id", 52);

      if (data != null) {
        setPlanets(data);
      }

      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!session) {
    return <Login />;
  }

  return (
    <center>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Name</th>
            <th>Radius</th>
            <th>TIC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet) => (
            <tr key={planet.id}>
              <td>{planet.content}</td>
              <td>{planet.radius}</td>
              <td>{planet.ticId}</td>
              <td>
                <a href={`/planets/${id}`}>Explore</a>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </center>
  );
}