import Link from "next/link"
import { Button } from "./ui/button"
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { QuickLook } from "../../components/quick-look";
import OwnedItemsList from "../../components/Content/Inventory/UserOwnedItems";
import { MenuIcon } from "lucide-react";
import { DashboardLogs } from "../../components/dashboard-logs";

// import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
// import { Button } from "./ui/button";
// import { QuickLook } from "../../components/quick-look";
// import OwnedItemsList from "../../components/Content/Inventory/UserOwnedItems";
// import { UserIcon, Package2Icon, MenuIcon, ChevronDownIcon } from "./icons";

export function GardenDashboard() {
  return (
    <div className="flex-col justify-center">
                    {/* <style jsx global>
                {`
                  body {
                    background: url('/assets/Onboarding/Bg.png') center/cover;
                  }
                  
                  @media only screen and (max-width: 767px) {
                    .planet-heading {
                      color: white;
                      font-size: 24px;
                      text-align: center;
                      margin-bottom: 10px;
                    }
                  }
                `}
              </style> */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="grid gap-4 p-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium"></CardTitle>
              <MenuIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
                {/* <OwnedItemsList /> */}
              </CardContent>
            {/* <CardContent>
              <ul className="grid gap-2 text-sm">
                <li>🌻 Seedling</li>
                <li>🌻 Sprout</li>
                <li>🌻 Bloom</li>
              </ul>
            </CardContent> */}
          </Card>
        </div>
        <div className="grid gap-4 p-4">
          <Button className="w-full">Go home</Button>
        </div>
        {/* <QuickLook /> */}
        <DashboardLogs />
      </div>
    </div>
  )
}
