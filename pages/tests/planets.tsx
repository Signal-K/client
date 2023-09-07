import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, ButtonGroup, ToggleButton } from "react-bootstrap";

import Login from "../login";
import PlanetGalleryCard from "../../components/Gameplay/Planets/PlanetGalleryCard";
import DashboardLayout from "../../components/Tests/Layout/Dashboard";
import CoreLayout from "../../components/Core/Layout";

export default function PlanetGalleryIndex() {
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
        .limit(20)
        .gte("id", 45)
        .lt("id", 102);

      if (selectedDifficulty !== null) {
        query = query.eq("difficulty", selectedDifficulty);
      } else {
        query = query.is("difficulty", null); // Filter planets with no difficulty
      }

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

  const difficultyOptions = [
    { value: 1, label: "Difficulty 1" },
    { value: 2, label: "Difficulty 2" },
    { value: 3, label: "Difficulty 3" },
  ];

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
    // <DashboardLayout>
    <CoreLayout>
      <Container>
        <ButtonGroup className="mb-3">
          {difficultyOptions.map((option) => (
            <ToggleButton
              key={option.value}
              type="radio"
              variant="outline-secondary"
              name="difficulty"
              value={option.value}
              checked={selectedDifficulty === option.value}
              onChange={() => setSelectedDifficulty(option.value)}
              style={
                selectedDifficulty === option.value
                  ? { ...buttonStyle, ...activeButtonStyle }
                  : buttonStyle
              }
            >
              {option.label}
            </ToggleButton>
          ))}
        </ButtonGroup>
        <Row>
          {planets.map((planet) => (
            <PlanetGalleryCard key={planet.id} planet={planet} />
          ))}
        </Row>
      </Container>
    </CoreLayout>
  );
}