"use client"

import Layout from "@/components/Layout";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import PublicLanding from "@/components/Sections/Public";

export default function Home() {
  const session = useSession();

  if (!session) {
    return (
      <PublicLanding />
    );
  };

  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}