import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect } from "react";

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

const SupabaseInventoryList: React.FC = () => {
    const session = useSession();
    const supabase = useSupabaseClient();

    const [inventoryItems, setInventoryItems] = useState([]);

    const getItems = async () => {
        try {
            const { data, error } = await supabase
                .from('inventoryITEMS')
                .select("*")
                .limit(100)

            if (data) {
                setInventoryItems(data);
                console.log(data);
            }

            if (error) {
                throw error;
            }  
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        getItems();
    }, [session]);

    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">Inventory</h2>
            <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {inventoryItems.map(item => (
                    <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-2">{item.name}</h3>
                        <div className="mb-2">
                            <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                        <p className="text-gray-600">Cost: {item.cost}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SupabaseInventoryList;