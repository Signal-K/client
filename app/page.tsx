"use client"

import Layout from "@/components/Layout";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import { Landing } from "@/components/landing";
import { Panels } from "./(layout)/currentSections";

export default function Home() {
  const session = useSession();

  if (!session) {
    return (
      <Landing />
    );
  };

  return (
    <Layout bg={true}>
      {/* <UserPlanetPage /> */}
      <Panels /> {/* Show this for certain mission sets' status */}
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}