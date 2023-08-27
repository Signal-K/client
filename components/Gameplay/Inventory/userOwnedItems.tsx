import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import OwnedPlanetsList from './userOwnedPlanets';

const OwnedItemsList: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [ownedItems, setOwnedItems] = useState([]);
  const [itemDetails, setItemDetails] = useState([]);
  const [planets, setPlanets] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    async function fetchOwnedItems() {
      if (session) {
        try {
          const user = session.user.id;
          const { data: ownedItemsData, error: ownedItemsError } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', user);

          if (ownedItemsError) {
            throw ownedItemsError;
          }

          if (ownedItemsData) {
            setOwnedItems(ownedItemsData);
          }
        } catch (error) {
          console.error('Error fetching owned items:', error);
        }
      }
    }

    fetchOwnedItems();
  }, [session]);

  useEffect(() => {
    async function fetchItemDetails() {
      if (ownedItems.length > 0) {
        const itemIds = ownedItems.map(item => item.item);
        const { data: itemDetailsData, error: itemDetailsError } = await supabase
          .from('inventoryITEMS')
          .select('*')
          .in('id', itemIds);

        if (itemDetailsError) {
          console.error('Error fetching item details:', itemDetailsError);
        }

        if (itemDetailsData) {
          setItemDetails(itemDetailsData);
        }
      }
    }

    fetchItemDetails();
  }, [ownedItems]);

  useEffect(() => {
    async function fetchUserPlanets() {
      if (session) {
        try {
          const user = session.user.id;
          const { data: userPlanetsData, error: userPlanetsError } = await supabase
            .from('inventoryPLANETS')
            .select('*')
            .eq('owner_id', user);

          if (userPlanetsError) {
            throw userPlanetsError;
          }

          if (userPlanetsData) {
            setPlanets(userPlanetsData);
          }
        } catch (error) {
          console.error('Error fetching user planets:', error);
        }
      }
    }

    fetchUserPlanets();
  }, [session]);

  const handleTransferButtonClick = (item) => {
    setSelectedItem(item);
    setIsTransferring(true);
  };

  const handlePlanetSelect = (event) => {
    setSelectedPlanet(event.target.value);
  };

  const handleConfirmTransfer = async () => {
    if (selectedItem && selectedPlanet) {
      try {
        await supabase
          .from('inventoryUSERS')
          .update({ location: selectedPlanet })
          .eq('id', selectedItem.id);

        // Update the ownedItems state to reflect the change
        setOwnedItems(prevOwnedItems =>
          prevOwnedItems.map(item => {
            if (item.id === selectedItem.id) {
              return { ...item, location: selectedPlanet };
            }
            return item;
          })
        );

        setSelectedItem(null);
        setSelectedPlanet(null);
        setIsTransferring(false);
      } catch (error) {
        console.error('Error transferring item:', error);
      }
    }
  };

  return (
    <>
      <div className="bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold mb-4">Items</h2>
        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {itemDetails.map(item => {
            const ownedItem = ownedItems.find(ownedItem => ownedItem.item === item.id);
            return (
              <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">{item.name}</h3>
                <div className="mb-2">
                  <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
                </div>
                <p className="text-gray-600">Quantity: {ownedItem?.quantity}</p>
                {/* <p className="text-gray-600">Location: {ownedItem?.location}</p> */}
                {/* <button className="mt-2 bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleTransferButtonClick(ownedItem)}>Transfer Item</button> */}
              </li>
            );
          })}
        </ul>
      </div>
      {isTransferring && (
        <div className="bg-gray-100 p-4 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Transfer Item</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Select Planet:</label>
            <select className="w-full px-3 py-2 border rounded" value={selectedPlanet} onChange={handlePlanetSelect}>
              <option value="">Select a planet</option>
              {planets.map(planet => (
                <option key={planet.id} value={planet.id}>{planet.name}</option>
              ))}
            </select>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleConfirmTransfer}>Confirm Transfer</button>
        </div>
      )}
      <OwnedPlanetsList />
    </>
  );
};

export default OwnedItemsList;

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
}

