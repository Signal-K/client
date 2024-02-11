import Link from "next/link"
import { Button } from "./ui/button"
import { DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "./ui/dropdown-menu";
import { CardTitle, CardHeader, CardContent, Card } from "./ui/card";
import { QuickLook } from "../../components/quick-look";
import { UserMenuItems } from "../../components/Section/Navbar";
import OwnedItemsList from "../../components/Content/Inventory/UserOwnedItems";

export function GardenDashboard() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="grid items-center gap-4 p-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Galactic Garden</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome, Astronaut!</p>
          </div>
        </div>
        <div className="grid gap-4 p-4">
          <div className="flex items-center gap-4">
            <div className="w-1/3 text-left">Progress</div>
            <div className="w-2/3">
              <div />
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li>🌱 Seedling</li>
                <li>🌿 Sprout</li>
                <li>🌼 Bloom</li>
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


function Package2Icon(props) {
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
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  )
}


function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function ChevronDownIcon(props) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
