import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

const PlanetItemsList: React.FC<{ planetId: string }> = ({ planetId }) => {
    const supabase = useSupabaseClient();
    const [planetItems, setPlanetItems] = useState([]);
    const [itemDetails, setItemDetails] = useState([]);
  
    useEffect(() => {
      async function fetchPlanetItems() {
        try {
          const { data: planetItemsData, error: planetItemsError } = await supabase
            .from('inventoryPLANETS')
            .select('*')
            .eq('id', planetId)
            .single();
  
          if (planetItemsError) {
            throw planetItemsError;
          }
  
          console.log('Planet Items Data:', planetItemsData);
          console.log('Items Array:', planetItemsData?.items);
  
          setPlanetItems(planetItemsData?.items || []);
        } catch (error) {
          console.error('Error fetching planet items:', error);
        }
      }
  
      fetchPlanetItems();
    }, [planetId]);
  
    useEffect(() => {
      async function fetchItemDetails() {
        if (planetItems.length > 0) {
          const itemIds = planetItems.map(item => item.item);
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
    }, [planetItems]);

  return (
    <>
      <div className="bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold mb-4">Items on this Planet</h2>
        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {itemDetails.map(item => (
            <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">{item.name}</h3>
              <div className="mb-2">
                <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
              </div>
              <p className="text-gray-600">Quantity: {planetItems.find(planetItem => planetItem.item === item.id)?.quantity}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default PlanetItemsList;