const ToolItemsList: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  const [toolItems, setToolItems] = useState<InventoryItem[]>([]);
  const [userExperience, setUserExperience] = useState<number>(0);

  useEffect(() => {
    async function fetchToolItems() {
      try {
        const { data: itemsData, error: itemsError } = await supabase
          .from('inventoryITEMS')
          .select('*')
          .eq('ItemCategory', 'Tool');

        if (itemsError) {
          throw itemsError;
        }

        if (itemsData) {
          setToolItems(itemsData);
        }

        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('experience')
          .eq('id', session?.user?.id);

        if (userError) {
          throw userError;
        }

        if (userData && userData.length > 0) {
          setUserExperience(userData[0].experience);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchToolItems();
  }, [session]);

  const handleBuyClick = async (itemId: number, itemCost: number) => {
    if (userExperience >= itemCost) {
      // Deduct the item cost from user's experience
      const updatedExperience = userExperience - itemCost;

      // Update user's experience in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ experience: updatedExperience })
        .eq('id', session?.user?.id);

      if (updateError) {
        console.error('Error updating user experience:', updateError);
        return;
      }

      // Add the item to the user's inventory
      const { error: insertError } = await supabase
        .from('inventoryUSERS')
        .insert({
          item: itemId,
          owner: session?.user?.id,
          quantity: 1, // Assuming you want to add one item
        });

      if (insertError) {
        console.error('Error adding item to inventory:', insertError);
        return;
      }

      // Refresh the tool items list after successful purchase
    //   fetchToolItems();
    }
  };

  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Tool Items</h2>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {toolItems.map(item => (
          <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">{item.name}</h3>
            <div className="mb-2">
              <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
            </div>
            <p className="text-gray-600">Price: {item.cost}</p>
            <p className="text-gray-600">Your Experience: {userExperience}</p>
            {userExperience >= item.cost ? (
              <button
                className="bg-socialBlue text-white px-3 py-1 rounded-md mt-2"
                onClick={() => handleBuyClick(item.id, item.cost)}
              >
                Buy
              </button>
            ) : (
              <p className="text-red-500 mt-2">Insufficient Experience</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CosmeticItemList: React.FC = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
  
    const [toolItems, setToolItems] = useState<InventoryItem[]>([]);
    const [userExperience, setUserExperience] = useState<number>(0);
  
    useEffect(() => {
      async function fetchCosmeticItems() {
        try {
          const { data: itemsData, error: itemsError } = await supabase
            .from('inventoryITEMS')
            .select('*')
            .eq('ItemCategory', 'Cosmetic');
  
          if (itemsError) {
            throw itemsError;
          }
  
          if (itemsData) {
            setToolItems(itemsData);
          }
  
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('experience')
            .eq('id', session?.user?.id);
  
          if (userError) {
            throw userError;
          }
  
          if (userData && userData.length > 0) {
            setUserExperience(userData[0].experience);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
  
      fetchCosmeticItems();
    }, [session]);
  
    const handleBuyClick = async (itemId: number, itemCost: number) => {
      if (userExperience >= itemCost) {
        // Deduct the item cost from user's experience
        const updatedExperience = userExperience - itemCost;
  
        // Update user's experience in the database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ experience: updatedExperience })
          .eq('id', session?.user?.id);
  
        if (updateError) {
          console.error('Error updating user experience:', updateError);
          return;
        }
  
        // Add the item to the user's inventory
        const { error: insertError } = await supabase
          .from('inventoryUSERS')
          .insert({
            item: itemId,
            owner: session?.user?.id,
            quantity: 1, // Assuming you want to add one item
          });
  
        if (insertError) {
          console.error('Error adding item to inventory:', insertError);
          return;
        }
  
        // Refresh the tool items list after successful purchase
      //   fetchToolItems();
      }
    };
  
    return (
      <div className="bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold mb-4">Cosmetic Items</h2>
        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {toolItems.map(item => (
            <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">{item.name}</h3>
              <div className="mb-2">
                <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
              </div>
              <p className="text-gray-600">Price: {item.cost}</p>
              <p className="text-gray-600">Your Experience: {userExperience}</p>
              {userExperience >= item.cost ? (
                <button
                  className="bg-socialBlue text-white px-3 py-1 rounded-md mt-2"
                  onClick={() => handleBuyClick(item.id, item.cost)}
                >
                  Buy
                </button>
              ) : (
                <p className="text-red-500 mt-2">Insufficient Experience</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
};