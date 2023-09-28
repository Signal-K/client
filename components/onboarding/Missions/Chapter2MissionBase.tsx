import React, { useState } from "react";

import BigProject from "../../Core/atoms/ListComponent";
import Section from "../../Core/atoms/Section";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const NewMissionsFactionChosen: React.VFC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [hasGoldenTelescope, setHasGoldenTelescope] = useState(false);
  
  return (
    <Section title="Your missions" label="Tools">
        {/* if (hasGoldenTelescope === false) { showMissionsAsIncomplete } */}
        <BigProject
          inProgress={false}
          name="Your emergence as a Star Sailor | Completed"
          link="/tests/onboarding/planetHunters/Emergence"
          textGradient="purple"
          description="Objective: Meet Capt'n Cosmos & start your journey"
        />
        <BigProject
          inProgress={false}
          name="The Crucible of a Star Sailor"
          link="/tests/onboarding/planetHunters/Crucible"
          textGradient="green"
          description="Objective: Unearth Hidden Celestial Bodies"
        />
        <BigProject
          inProgress={true}
          name="The galactic economy"
          link="/tests/onboarding/planetHunters/Silfur"
          textGradient="green"
          description="Objective: Find out what life is like in the Star Sailors universe"
        />
        <BigProject
          inProgress={true}
          name="Navigating the cosmic ocean"
          link="/tests/onboarding/planetHunters/Navigate"
          textGradient="green"
          description="Objective: Learn more about lightcurves"
        />
    </Section>
  );
  };

export default NewMissionsFactionChosen;