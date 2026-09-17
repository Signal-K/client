import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import { useSession } from "@supabase/auth-helpers-react";
import Login from "../../../login";
import SilfurComponentOnboarding3 from "../../../../components/onboarding/LightKurve/__Silfur";

export default function StarSailorsSilfur3 () {
    const session = useSession();

    // if (!session) return (
    //     <CoreLayout>
    //         <Login />
    //     </CoreLayout>
    // );

    return (
        <CoreLayout>
            <SilfurComponentOnboarding3 />
        </CoreLayout>
    )
}