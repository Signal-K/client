import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Avatar } from "../Account/Avatar";
import Link from "next/link";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function Navbar() {
  const supabase = useSupabaseClient();

  const { activePlanet } = useActivePlanet();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [settlementsOpen, setSettlementsOpen] = useState(false);

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      // Handle post-sign-out logic (e.g., redirect or notify user)
      console.log("User signed out successfully");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" legacyBehavior>
              <a>
                <img
                  src="/planet.svg"
                  alt="Logo"
                  className="h-8 w-8"
                  style={{ marginLeft: "4px" }}
                />
              </a>
            </Link>
            <div className="relative">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button
                    className="text-lg font-bold text-white hidden sm:flex items-center space-x-2 p-2 bg-[#5FCBC3]/60 rounded-lg hover:bg-[#5FCBC3]/80 transition"
                    onClick={() => setSettlementsOpen((prev) => !prev)}
                  >
                    <span>Star Sailors: {activePlanet?.content || "..."}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 9l-7.5 7.5L4.5 9"
                      />
                    </svg>
                  </Menu.Button>
                </div>
                <Transition
                  show={settlementsOpen}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    static
                    className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <Link href="/" passHref>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                            role="menuitem"
                          >
                            My Settlements
                          </a>
                        )}
                      </Menu.Item>
                    </Link>
                    <Link href="/scenes/desert" passHref>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                            role="menuitem"
                          >
                            Desert Base
                          </a>
                        )}
                      </Menu.Item>
                    </Link>
                    <Link href="/scenes/ocean" passHref>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={`block px-4 py-2 text-sm text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            }`}
                            role="menuitem"
                          >
                            Ocean Base
                          </a>
                        )}
                      </Menu.Item>
                    </Link>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          <Menu as="div" className="relative">
            <div>
              <Menu.Button
                className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
                style={{ marginRight: "4px" }}
              >
                <Avatar />
              </Menu.Button>
            </div>
            <Transition
              show={menuOpen}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <Link href="/account" passHref>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        className={`block px-4 py-2 text-sm text-gray-700 ${
                          active ? "bg-gray-100" : ""
                        }`}
                        role="menuitem"
                      >
                        Edit Profile
                      </a>
                    )}
                  </Menu.Item>
                </Link>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                      role="menuitem"
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                      role="menuitem"
                      onClick={signOut}  // Trigger the sign-out on click
                    >
                      Logout
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};