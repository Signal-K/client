import React from "react";
import InventoryItemsGroup, { EquippedToolItems, InventoryMenu, OwnedToolItems, SelectedItem, UserBackpackInventory } from "../../components/Content/Inventory/ItemGroup";
import Layout, { InventoryLayout } from "../../components/Section/Layout";

export default function Inventory() {
    return (
      <InventoryLayout>
        <div className="grid grid-cols-6 gap-2 px-5">
          {/* <div className="col-span-2 px-5"><SelectedItem /></div>
          <div className="col-span-4 px-2"><UserBackpackInventory /></div> */}
          <OwnedToolItems />
        </div>
        <EquippedToolItems />
      </InventoryLayout>
    );
};  