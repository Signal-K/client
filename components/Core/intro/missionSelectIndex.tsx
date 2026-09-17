import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container } from "react-bootstrap";
import NewMissions from "../../onboarding/Missions/NewMissions";
import NewMissionsFactionChosen from "../../onboarding/Missions/Chapter2MissionBase";
import BigProjectsSection from "../../onboarding/Missions/MissionList";

export default function MissionSelectionForIndexPage () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [hasGoldenTelescope, setHasRequiredItem] = useState(false);
    const [hasFaction, setHasFaction] = useState(false);

    useEffect(() => {
        async function checkForGoldenTelescope () {
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

        async function checkForFaction () {
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

        checkForGoldenTelescope();
        checkForFaction();
    }, [session]);

    if (hasFaction) {
        return (
            <Container>
                <NewMissionsFactionChosen />
            </Container>
        );
    };

    if (hasGoldenTelescope) {
        return (
            <Container>
                <NewMissions />
            </Container>
        );
    };

    return (
        <></>
    );
};