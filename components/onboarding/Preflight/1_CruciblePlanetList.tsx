import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, ButtonGroup, ToggleButton } from "react-bootstrap";
import Link from "next/link";
// import AddToInventory

interface AddToInventoryButtonProps {
  itemId: number; // The item ID to add to the user's inventory
}

const AddToInventoryButton: React.FC<AddToInventoryButtonProps> = ({ itemId }) => {
  const session = useSession();
  const [hasItem, setHasItem] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function checkIfUserHasItem() {
      if (session) {
        try {
          const user = session?.user;
          const { data, error } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', user.id)
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
  }, [session]);

  const handleAddToInventory = async () => {
    if (session && !hasItem) {
      try {
        const user = session.user;
        const { error } = await supabase
          .from('inventoryUSERS')
          .upsert([
            {
              item: itemId,
              owner: user.id,
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

import Login from "../../../pages/login";
import PlanetGalleryCard from "../../Gameplay/Planets/PlanetGalleryCard";

export default function Crucible1BaseplanetList () {
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
        setPlanets(data);
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

  if (!session) {
    return <Login />;
  }

  return (
      <Container>
        <Row>
          {planets.map((planet) => (
            <PlanetGalleryCard key={planet.id} planet={planet} />
          ))}
        </Row>
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
          <Link href='/tests/onboarding/'><button className="btn glass">Next mission</button></Link>
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