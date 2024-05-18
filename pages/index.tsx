import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Header } from "@/ui/Sections/PlanetLayout";

export default function Home() {
  const session = useSession();

  if (!session) {
    return (
      <Layout bg={true}>
        <Header planetName="Test" />
        <Link href="/auth"> Please sign in </Link>
      </Layout>
    );
  };

  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}