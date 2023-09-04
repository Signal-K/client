import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row } from "react-bootstrap";

import PlanetGalleryCard from "./PlanetGalleryCard";

interface Planet {
  id: number;
  // Add other properties here as needed
}

export default function PlanetGalleryIndexListTemplating() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]); // Specify the type for planets

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async () => {
    try {
      const { data, error } = await supabase
        .from<Planet>("planetsss") // Specify the type for the table
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .gte("id", 45)
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

  return (
    <Container>
      <Row>
        {planets.map((planet) => (
          <PlanetGalleryCard key={planet.id} planet={planet} />
        ))}
      </Row>
    </Container>
  );
}