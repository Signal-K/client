import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row } from "react-bootstrap";

import Login from "../login";
import PlanetGalleryCard from "../../components/Gameplay/Planets/PlanetGalleryCard";
import DashboardLayout from "../../components/Tests/Layout/Dashboard";
import CoreLayout from "../../components/Core/Layout";

export default function PlanetGalleryIndex() {
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
        .gte("id", 45) // Temporarily taking out planets that are incomplete
        .lt("id", 102);

      if (data != null) {
        setPlanets(data);
      }

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!session) {
    return <Login />;
  }

  return (
    <CoreLayout>
      <Container>
        <Row>
          {planets.map((planet) => (
            <PlanetGalleryCard key={planet.id} planet={planet} />
          ))}
        </Row>
      </Container>
    </CoreLayout>
  );
}
