import React, { useState } from "react";

import BigProject from "../../Core/atoms/ListComponent";
import Section from "../../Core/atoms/Section";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const BigProjectsSection: React.VFC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [hasGoldenTelescope, setHasGoldenTelescope] = useState(false);

  return (
    <Section title="Archived/extra missions" label="Tools">
        {/* if (hasGoldenTelescope === false) { showMissionsAsIncomplete } */}
        {/* <BigProject
        inProgress={false}
        name="The Crucible of a Star Sailor"
        link="/tests/onboarding/planetHunters/Crucible"
        textGradient="pink"
        description="Objective: Unearth Hidden Celestial Bodies"
      /> */}
      <BigProject
        inProgress={false}
        name="Learning the transit system"
        link="/tests/onboarding/planetHunters/1"
        textGradient="pink"
        description="Learn how to discover exoplanets and discover your first one!"
      />
      <BigProject
        inProgress={false}
        name="Increasing difficulty"
        textGradient="pink"
        link="/tests/onboarding/planetHunters/2"
        description="New planet candidates, more challenging transits to classify"
      />
      <BigProject
        inProgress
        name="Final challenge"
        textGradient="purple"
        link="/tests/onboarding/planetHunters/4"
        description="The most complex planets"
      />
    </Section>
  );
};

export default BigProjectsSection;

const NewMissions: React.VFC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [hasGoldenTelescope, setHasGoldenTelescope] = useState(false);

return (
  <Section title="Your missions" label="Tools">
      {/* if (hasGoldenTelescope === false) { showMissionsAsIncomplete } */}
      <BigProject
      inProgress={false}
      name="The Crucible of a Star Sailor"
      link="/tests/onboarding/planetHunters/Crucible"
      textGradient="pink"
      description="Objective: Unearth Hidden Celestial Bodies"
    />
  </Section>
);
};