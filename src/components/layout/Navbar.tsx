"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { Avatar } from "../profile/setup/Avatar";
import Link from "next/link";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import MilestoneCard from "../deployment/missions/structures/Milestones/MilestoneCard";
import JournalPage from "../deployment/missions/structures/Stardust/Journal";
import { BellDotIcon, TrophyIcon } from "lucide-react";
import MySettlementsLocations from "@/src/components/classification/UserLocations";

export default function Navbar() {
  const supabase = useSupabaseClient();
  const { activePlanet } = useActivePlanet();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [settlementsOpen, setSettlementsOpen] = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [isMilestoneView, setIsMilestoneView] = useState(true);
  const [isTerrariumOpen, setIsTerrariumOpen] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHasNewAlert((prev) => !prev);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      // Signed out
      router.push('/');
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" legacyBehavior>
              <a>
                <img src="/planet.svg" alt="Logo" className="h-8 w-8 ml-1" />
              </a>
            </Link>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  className="text-lg font-bold text-white hidden sm:flex items-center space-x-2 p-2 bg-[#5FCBC3]/60 rounded-lg hover:bg-[#5FCBC3]/80 transition"
                  onClick={() => setSettlementsOpen((prev) => !prev)}
                >
                  <span>Star Sailors:</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9l-7.5 7.5L4.5 9" />
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
                <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link href="/" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          My Settlements
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/desert" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Desert Base
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/ocean" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Ocean Base
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                  <Link href="/scenes/uploads" passHref>
                    <Menu.Item>
                      {({ active }) => (
                        <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                          Conservation
                        </a>
                      )}
                    </Menu.Item>
                  </Link>
                </Menu.Items>
              </Transition>
            </Menu>

            <div className="relative hidden sm:block">
              <button
                className="text-lg font-bold text-white items-center space-x-2 p-2 bg-[#5FCBC3]/60 rounded-lg hover:bg-[#5FCBC3]/80 transition"
                onClick={() => setMilestonesOpen((prev) => !prev)}
              >
                Milestones
              </button>
              {milestonesOpen && (
                <div className="absolute left-0 mt-2 w-[350px] sm:w-[400px] bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
                  <div className="px-4 py-2 text-sm font-bold text-gray-800">
                    <button
                      className={`w-full text-left px-2 py-1 rounded-lg ${isMilestoneView ? 'bg-[#5FCBC3]/60' : 'bg-gray-100'}`}
                      onClick={() => setIsMilestoneView(true)}
                    >
                      Weekly Milestones
                    </button>
                    <button
                      className={`w-full text-left px-2 py-1 rounded-lg ${!isMilestoneView ? 'bg-[#5FCBC3]/60' : 'bg-gray-100'}`}
                      onClick={() => setIsMilestoneView(false)}
                    >
                      Classifications Journal
                    </button>
                  </div>
                  {isMilestoneView ? <MilestoneCard /> : <JournalPage />}
                </div>
              )}
            </div>

            <div className="relative hidden sm:block">
              <button
                className="text-lg font-bold text-white items-center space-x-2 p-2 bg-[#5FCBC3]/60 rounded-lg hover:bg-[#5FCBC3]/80 transition"
                onClick={() => setIsTerrariumOpen((prev) => !prev)}
              >
                Travel
              </button>
              {isTerrariumOpen && (
                <div className="absolute left-0 mt-2 w-[350px] sm:w-[400px] bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
                  <MySettlementsLocations />
                </div>
              )}
            </div>

            <div className="relative sm:hidden">
              <button
                className={`p-2 rounded-full bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition ${hasNewAlert ? "animate-pulse" : ""}`}
                onClick={() => setAlertsOpen((prev) => !prev)}
              >
                <BellDotIcon className="w-6 h-6 text-white" />
                {hasNewAlert && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            </div>

            <div className="relative sm:hidden">
              <button
                className="p-2 rounded-full bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition"
                onClick={() => setMilestonesOpen((prev) => !prev)}
              >
                <TrophyIcon className="w-6 h-6 text-white" />
              </button>
              {milestonesOpen && (
                <div className="absolute left-0 mt-2 w-[350px] bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/20">
                  <div className="px-4 py-2 text-sm font-bold text-gray-800">
                    <button
                      className={`w-full text-left px-2 py-1 rounded-lg ${isMilestoneView ? 'bg-[#5FCBC3]/60' : 'bg-gray-100'}`}
                      onClick={() => setIsMilestoneView(true)}
                    >
                      Weekly Milestones
                    </button>
                    <button
                      className={`w-full text-left px-2 py-1 rounded-lg ${!isMilestoneView ? 'bg-[#5FCBC3]/60' : 'bg-gray-100'}`}
                      onClick={() => setIsMilestoneView(false)}
                    >
                      Classifications Journal
                    </button>
                  </div>
                  {isMilestoneView ? <MilestoneCard /> : <JournalPage />}
                </div>
              )}
            </div>
          </div>

          <Menu as="div" className="relative">
            <div>
              <Menu.Button
                className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-[#5FCBC3]/60 hover:bg-[#5FCBC3]/80 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
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
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link href="/account" passHref>
                  <Menu.Item>
                    {({ active }) => (
                      <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                        Edit Profile
                      </a>
                    )}
                  </Menu.Item>
                </Link>
                <Menu.Item>
                  {({ active }) => (
                    <a className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}>
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}
                      onClick={signOut}
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