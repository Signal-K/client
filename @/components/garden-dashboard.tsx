import Link from "next/link"
import { Button } from "./ui/button"
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { QuickLook } from "../../components/quick-look";
import OwnedItemsList from "../../components/Content/Inventory/UserOwnedItems";
import { MenuIcon } from "lucide-react";

// import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { QuickLook } from "../../components/quick-look";
// import OwnedItemsList from "../../components/Content/Inventory/UserOwnedItems";
// import { UserIcon, Package2Icon, MenuIcon, ChevronDownIcon } from "./icons";

export function GardenDashboard() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="grid gap-4 p-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <MenuIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li>🌻 Seedling</li>
                <li>🌻 Sprout</li>
                <li>🌻 Bloom</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 p-4">
          <Button className="w-full">Water Plants</Button>
        </div>
        <QuickLook />
        <OwnedItemsList />
      </div>
    </div>
  )
}
