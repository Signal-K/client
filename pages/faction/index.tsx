import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../components/Core/Layout";
import UnityBuildLod1 from "../../components/Gameplay/Planets/Unity/lod1/Build";
import UnityBuildLod111 from "../../components/Gameplay/Unity/Build/LOD-Design";

const FactionIndexPage: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  // Fetch faction data based on the user's faction choice
  const [factionData, setFactionData] = useState<FactionData | null>(null);

  useEffect(() => {
    // Fetch faction data based on user's faction choice (You'll need to implement this logic)
    // For example, if the user's faction is "Cartographer," fetch Cartographer-related data.
    // You can use supabase queries here.
  }, [session]);

//   if (!factionData) {
//     // Handle loading or error state
//     return <div>Loading...</div>;
//   }

  return (
    <CoreLayout>
      <div className="bg-gray-900 text-white">
        {/* <header className="py-16 bg-cover bg-center" style={{ backgroundImage: `url(${factionData.headerImage})` }}> */}
        <header className="py-16 bg-cover bg-center" style={{ backgroundImage: `url('/assets/Inventory/FactionBase/factionCover.jpg' )` }}>
          <div className="container mx-auto text-center">
            {/* <h1 className="text-4xl font-extrabold">{factionData.name}</h1> */}
            <h1 className="text-4xl font-extrabold">Faction Home</h1>
            <p className="mt-4 text-xl">Welcome home</p>
            {/* <p className="mt-4 text-xl">{factionData.description}</p> */}
          </div>
        </header>

        <section className="container mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {/* <iframe
                src={factionData.unityWebGLURL}
                title="Faction Home Planet"
                className="w-full h-96"
              ></iframe> */}
              {/* <UnityBuildLod111 /> */}
            </div>

            {/* Faction Discussion */}
            <div>
              {/* Add a component or section for faction discussions here */}
            </div>
          </div>
        </section>

        {/* Faction Inventory */}
        <section className="container mx-auto py-12">
          {/* Add a component or section for faction inventory here */}
        </section>

        {/* Discord Link */}
        <section className="container mx-auto py-12 text-center">
          <a
            // href={factionData.discordLink}
            href='#'
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Join our Discord channel
          </a>
        </section>
      </div>
    </CoreLayout>
  );
};

export default FactionIndexPage;

// Define your FactionData type to represent the faction-specific data
type FactionData = {
  name: string;
  description: string;
  headerImage: string;
  unityWebGLURL: string;
  // Add more properties as needed
  discordLink: string;
};