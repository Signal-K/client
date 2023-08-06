import React, { useEffect, useState } from "react";
import CoreLayout from "../../../../components/Core/Layout";
import OnboardingPopup from "../../../../components/onboarding/blocks/gamification/popup";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import CrucibleComponent from "../../../../components/onboarding/LightKurve/__Crucible";

export default function StarSailorsCrucible1 () {
    const supabase = useSupabaseClient();
    const session = useSession();
    // const router = useRouter();

    // if (!session) {
    //     router.push('/login');
    // }

    return (
        <CoreLayout>
            <CrucibleComponent />
        </CoreLayout>
    );
};