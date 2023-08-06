import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, ButtonGroup, ToggleButton } from "react-bootstrap";

import Login from "../../../pages/login";
import PlanetGalleryCard from "../../Gameplay/Planets/PlanetGalleryCard";

export default function Crucible1BaseplanetList () {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(1);

  useEffect(() => {
    getPlanets();
  }, [session, selectedDifficulty]);

  const getPlanets = async () => {
    try {
      let query = supabase
        .from("planetsss")
        .select("*")
        .order("created_at", { ascending: false })
        .in("id", [47, 50, 51]); // Filter by specific IDs

      const { data, error } = await query;

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

  const buttonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "black",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    marginRight: "8px",
  };

  const activeButtonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  };

  if (!session) {
    return <Login />;
  }

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