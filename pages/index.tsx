import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";

export default function Home() {
  return (
    <Layout bg={true}>
      <UserPlanetPage />
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}