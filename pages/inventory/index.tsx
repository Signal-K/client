import CoreLayout from "../../components/Core/Layout";
import GlobalInventory from "../../components/Gameplay/Inventory/GlobalInventory";
import InventoryList from "../../components/Gameplay/Inventory/ItemsListComp";

export default function Inventory () {
    const inventoryItems = [
        { id: 1, name: 'Sword', description: 'A sharp and mighty sword.', image: 'https://cdn-icons-png.flaticon.com/512/1218/1218741.png' },
        { id: 2, name: 'Potion', description: 'A magical potion to restore health.', image: 'https://cdn-icons-png.flaticon.com/512/5305/5305029.png' },
    ];

    return (
        <CoreLayout>
            <GlobalInventory />
            <h1 className="text-3xl font-semibold mb-6">Inventory Page</h1>
            <InventoryList items={inventoryItems} />
        </CoreLayout>
    )
}