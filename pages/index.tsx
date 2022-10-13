import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import BuildFirstRover from "@/components/Gameplay/Automations/BuildRover";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <Layout>
      <MissionList />
      <BuildFirstRover />
    </Layout>
  );
};


