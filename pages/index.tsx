import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import MissionList from "@/components/Content/MissionList";
import BuildFirstRover from "@/components/Gameplay/Automations/BuildRover";
import { PlaygroundGrid } from "@/ui/Sections/Grid";
import RoverSingle from "@/components/Gameplay/Inventory/Automation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    // <Layout>
    //   <div className="h-full w-full bg-blue-300 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
    //     <PlaygroundGrid />
    //   </div>
    // </Layout>
    <div>
      <div className="w-full">
        <div className="mx-auto max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {Array.from({ length: 64 }, (_, index) => (
            <div key={index} className="flex items-center justify-center p-6 border border-gray-200 dark:border-gray-800">
              {index + 1 === 51 || index + 1 === 54 ? <RoverSingle /> : index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};