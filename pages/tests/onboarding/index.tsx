import React, { useEffect, useState } from "react";
import CoreLayout from "../../../components/Core/Layout";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../../components/Card";
import { Container } from "react-bootstrap";
import NewMissions from "../../../components/onboarding/Missions/NewMissions";
import NewMissionsFactionChosen from "../../../components/onboarding/Missions/Chapter2MissionBase";
import BigProjectsSection from "../../../components/onboarding/Missions/MissionList";
import NewMissionsPlanetsChosen from "../../../components/onboarding/Missions/Chapter3MissionBase";
import Login from "../../login";

export default function OnboardingSignupPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [hasGoldenTelescope, setHasRequiredItem] = useState(false);
  const [hasFaction, setHasFaction] = useState(false);
  const [hasMadePlanetPosts, setHasMadePlanetPosts] = useState(false);

  useEffect(() => {
    async function checkForGoldenTelescope() {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventoryUSERS")
        .select("*")
        .eq("owner", session?.user?.id)
        .eq("item", 8);

      if (inventoryError) {
        console.error("Error fetching inventory data: ", inventoryError);
        return;
      }

      setHasRequiredItem(inventoryData.length > 0);
    }

    async function checkForFaction() {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("faction")
        .eq("id", session?.user?.id);

      if (profileError) {
        console.error("Error fetching user profile: ", profileError);
        return;
      }

      setHasFaction(!!profileData[0]?.faction);
    }

    async function checkForPlanetPosts() {
      if (session?.user?.id) {
        const planetIdsToCheck = [47, 50, 51];

        // Fetch posts made by the user mentioning specific planet IDs
        const { data: postIds, error: postError } = await supabase
          .from("posts_duplicates")
          .select("id")
          .eq("author", session.user.id)
          .in("planets2", planetIdsToCheck);

        if (postError) {
          console.error("Error fetching posts: ", postError);
          return;
        }

        // Check if the user has made posts mentioning all specified planets
        setHasMadePlanetPosts(postIds.length === planetIdsToCheck.length);
      }
    }

    checkForGoldenTelescope();
    checkForFaction();
    checkForPlanetPosts();
  }, [session]);

  if (!session) return (
    <CoreLayout>
      <Login />
    </CoreLayout>
  )

  if (hasMadePlanetPosts && hasGoldenTelescope) {
    return (
      <CoreLayout>
        <Card noPadding={false}>
          <Container>
            <NewMissionsPlanetsChosen />
          </Container>
        </Card>
        <Card noPadding={false}><Container>
          <BigProjectsSection />
        </Container></Card>
      </CoreLayout>
    );
  }

  if (hasFaction) {
    return (
      <CoreLayout>
        <Card noPadding={false}>
          <Container>
            <NewMissionsFactionChosen />
          </Container>
        </Card>
        <Card noPadding={false}><Container>
          <BigProjectsSection />
        </Container></Card>
      </CoreLayout>
    );
  }

  if (hasGoldenTelescope) {
    return (
      <CoreLayout>
        <Card noPadding={false}>
          <Container>
            <NewMissions />
          </Container>
        </Card>
        <Card noPadding={false}><Container>
          <BigProjectsSection />
        </Container></Card>
      </CoreLayout>
    );
  }

  return (
    <CoreLayout>
      <Card noPadding={false}>
        <Container>
          <NewMissions />
        </Container>
      </Card>
    </CoreLayout>
  );
}