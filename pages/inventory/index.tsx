import React from "react";
import InventoryItemsGroup, { InventoryMenu, UserBackpackInventory } from "../../components/Content/Inventory/ItemGroup";
import Layout from "../../components/Section/Layout";

export default function Inventory() {
    return (
        <Layout>
            <div className="py-10 px-10">
                <InventoryMenu />
                <UserBackpackInventory />
            </div>
        </Layout>
    )
}