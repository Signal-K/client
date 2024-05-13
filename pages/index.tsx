import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export default function Home() {
  const session = useSession();

  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );

  if (!session) {
    return (
      <Layout bg={false}>
        <Link href="/auth"> Please sign in </Link>
      </Layout>
    );
  };
}; 

{/* <UserPlanets /> Add a block for sectors? */}