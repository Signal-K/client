import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface Spaceship {
    id: number;
    name: string;
    image: string;
    hp: number;
    speed: number; 
    attack: number;
    state: string;
    current_planet: string;
};

const MySpaceships: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userSpaceships, setUserSpaceships] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserSpaceships = async () => {
            if (session?.user) {
              const { data: userSpaceshipsData, error: userSpaceshipsError } = await supabase
                .from("inventorySPACESHIPS")
                .select("*")
                .eq("owner", session.user.id);
      
              if (userSpaceshipsError) {
                console.error("Error fetching user's spaceships:", userSpaceshipsError);
              } else {
                const spaceshipIds = userSpaceshipsData.map((userSpaceship) => userSpaceship.spaceship_id);
      
                const { data: spaceshipsData, error: spaceshipsError } = await supabase
                  .from("spaceships")
                  .select("*")
                  .in("id", spaceshipIds);
      
                if (spaceshipsError) {
                  console.error("Error fetching spaceship details:", spaceshipsError);
                } else {
                  const combinedData = userSpaceshipsData.map((userSpaceship) => {
                    const matchingSpaceship = spaceshipsData.find((spaceship) => spaceship.id === userSpaceship.spaceship_id);
                    return {
                      ...userSpaceship,
                      spaceship: matchingSpaceship,
                    };
                  });
      
                  setUserSpaceships(combinedData);
                }
              }
            }
          };
      
          fetchUserSpaceships();
    }, [session, supabase]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userSpaceships.map((userSpaceship) => (
            <div key={userSpaceship.id} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold">
                {userSpaceship.spaceship?.name || "N/A"} {/* Handle potential null/undefined */}
              </h2>
              <img
                src={userSpaceship.spaceship?.image || ""}
                alt={userSpaceship.spaceship?.name || ""}
                className="mt-2 w-full h-40 object-cover"
              />
              <p className="text-sm mt-2">
                HP: {userSpaceship.spaceship?.hp || 0}, Speed: {userSpaceship.spaceship?.speed || 0}, Attack:{" "}
                {userSpaceship.spaceship?.attack || 0}
              </p>
              <p className="text-sm mt-2">
                State: {userSpaceship.spaceship?.state || "N/A"}, Current Planet:{" "}
                {userSpaceship.spaceship?.current_planet || "N/A"}
              </p>
            </div>
          ))}
        </div>
      );
};

export default MySpaceships;