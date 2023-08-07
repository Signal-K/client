import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button, Container, Grid, IconButton, Typography } from "@mui/material";

export default function FactionSelection() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [userFaction, setUserFaction] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      // Fetch the user's faction from the profile
      fetchUserFaction(session.user.id);
    }
  }, [session]);

  const fetchUserFaction = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("faction")
        .eq("id", userId)
        .single();

      if (data) {
        setUserFaction(data.faction);
      }

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error fetching user faction:", error.message);
    }
  };

  const updateFaction = async (faction: string) => {
    if (session?.user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert(
            [
              {
                id: session.user.id,
                faction,
              },
            ],
          );

        if (!error) {
          setUserFaction(faction);
        } else {
          throw error;
        }
      } catch (error: any) {
        console.error("Error updating user faction:", error.message);
      }
    }
  };

  const handleFactionSelect = (faction: string) => {
    if (userFaction !== faction) {
      updateFaction(faction);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Choose Your Faction
      </Typography>
      <Grid container>
        <Grid item xs={4}>
          <IconButton
            onClick={() => handleFactionSelect("Cartographer")}
            disabled={userFaction === "Cartographer"}
          >
            <img
                src="/assets/Onboarding/Missions/Emergence/Cartographer.png"
                alt="Transit Method"
                className="w-full"
            />
          </IconButton>
          <Typography variant="subtitle1">Cartographer</Typography>
        </Grid>
        <Grid item xs={4}>
          <IconButton
            onClick={() => handleFactionSelect("Guardian")}
            disabled={userFaction === "Guardian"}
          >
            <img
                src="/assets/Onboarding/Missions/Emergence/Guardian.png"
                alt="Transit Method"
                className="w-full"
            />
          </IconButton>
          <Typography variant="subtitle1">Guardian</Typography>
        </Grid>
        <Grid item xs={4}>
          <IconButton
            onClick={() => handleFactionSelect("Navigator")}
            disabled={userFaction === "Navigator"}
          >
            <img
                src="/assets/Onboarding/Missions/Emergence/Navigator.png"
                alt="Transit Method"
                className="w-full"
            />
          </IconButton>
          <Typography variant="subtitle1">Navigator</Typography>
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="primary"
        disabled={!userFaction}
        onClick={() => {}}
      >
        Choose Faction
      </Button>
    </Container>
  );
}