import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface Item {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
};

const GlobalInventory: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const supabase = useSupabaseClient();
    const session = useSession();
    const userId = session?.user?.id;

    useEffect(() => {
        fetchItems();
    }, [userId]);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase.from('Inventory.items').select('*');
            if (error) { throw new Error(error.message); };
            setItems(data || []);
        } catch (error) { 
            console.error(error);
        };
    };

    return (
        <div className="flex flex-wrap">
            {items.map((item) => (
                <div key={item.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 p-4">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src={item.icon_url} alt={item.name} className="w-full h-40 object-cover" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GlobalInventory;