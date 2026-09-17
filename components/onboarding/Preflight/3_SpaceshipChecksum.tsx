import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const GetSpaceshipPage: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [spaceship, setSpaceship] = useState<any | null>(null);

  useEffect(() => {
    // Check if the user has the spaceship with ID 3 in their inventory
    const checkForSpaceship = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("inventorySPACESHIPS")
          .select("spaceship_id")
          .eq("owner", session.user.id)
          .eq("spaceship_id", 3);

        if (error) {
          console.error("Error checking for spaceship:", error);
        } else {
          if (data && data.length > 0) {
            // Fetch spaceship details from the database
            const { data: spaceshipData, error: spaceshipError } = await supabase
              .from("spaceships")
              .select("*")
              .eq("id", 3); // Replace 3 with the appropriate spaceship ID

            if (spaceshipError) {
              console.error("Error fetching spaceship data:", spaceshipError);
            } else {
              setSpaceship(spaceshipData && spaceshipData[0]);
            }
          }
        }
      }
    };

    checkForSpaceship();
  }, [session, supabase]);

  const addSpaceshipToInventory = async () => {
    if (session?.user) {
      // Add the spaceship with ID 3 to the user's inventory
      const { error } = await supabase
        .from("inventorySPACESHIPS")
        .insert([{ owner: session.user.id, spaceship_id: 3 }]);

      if (error) {
        console.error("Error adding spaceship to inventory:", error);
      } else {
        // Fetch the newly added spaceship's details from the database
        const { data, error: fetchError } = await supabase
          .from("spaceships")
          .select("*")
          .eq("id", 3); // Replace 3 with the appropriate spaceship ID

        if (fetchError) {
          console.error("Error fetching spaceship data:", fetchError);
        } else {
          setSpaceship(data && data[0]);
        }
      }
    }
  };

  return (
    <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {spaceship ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Your {spaceship.name}</h2>
            <img
                src={spaceship.image}
                alt={spaceship.name}
                className="mt-2 w-full h-40 object-cover"
            />
            <p className="text-sm mt-2">
                HP: {spaceship.hp}, Speed: {spaceship.speed}, Attack: {spaceship.attack}
            </p>
            </div>
            </div>
        ) : (
            <button
            className="btn glass"
            onClick={addSpaceshipToInventory}
            >
            Get your first spaceship
            </button>
        )}
        </div>
    </div>
  );
};

export default GetSpaceshipPage;