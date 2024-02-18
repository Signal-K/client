import Link from "next/link"
import { Button } from "./ui/button"
import { DashboardLogs, InventoryBlock } from "../../components/dashboard-logs";

export function GardenDashboard() {
  return (
    <div className="flex-col justify-center">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="grid gap-4 p-4">
        </div>
        <div className="grid gap-4 p-4">
          <Button className="w-full">Go home</Button>
        </div>
        {/* <QuickLook /> */}
        {/* <DashboardLogs /> */}
        <InventoryBlock />
      </div>
    </div>
  );
};