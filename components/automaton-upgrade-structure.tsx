import { Button } from "@/components/ui/button"
import { DialogTrigger, DialogTitle, DialogContent, Dialog } from "@/components/ui/dialog"

export function AutomatonUpgradeStructure() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
          variant="outline"
        >
          Upgrade Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Upgrade Vehicle</DialogTitle>
            <div>
              <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <GaugeIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Speed</p>
                  <p className="text-lg font-bold">120 mph</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TruckIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Storage</p>
                  <p className="text-lg font-bold">500 lbs</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BoltIcon className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Engine</p>
                  <p className="text-lg font-bold">V8</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CogIcon className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Modules</p>
                  <p className="text-lg font-bold">3</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Speed</p>
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-full bg-gray-100 text-blue-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                  size="icon"
                  variant="ghost"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <p className="text-lg font-bold">+20 mph</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Storage</p>
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-full bg-gray-100 text-orange-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-gray-700"
                  size="icon"
                  variant="ghost"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <p className="text-lg font-bold">+100 lbs</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Engine</p>
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-full bg-gray-100 text-yellow-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
                  size="icon"
                  variant="ghost"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <p className="text-lg font-bold">V12</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Modules</p>
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-full bg-gray-100 text-green-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                  size="icon"
                  variant="ghost"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
                <p className="text-lg font-bold">+1</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-500"
              variant="outline"
            >
              Upgrade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BoltIcon(props: any) {
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}


function CogIcon(props: any) {
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
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="M14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m11 13.73-4 6.93" />
    </svg>
  )
}


function GaugeIcon(props: any) {
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
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  )
}


function PlusIcon(props: any) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}


function TruckIcon(props: any) {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}


function XIcon(props: any) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
