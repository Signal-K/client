import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const PlanetItemsList: React.FC<{ planetId: string }> = ({ planetId }) => {
  const supabase = useSupabaseClient();
  const [itemDetails, setItemDetails] = useState([]);

  useEffect(() => {
    async function fetchItemDetails() {
      try {
        const { data: planetItemsData, error: planetItemsError } = await supabase
          .from('inventoryUSERS')
          .select('*, item:inventoryITEMS(name, description, icon_url)')
          .eq('location', planetId);

        if (planetItemsError) {
          throw planetItemsError;
        }

        setItemDetails(planetItemsData);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    }

    fetchItemDetails();
  }, [planetId]);

  return (
    <div>
      <h2>Items on this Planet</h2>
      <ul>
        {itemDetails.map((item) => (
          <li key={item.id}>
            <h3>{item.item.name}</h3>
            <p>{item.item.description}</p>
            <img src={item.item.icon_url} alt={item.item.name} style={{ maxWidth: '100px' }} />
            <p>Quantity: {item.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanetItemsList;