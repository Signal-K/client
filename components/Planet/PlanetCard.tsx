import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../Card";
import SocialGraphHomeNoSidebar from "../../pages/posts";

interface PlanetContentProps {
  activeTab: string;
  planetId: string;
}

const PlanetContent: React.FC<PlanetContentProps> = ({ activeTab, planetId }) => {
  const supabase = useSupabaseClient();
  const [planetPosts, setPlanetPosts] = useState<Array<{ id: string }>>([]);
  const [planet, setPlanet] = useState(null);

  useEffect(() => {
    if (!planetId) {
      return;
    }
    getPlanetData(planetId);
    console.log(planetId);
  }, [planetId]); // Specify planetId as a dependency

  async function loadPlanet() {
    // Implement your logic for loading planet here
  }

  async function getPlanetData(planetId: string) {
    const { data, error } = await supabase
      .from('planetsss')
      .select()
      .eq('id', planetId);
  
    if (error) {
      console.error('Error fetching planet data:', error);
      return null; // Handle the error as needed
    }
  
    if (data && data.length > 0) {
      return data[0]; // Return the first item if data is not null and has at least one element
    }
  
    return null; // Return null if data is null or empty
  }  

  return (
    <div>
      {planetPosts?.length > 0 &&
        planetPosts.map((planetPost) => (
          <SocialGraphHomeNoSidebar
            key={planetPost.id}
            {...planetPost}
          />
        ))}
    </div>
  );
};

export default PlanetContent;