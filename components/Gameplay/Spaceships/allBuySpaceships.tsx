import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const AllSpaceshipsWithBalance: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [spaceships, setSpaceships] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    // Function to fetch all spaceships from the spaceships table
    const fetchSpaceships = async () => {
      // Fetch all spaceships from the spaceships table
      const { data: spaceshipsData, error: spaceshipsError } = await supabase
        .from("spaceships")
        .select("*");

      if (spaceshipsError) {
        console.error("Error fetching spaceships:", spaceshipsError);
      } else {
        setSpaceships(spaceshipsData || []);
      }
    };

    // Function to fetch user's balance from the profiles table
    const fetchUserBalance = async () => {
      if (session?.user) {
        // Fetch the user's profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("experience")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user's balance:", profileError);
        } else {
          setUserBalance(profileData?.experience || 0);
        }
      }
    };

    fetchSpaceships();
    fetchUserBalance();
  }, [session, supabase]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">All Spaceships</h1>
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
              HP: {spaceship.hp}, Speed: {spaceship.speed}, Attack:{" "}
              {spaceship.attack}
            </p>
            <p className="text-sm mt-2">
              State: {spaceship.state}, Current Planet:{" "}
              {spaceship.current_planet}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xl font-semibold">Your Balance in Silfur:</p>
        <p className="text-lg">{userBalance} Silfur</p>
      </div>
    </div>
  );
};

export default AllSpaceshipsWithBalance;