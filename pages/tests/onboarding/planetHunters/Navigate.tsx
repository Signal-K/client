import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import { useSession } from "@supabase/auth-helpers-react";
import Login from "../../../login";
import NavigateComponent from "../../../../components/onboarding/LightKurve/__Navigate";

export default function StarSailorsEmergence1 () {
    const session = useSession();

    if (!session) return (
        <CoreLayout>
            <Login />
        </CoreLayout>
    )

    return (
        <CoreLayout>
            <NavigateComponent />
        </CoreLayout>
    );
};