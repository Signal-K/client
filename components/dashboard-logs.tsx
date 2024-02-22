import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/addons/card";
import OwnedItemsList from "./Content/Inventory/UserOwnedItems";

export function InventoryBlock() {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <ShoppingBagIcon className="w-8 h-8" />
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mx-20 mb-6 -mt-12">
            <OwnedItemsList />
          </div>
        </CardContent>
      </Card>
  );
};

export function DashboardLogs() {
  return (
    <div className="grid gap-6 md:grid-cols-3 max-w-7xl w-full mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <CalendarIcon className="w-8 h-8" />
          <CardTitle>Mission Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="border-l-2 border-blue-500 pl-2">
              <p className="text-sm font-semibold">Collecting Seeds</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have entered the Garden Planet. Find the rare seeds to complete your mission.
              </p>
            </div>
            <div className="border-l-2 border-blue-500 pl-2">
              <p className="text-sm font-semibold">Exploring the Forest</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have discovered a hidden path. Follow it to uncover the secrets of the ancient trees.
              </p>
            </div>
            <div className="border-l-2 border-gray-200 pl-2">
              <p className="text-sm font-semibold">Meeting the Locals</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The inhabitants of the Garden Planet are friendly. Talk to them to learn more about this beautiful
                world.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <CalendarIcon className="w-8 h-8" />
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <OwnedItemsList />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <MessageSquareIcon className="w-8 h-8" />
          <CardTitle>Communication Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-4">
              <img
                alt="Avatar"
                className="rounded-full"
                height="40"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "40/40",
                  objectFit: "cover",
                }}
                width="40"
              />
              <div className="grid gap-1">
                <p className="text-sm font-semibold">MissionControl</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome to the Garden Planet, intrepid explorers! Remember to document your findings and enjoy the
                  wonders of this beautiful world. Happy collecting!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img
                alt="Avatar"
                className="rounded-full"
                height="40"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "40/40",
                  objectFit: "cover",
                }}
                width="40"
              />
              <div className="grid gap-1">
                <p className="text-sm font-semibold">StellaStarlight</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  I've found the rare Starblossom seeds near the Crystal Fountain! They shimmer with otherworldly light.
                  Mission accomplished! #GardenPlanetCollector 🌟🌺
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <img
                alt="Avatar"
                className="rounded-full"
                height="40"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "40/40",
                  objectFit: "cover",
                }}
                width="40"
              />
              <div className="grid gap-1">
                <p className="text-sm font-semibold">GreenThumb</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The flora and fauna here are truly amazing. I've spotted bioluminescent mushrooms and friendly
                  fluttering creatures. It's like a magical garden! #NatureLover 🌿✨
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}


function MessageSquareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
