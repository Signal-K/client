"use client"

import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Header } from "@/ui/Sections/PlanetLayout";
import { useRouter } from "next/router";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  if (!session) {
    return (
      router.push('/auth')
    );
  };

  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}