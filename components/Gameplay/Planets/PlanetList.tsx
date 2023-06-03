import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Table } from "react-bootstrap";

import Login from "../../../pages/login";
import DashboardLayout from "../../Tests/Layout/Dashboard";

export default function PlanetList(id) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState([]);

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async () => {
    try {
      const { data, error } = await supabase
        .from("planetsss")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .lt("id", 52); // Temporarily taking out planets that are incomplete
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