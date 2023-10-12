import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Spaceship {
  id: number;
  name: string;
  image: string;
  hp: number;
  speed: number;
  attack: number;
  cost: number;
}

const AllSpaceships: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [spaceships, setSpaceships] = useState<Spaceship[]>([]); // Specify the type as Spaceship[]
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    // Function to fetch all spaceships from the spaceships table
    const fetchSpaceships = async () => {
      try {
        const { data: spaceshipsData, error } = await supabase
          .from("spaceships") // Specify the type as Spaceship
          .select("*");

        if (error) {
          console.error("Error fetching spaceships:", error);
        } else {
          // Filter out spaceship with id 3
          const filteredSpaceships = spaceshipsData.filter((spaceship) => spaceship.id !== 3);
          setSpaceships(filteredSpaceships);
        }
      } catch (error) {
        console.error("Error fetching spaceships:", error);
      }
    };

    // Function to fetch user's balance in silfur from the profiles table
    const fetchUserBalance = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("experience")
            .eq("id", session.user.id);

          if (error) {
            console.error("Error fetching user balance:", error);
          } else {
            // Assuming "experience" is the field that represents the user's balance in silfur
            const userExperience = data && data.length > 0 ? data[0].experience : null;
            setUserBalance(userExperience);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
        }
      }
    };

    fetchSpaceships();
    fetchUserBalance();
  }, [session, supabase]);

  // Function to handle buying a spaceship
  const buySpaceship = async (spaceship: Spaceship) => {
    if (!session?.user) {
      return;
    }

    if (userBalance !== null && spaceship.cost !== null && userBalance >= spaceship.cost) {
      // Deduct the cost from the user's balance
      const newBalance = userBalance - spaceship.cost;

      // Insert a new record into inventorySPACESHIPS
      try {
        const { error } = await supabase
          .from("inventorySPACESHIPS")
          .insert([{ owner: session.user.id, spaceship_id: spaceship.id }]);

        if (error) {
          console.error("Error buying spaceship:", error);
        } else {
          // Update the user's balance in the profiles table
          try {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ experience: newBalance })
              .eq("id", session.user.id);

            if (updateError) {
              console.error("Error updating user balance:", updateError);
            } else {
              // Update the user's balance in the component state
              setUserBalance(newBalance);
            }
          } catch (updateError) {
            console.error("Error updating user balance:", updateError);
          }
        }
      } catch (error) {
        console.error("Error buying spaceship:", error);
      }
    } else {
      // Insufficient balance, show an alert or handle as needed
      alert("Insufficient balance to buy this spaceship.");
    }
  };

  return (
    <div className="mb-10">
      <h1 className="text-2xl font-semibold mb-4">All Spaceships</h1>
      <p className="text-lg font-semibold">Your balance: {userBalance ?? "Loading..."} Silfur</p>
      <br />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {spaceships.map((spaceship) => (
          <div key={spaceship.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">{spaceship.name}</h2>
            <img src={spaceship.image} alt={spaceship.name} className="mt-2 w-full h-40 object-cover" />
            <p className="text-sm mt-2">
              HP: {spaceship.hp}, Speed: {spaceship.speed}, Attack: {spaceship.attack}
            </p>
            <p className="text-sm mt-2">Cost: {spaceship.cost} Silfur</p>
            <button
              onClick={() => buySpaceship(spaceship)}
              disabled={userBalance === null || userBalance < (spaceship.cost ?? 0)}
              className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded ${
                userBalance === null || userBalance < (spaceship.cost ?? 0)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllSpaceships;