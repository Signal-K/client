import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMediaQuery } from 'react-responsive';

import { Metadata } from "next";
import PublicLanding from "../components/_Core/LandingContent";
import Layout from "../components/_Core/Section/Layout";

export const metadata: Metadata = {
  title: "Star Sailors",
};

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  if (session) {
    return (
      <Layout>
        <p>Run into the shadows</p>
      </Layout>
      // <Planet backgroundImage="https://cdn.cloud.scenario.com/assets/asset_J8Mo3eYBJWMjdC8wSQQ15edx?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9KOE1vM2VZQkpXTWpkQzh3U1FRMTVlZHg~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE1MTI2Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=OuEtnaPodT1W4BsZZep27dJD5Sk3jzwsrSj1Dktkh2GoojVG~Ttn0WFhDvEBx~m6bX0~~8tEIcqk-NuornLcTtfG0TIE0H18LOPj-BWhTS9dg72-Zkg3ris1MwpAkSuQ~9GUlKPt3N4VgYz5b6h7TmDa06u7PPATCEuIwcjXBs23sNZbW4bAOS9EQTzv9bjPY6rc1IPFq~9ua8xx8~3q8qMlcZ1NoB1pYhCJEM7ROBPBu0fWtp2IlUYNAX21zBJFTgvnqjsIazuual3wLR1ennoO3mRuMS8uzTq6eoHBiIwKkY4rQUFsUpuORWcOpevh7Wz6eGBn7d4X5xDhuBV6oA__&format=jpeg" logoImage="https://avatars.githubusercontent.com/u/78838067?s=200&v=4" leftArrowImage="https://www.svgrepo.com/show/27797/left-arrow.svg" rightArrowImage="https://www.svgrepo.com/show/27797/right-arrow.svg" structureImage="https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true" compassImage="https://www.svgrepo.com/show/532904/compass-drafting.svg" planetName="HelloWorld" activeRoverImage="https://cdn-icons-png.flaticon.com/512/7717/7717354.png" idleRoverImage="https://www.svgrepo.com/show/440444/space-rover-2.svg" galleryImages={['https://www.svgrepo.com/show/440444/space-rover-2.svg']} centerButtonImage="https://www.svgrepo.com/show/440396/black-hole.svg" />
    );
  };

  return (
    <PublicLanding />
  );
};

export function PL() {
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  //   if (session) {
  //     return (
  //       <LayoutNoNav>
  //         {isDesktopOrLaptop && ( <Navigation /> )}
  //         <div className="pt-10">
  //           {isDesktopOrLaptop && ( <BentoGridThirdDemo /> )};
  //           {isTabletOrMobile && ( <BentoGridMobileDemo /> )};
  //         </div>
  //       </LayoutNoNav>
  //     );      
  // };
};