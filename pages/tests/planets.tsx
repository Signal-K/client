import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row } from "react-bootstrap";

import Login from "../login";
import { PlanetGalleryCardGarden } from "../../components/Gameplay/Planets/PlanetGalleryCard";
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
        .order("difficulty", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(20)
        .gte("id", 45)
        .lt("id", 102);
  
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

  // if (!session) {
  //   return <Login />;
  // }

  return (
    // <DashboardLayout>
    <CoreLayout>
      <Container>
        <Row className="mb-20">
          {planets.map((planet) => (
            <PlanetGalleryCardGarden key={planet.id} planet={planet} />
          ))}
        </Row>
      </Container>
    </CoreLayout>
  );
}

export function PlanetGalleryIndexComp() {
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
        .order("difficulty", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(4)
        .gte("id", 45)
        .lt("id", 102);
  
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

  // if (!session) {
  //   return <Login />;
  // }

  return (
        <Row className="mb-20">
          {planets.map((planet) => (
            <PlanetGalleryCardGarden key={planet.id} planet={planet} />
          ))}
        </Row>
  );
}