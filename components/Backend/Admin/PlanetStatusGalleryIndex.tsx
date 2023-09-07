import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, ButtonGroup, ToggleButton } from "react-bootstrap";

import Login from "../../../pages/login";
import PlanetGalleryCard from "../../Gameplay/Planets/PlanetGalleryCard";
import DashboardLayout from "../../Tests/Layout/Dashboard";

export default function PlanetStatusGalleryIndex() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState([]);
  const [selectedClassificationStatus, setSelectedClassificationStatus] =
    useState<string | null>("incomplete");

  useEffect(() => {
    getPlanets();
  }, [session, selectedClassificationStatus]);

  const getPlanets = async () => {
    try {
      let query = supabase
        .from("planetsss")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
        .gte("id", 45)
        .lt("id", 102);

      if (selectedClassificationStatus !== null) {
        query = query.eq("classification_status", selectedClassificationStatus);
      } else {
        query = query.is("classification_status", null); // Filter planets with no classification_status
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

  const classificationStatusOptions = [
    { value: "incomplete", label: "Incomplete" },
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
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
    <DashboardLayout>
      <Container>
        <ButtonGroup className="mb-3">
          {classificationStatusOptions.map((option) => (
            <ToggleButton
              key={option.value}
              type="radio"
              variant="outline-secondary"
              name="classification_status"
              value={option.value}
              checked={selectedClassificationStatus === option.value}
              onChange={() => setSelectedClassificationStatus(option.value)}
              style={
                selectedClassificationStatus === option.value
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
    </DashboardLayout>
  );
}