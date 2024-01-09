import React from "react";
import InventoryItemsGroup, { EquippedToolItems, InventoryMenu, OwnedToolItems, SelectedItem, UserBackpackInventory } from "../../components/Content/Inventory/ItemGroup";
import Layout, { InventoryLayout } from "../../components/Section/Layout";

export default function Inventory() {
    return (
      <InventoryLayout>
        <div className="grid grid-cols-6 gap-2 px-5">
          <div className="col-span-2 px-5"><SelectedItem /></div>
          <div className="col-span-4 px-2"><div className="w-[526px] h-[664px] px-[31px] py-[17px] bg-neutral-700 justify-center items-center gap-[46px] inline-flex">
    <div className="h-[630px] justify-between items-center flex">
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
    </div>
    <div className="h-[630px] justify-between items-center flex">
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
    </div>
    <div className="h-[630px] justify-between items-center flex">
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
    </div>
</div></div>
          <OwnedToolItems />
        </div>
        <EquippedToolItems />
      </InventoryLayout>
    );
};  