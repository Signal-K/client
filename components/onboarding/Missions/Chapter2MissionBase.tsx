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
          description="Objective: Unearth Hidden Celestial Bodies"
        />
        <BigProject
          inProgress={false}
          name="The Crucible of a Star Sailor"
          link="/tests/onboarding/planetHunters/Crucible"
          textGradient="green"
          description="Objective: Unearth Hidden Celestial Bodies"
        />
    </Section>
  );
  };

export default NewMissionsFactionChosen;