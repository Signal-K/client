import { useInventory } from "@/context/InventoryContext";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

interface UserItem {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string;
    time_of_deploy: string;
    anomaly: number;
};

export default function UserItems() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { inventoryItems } = useInventory();

    const [userItems, setUserItems] = useState<UserItem[]>([]);

    async function fetchUserItems() {
        if (!session) return;

        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session.user.id);

            if (error) {
                throw error;
            }

            setUserItems(data);
        } catch (error: any) {
            console.log('Error fetching user items, ', error);
        }
    }

    useEffect(() => {
        fetchUserItems();
    }, [session]);
    
    return (
        <div>
            {userItems.map((userItem) => {
                const itemDetails = inventoryItems[userItem.item];
                if (!itemDetails) return null;
                
                return (
                    <div key={userItem.id}>
                        <h2>{itemDetails.name}</h2>
                        <p>{itemDetails.description}</p>
                        <p>Quantity: {userItem.quantity}</p>
                        <p>Notes: {userItem.notes}</p>
                        <img src={itemDetails.icon_url} alt={itemDetails.name} />
                    </div>
                );
            })}
        </div>
    );
}
