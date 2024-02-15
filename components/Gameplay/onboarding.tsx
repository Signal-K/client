import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

export function OnboardingWindows() {
  const session = useSession();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((prevSection) => (prevSection === section ? null : section));
  };

  return (
    <div className="w-full">
      <div className="container px-4 md:px-6">
        <div className="grid max-w-6xl grid-cols-12 items-start gap-4 min-h-[calc(100vh-1px)] py-6 mx-auto">
          <div className="space-y-4 col-span-12 lg:col-span-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 overflow-hidden rounded-xl">
                <img
                  alt="Avatar"
                  className="rounded-full aspect-square"
                  height="32"
                  src="/placeholder.svg"
                  width="32"
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-xl font-bold tracking-wide">Welcome, Citizen!</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {session?.user?.id}</p>
              </div>
            </div>
            <nav className="space-y-2 grid grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-4">
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <GoalIcon className="w-4 h-4" />
                Missions
              </Link>
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <WarehouseIcon className="w-4 h-4" />
                Inventory
              </Link>
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <BotIcon className="w-4 h-4" />
                Automations
              </Link>
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <SectorsIcon className="w-4 h-4" />
                Sectors
              </Link>
              <Link
                className="flex items-center space-x-2 font-medium rounded-md bg-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-50"
                href="#"
              >
                <StructuresIcon className="w-4 h-4" />
                Structures
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4 col-span-12 lg:col-span-9">
            <div className="grid gap-4">
              <div className="rounded-xl border aspect-video overflow-hidden">
                <span className="object-cover w-full h-full rounded-md bg-muted" />
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-1 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border aspect-image overflow-hidden cursor-pointer ${
                      expandedSection === index ? "col-span-2" : "col-span-1"
                    }`}
                    onClick={() => toggleSection(index)}
                  >
                    {expandedSection === index && (
                      <>
                        <img
                          alt="Image"
                          className="object-cover w-full h-full"
                          height="600"
                          src="/placeholder.svg"
                          style={{
                            aspectRatio: "800/600",
                            objectFit: "cover",
                          }}
                          width="800"
                        />
                        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                          <p className="text-white font-bold text-lg">Expanded Section {index + 1}</p>
                        </div>
                      </>
                    )}
                    {!expandedSection && (
                      <img
                        alt="Image"
                        className="object-cover w-full h-full"
                        height="600"
                        src="/placeholder.svg"
                        style={{
                          aspectRatio: "800/600",
                          objectFit: "cover",
                        }}
                        width="800"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeIcon(props) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GoalIcon(props) {
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
      <path d="M12 13V2l8 4-8 4" />
      <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
      <path d="M8 10a5 5 0 1 0 8.9 2.02" />
    </svg>
  );
}

function WarehouseIcon(props) {
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
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
      <path d="M6 18h12" />
      <path d="M6 14h12" />
      <rect width="12" height="12" x="6" y="10" />
    </svg>
  );
}

function BotIcon(props) {
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
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function SectorsIcon(props) {
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
      <path d="M21 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18z" />
      <path d="M10 9h4v6h-4z" />
      <path d="M7 13h10" />
    </svg>
  );
}

function StructuresIcon(props) {
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
      <path d="M12 4a1 1 0 0 1 1 1v12a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zM18 4a1 1 0 0 1 1 1v12a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zM6 4a1 1 0 0 1 1 1v12a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1z" />
    </svg>
  );
};