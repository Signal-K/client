import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

export default function FactionSelection() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [userFaction, setUserFaction] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the user's current faction from the database
    fetchUserFaction();
  }, [session]);

  const fetchUserFaction = async () => {
    if (session?.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("faction")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setUserFaction(data.faction);
      }
    }
  };

  const factions = ["Cartographer", "Guardian", "Navigator"];

  const handleFactionSelection = async (faction: string) => {
    if (!session?.user) {
      return;
    }

    if (userFaction === faction) {
      return; // Don't update if the user is already part of this faction
    }

    const { error } = await supabase
  .from("profiles")
  .upsert(
    [{ id: session.user.id, faction: faction }]
  );
  

    if (!error) {
      setUserFaction(faction);
    }
  };

  return (
    <Container>
      <Row>
        {factions.map((faction, index) => (
          <Col key={index} className="text-center">
            <Image
              src={`/assets/Onboarding/Missions/Emergence/${faction}.png`}
              alt={faction}
              fluid
            />
            <h4>{faction}</h4>
            <DropdownButton
              variant="success"
              title={userFaction === faction ? "Chosen" : "Choose Faction"}
              disabled={userFaction === faction}
              id={`dropdown-faction-${faction}`}
            >
              <Dropdown.Item onClick={() => handleFactionSelection(faction)}>
                Select {faction}
              </Dropdown.Item>
            </DropdownButton>
          </Col>
        ))}
      </Row>
    </Container>
  );
}