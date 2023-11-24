import React from "react";
import InventoryItemsGroup, { InventoryMenu, UserBackpackInventory } from "../../components/Content/Inventory/ItemGroup";
import Layout, { InventoryLayout } from "../../components/Section/Layout";

export default function Inventory() {
    return (
      <InventoryLayout>
        <div className="grid grid-cols-3 gap-4 px-5">
            <div><UserBackpackInventory /></div>
        </div>
      </InventoryLayout>
    );
};  