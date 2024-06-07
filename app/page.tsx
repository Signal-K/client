"use client"

import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import PublicLanding from "@/components/Sections/Public";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function Home() {
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  if (!session) {
    return (
      <PublicLanding />
    );
  };

  if (!activePlanet) {
    return (
      <Link href="/onboarding"><button className="btn">
        Set your location
      </button></Link>
    );
  };

  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}