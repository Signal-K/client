import React, { useEffect, useState } from "react";
import CoreLayout from "../../../components/Core/Layout";
import Instructions from "../../../components/onboarding/";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import BigProjectsSection from "../../../components/onboarding/Missions/MissionList";
import Card from "../../../components/Card";
import { Container } from "react-bootstrap";

export default function OnboardingSignupPage () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [hasGoldenTelescope, setHasRequiredItem] = useState(false);

    useEffect(() => { // Check if the user has the golden telescope to determine what missions to show to them
        async function checkForGoldenTelescope () {
            const { data: inventoryData, error: inventoryError } = await supabase
                .from("inventoryUSERS")
                .select("*")
                .eq('owner', session?.user?.id)
                .eq('item', 8);
            
                if (inventoryError) {
                    console.error('Error fetching inventory data: ' , inventoryError);
                    return (
                        <p>It appears we are having trouble fetching your inventory, please try again later</p>
                    );
                };

                setHasRequiredItem(inventoryData.length > 0);
        }

        checkForGoldenTelescope();
    }, [session]);

    if (hasGoldenTelescope === true) {
        return (
            <CoreLayout>
                <Container><BigProjectsSection /></Container>{/* <Instructions /> */}
            </CoreLayout>
        )
    }

    return (
        <CoreLayout>
            <Instructions />
        </CoreLayout>
    );
}; 