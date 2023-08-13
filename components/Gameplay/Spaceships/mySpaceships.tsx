import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const MySpaceships: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [userSpaceships, setUserSpaceships] = useState([]);

  useEffect(() => {
    // Function to fetch user's spaceships from the inventorySPACESHIPS table
    const fetchUserSpaceships = async () => {
      if (session?.user) {
        // Fetch spaceships owned by the logged-in user from the inventorySPACESHIPS table
        const { data: userSpaceshipsData, error: userSpaceshipsError } = await supabase
          .from("inventorySPACESHIPS")
          .select("*")
          .eq("owner", session.user.id);

        if (userSpaceshipsError) {
          console.error("Error fetching user's spaceships:", userSpaceshipsError);
        } else {
          // Extract spaceship IDs from userSpaceshipsData
          const spaceshipIds = userSpaceshipsData.map((userSpaceship) => userSpaceship.spaceship_id);

          // Fetch spaceship details from the spaceships table using the IDs
          const { data: spaceshipsData, error: spaceshipsError } = await supabase
            .from("spaceships")
            .select("*")
            .in("id", spaceshipIds);

          if (spaceshipsError) {
            console.error("Error fetching spaceship details:", spaceshipsError);
          } else {
            // Combine userSpaceshipsData and spaceshipsData based on spaceship_id
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
                {userSpaceship.spaceship?.name}
              </h2>
              <img
                src={userSpaceship.spaceship?.image}
                alt={userSpaceship.spaceship?.name}
                className="mt-2 w-full h-40 object-cover"
              />
              <p className="text-sm mt-2">
                HP: {userSpaceship.spaceship?.hp}, Speed: {userSpaceship.spaceship?.speed}, Attack:{" "}
                {userSpaceship.spaceship?.attack}
              </p>
              <p className="text-sm mt-2">
                State: {userSpaceship.spaceship?.state}, Current Planet:{" "}
                {userSpaceship.spaceship?.current_planet}
              </p>
            </div>
          ))}
        </div>
  );
};

export default MySpaceships;