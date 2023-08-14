import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const AllSpaceships: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [spaceships, setSpaceships] = useState([]);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    // Function to fetch all spaceships from the spaceships table
    const fetchSpaceships = async () => {
      const { data, error } = await supabase.from("spaceships").select("*");

      if (error) {
        console.error("Error fetching spaceships:", error);
      } else {
        setSpaceships(data || []);
      }
    };

    // Function to fetch user's balance in silfur from the profiles table
    const fetchUserBalance = async () => {
      if (session?.user) {
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
      }
    };

    fetchSpaceships();
    fetchUserBalance();
  }, [session, supabase]);

  // Function to handle buying a spaceship
  const buySpaceship = async (spaceship: any) => {
    if (!session?.user) {
      return;
    }

    if (userBalance && spaceship.cost && userBalance >= spaceship.cost) {
      // Deduct the cost from the user's balance
      const newBalance = userBalance - spaceship.cost;

      // Insert a new record into inventorySPACESHIPS
      const { error } = await supabase
        .from("inventorySPACESHIPS")
        .insert([{ owner: session.user.id, spaceship_id: spaceship.id }]);

      if (error) {
        console.error("Error buying spaceship:", error);
      } else {
        // Update the user's balance in the profiles table
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
      }
    } else {
      // Insufficient balance, show an alert or handle as needed
      alert("Insufficient balance to buy this spaceship.");
    }
  };

  return (
    <div className="mb-10">
      <h1 className="text-2xl font-semibold mb-4">All Spaceships</h1>
      <p className="text-lg font-semibold">Your balance: {userBalance} Silfur</p><br />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {spaceships.map((spaceship) => (
          <div key={spaceship.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">{spaceship.name}</h2>
            <img
              src={spaceship.image}
              alt={spaceship.name}
              className="mt-2 w-full h-40 object-cover"
            />
            <p className="text-sm mt-2">
              HP: {spaceship.hp}, Speed: {spaceship.speed}, Attack: {spaceship.attack}
            </p>
            <p className="text-sm mt-2">Cost: {spaceship.cost} Silfur</p>
            <button
              onClick={() => buySpaceship(spaceship)}
              disabled={!userBalance || userBalance < spaceship.cost}
              className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded ${
                (!userBalance || userBalance < spaceship.cost) && "opacity-50 cursor-not-allowed"
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