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