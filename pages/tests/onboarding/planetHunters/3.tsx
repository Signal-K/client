import React, { useState, useEffect } from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Stitching from "../../../../components/onboarding/LightKurve/stitching";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../../../context/UserContext";
import { PostFormCardPlanetTag } from "../../../../components/PostFormCard";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 30;
    const currentPage = 3

    const supabase = useSupabaseClient();
    const session = useSession();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!session?.user?.id) {
          return;
        }
    
        supabase
            .from("profiles")
            .select()
            .eq("id", session?.user?.id)
            .then((result) => {
                if (result.data.length) {
                    setProfile(result.data[0]);
                }
        });
    }, [session?.user?.id]);

    return (
        <CoreLayout>
            <Stitching />
            {/* <ProgressSidebar credits={credits} currentPage={currentPage} /> */}
            {/* {session?.user?.id && ( <> <UserContext.Provider value={{profile}}><PostFormCardPlanetTag planetId2={1} onPost={null} /></UserContext.Provider> </> )} */}
        </CoreLayout>
    );
};