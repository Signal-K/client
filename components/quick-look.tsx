import { CardDescription, CardHeader, CardContent, Card, CardTitle } from "../@/components/ui/card"
import { Button } from "./ui/Button"

export function QuickLook() {
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Welcome to the Intergalactic Science Guild</CardTitle>
          <CardDescription className="text-sm">Your hub for scientific discovery across the cosmos</CardDescription>
        </div>
        <Button className="md:ml-auto w-full md:w-auto" size="sm">
          Upgrade Membership
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <UserIcon className="w-8 h-8 rounded-lg bg-gray-100 p-2 dark:bg-gray-800" />
            <div className="flex flex-col">
              <h2 className="font-semibold">Commander Nova</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Level 5 Astrophysicist</p>
            </div>
          </div>
          <div className="grid gap-1">
            <p>
              <strong>Home Planet:</strong>
              Earth{"\n                      "}
            </p>
            <p>
              <strong>Ship:</strong>
              Odyssey Explorer{"\n                      "}
            </p>
            <p>
              <strong>Current Location:</strong>
              Space Station Alpha{"\n                      "}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="grid gap-1">
            <p>
              <strong>Rank:</strong>
              Science Officer{"\n                      "}
            </p>
            <p>
              <strong>Experience:</strong>
              2,345 XP{"\n                      "}
            </p>
            <p>
              <strong>Badges:</strong>
              5{"\n                      "}
            </p>
          </div>
          <div className="grid gap-1">
            <p>
              <strong>Next Mission:</strong>
              Analyze Exoplanet Zeta{"\n                      "}
            </p>
            <p>
              <strong>Deadline:</strong>
              3 days{"\n                      "}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


function UserIcon(props) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
