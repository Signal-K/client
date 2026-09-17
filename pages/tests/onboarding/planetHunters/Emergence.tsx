import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import EmergenceComponent from "../../../../components/onboarding/LightKurve/__Emergence";
import { useSession } from "@supabase/auth-helpers-react";
import Login from "../../../login";

export default function StarSailorsEmergence1 () {
    const session = useSession();

    // if (!session) return (
    //     <CoreLayout>
    //         <Login />
    //     </CoreLayout>
    // )

    return (
        <CoreLayout>
            <EmergenceComponent />
        </CoreLayout>
    );
};