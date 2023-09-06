import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, ButtonGroup, ToggleButton } from "react-bootstrap";
import Link from "next/link";

interface AddToInventoryButtonProps {
  itemId: number; // The item ID to add to the user's inventory
}

const AddToInventoryButton: React.FC<AddToInventoryButtonProps> = ({ itemId }) => {
  const [hasItem, setHasItem] = useState(false);
  const supabase = useSupabaseClient();
  const session = useSession();
  const user = session?.user?.id

  useEffect(() => {
    async function checkIfUserHasItem() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', session?.user?.id)
            .eq('item', itemId);

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            setHasItem(true);
          }
        } catch (error) {
          console.error('Error checking user inventory:', error);
        }
      }
    }

    checkIfUserHasItem();
  }, [user]);

  const handleAddToInventory = async () => {
    if (user && !hasItem) {
      try {
        const { error } = await supabase
          .from('inventoryUSERS')
          .upsert([
            {
              item: itemId,
              owner: session?.user?.id,
              quantity: 1
            }
          ]);

        if (error) {
          throw error;
        }
        console.log('Item added to inventory successfully');
        setHasItem(true); // Update state to reflect that the user now has the item
      } catch (error) {
        console.error('Error adding item to inventory:', error);
      }
    }
  };

  return (
    !hasItem && (
      <button
        onClick={handleAddToInventory}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add to Inventory
      </button>
    )
  );
};

import PlanetGalleryCard from "../../Gameplay/Planets/PlanetGalleryCard";
import GetSpaceshipPage from "./3_SpaceshipChecksum";
import Login from "../../../pages/login";

export default function Crucible1BaseplanetList() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(1);

  useEffect(() => {
    getPlanets();
  }, [session, selectedDifficulty]);

  const getPlanets = async () => {
    try {
      let query = supabase
        .from("planetsss")
        .select("*")
        .order("created_at", { ascending: false })
        .in("id", [47, 50, 51]); // Filter by specific IDs
  
      const { data, error } = await query;
  
      if (data != null) {
        setPlanets(data as any); // Explicitly cast the data to the correct type
      }
  
      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const buttonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "black",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    marginRight: "8px",
  };

  const activeButtonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  };

  const [userSpaceships, setUserSpaceships] = useState([]);

  useEffect(() => {
    const fetchUserSpaceships = async () => {
      if (session?.user) {
        const { data: userSpaceshipsData, error: userSpaceshipsError } = await supabase
          .from("inventorySPACESHIPS")
          .select("*")
          .eq("owner", session.user.id);

        if (userSpaceshipsError) {
          console.error("Error fetching user spaceships, error: ", userSpaceshipsError);
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

            setUserSpaceships(combinedData as any);
          }
        }
      }
    };

    fetchUserSpaceships();
  }, [session, supabase]);

  if (!session) {
    return <Login />
  }

  return (
      <Container>
        <Row>
          {planets.length === 0 ? (
            <p>No planets available.</p>
          ) : (
            planets.map((planet) => (
              <PlanetGalleryCard key={planet} planet={planet} />
            ))
          )}
        </Row>
        <GetSpaceshipPage />
        <PlanetClassificationCheck userId={session?.user?.id} />
      </Container>
  );
}


interface PlanetClassificationCheckProps {
  userId: string; // The user ID to check
}

const PlanetClassificationCheck: React.FC<PlanetClassificationCheckProps> = ({ userId }) => {
  const supabase = useSupabaseClient();
  const [hasClassifiedPlanets, setHasClassifiedPlanets] = useState(false);
  const [hasItem10, setHasItem10] = useState(false);

  useEffect(() => {
    async function checkUserClassifications() {
      try {
        // Check if the user has made classifications on planets 47, 50, and 51
        const { data: classificationsData, error: classificationsError } = await supabase
          .from('posts_duplicates')
          .select('*')
          .eq('author', userId)
          .in('planets2', [47, 50, 51]); // Adjust planet IDs as needed

        if (classificationsError) {
          throw classificationsError;
        }

        setHasClassifiedPlanets(classificationsData.length > 0);

        if (!hasClassifiedPlanets) {
          // If the user hasn't classified these planets, check if they have item 10 in their inventory
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', userId)
            .eq('item', 10); // Adjust item ID as needed

          if (inventoryError) {
            throw inventoryError;
          }

          setHasItem10(inventoryData.length > 0);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    }

    checkUserClassifications();
  }, [userId, hasClassifiedPlanets]);

  return (
    <div>
      {hasClassifiedPlanets ? (
        <>
          <h2>Congratulations!</h2>
          {/* <p>You've successfully completed level 1 on planets 47, 50, and 51.</p> */}
          <AddToInventoryButton itemId={10} /><br />
          <Link legacyBehavior href ='/tests/onboarding/'><button className="btn glass">Next mission</button></Link>
        </>
      ) : (
        <>
          <h2>Inventory Item 10</h2>
          {hasItem10 ? (
            <p>You have item 10 in your inventory.</p>
          ) : (
            <>
              <p>You don't have item 10 in your inventory.</p>
              <p>Add it to your inventory to unlock level 1 on planets 47, 50, and 51.</p>
            </>
          )}
        </>
      )}
    </div>
  );
};