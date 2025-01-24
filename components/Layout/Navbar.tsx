import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Avatar } from "../Account/Avatar";
import Link from "next/link";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function Navbar() {
  const {activePlanet } = useActivePlanet();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link legacyBehavior href="/">
              <a>
                <img
                  src="/planet.svg"
                  alt="Logo"
                  className="h-8 w-8"
                  style={{ marginLeft: "4px" }} 
                />
              </a>
            </Link>
            <Link legacyBehavior href="/">
              {activePlanet && (
                <div className="text-lg font-bold text-white hidden sm:block">
                  Star Sailors - you are on: {activePlanet?.content || "Loading..."}
                </div>
              )}
            </Link>
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
                <Link legacyBehavior href="/account">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#profile"
                        className={`block px-4 py-2 text-sm text-gray-700 ${
                          active ? "bg-gray-100" : ""
                        }`}
                      >
                        Edit Profile
                      </a>
                    )}
                  </Menu.Item>
                </Link>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#settings"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#logout"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? "bg-gray-100" : ""
                      }`}
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