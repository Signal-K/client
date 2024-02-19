import Link from "next/link"
import { Button } from "./ui/button"
import { DashboardLogs, InventoryBlock } from "../../components/dashboard-logs";
import { useState } from "react";
import { Garden } from "../../components/Content/Planets/GalleryList";

export function GardenDashboard() {
  const [showGalaxy, setShowGalaxy] = useState(false);
  const handleOpenGalaxy = () => {
    setShowGalaxy(true);
  };

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
        <button onClick={handleOpenGalaxy} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Visit a planet
        </button>
        <div className="mt-20">
          {showGalaxy &&
            <>
              <div className="mt-20">
                <Garden onClose={() => setShowGalaxy(false)} />
              </div>
            </>
          }
          </div>
      </div>
    </div>
  );
};