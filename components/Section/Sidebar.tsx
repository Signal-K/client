import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import {
  BellRing,
  Bug,
  GanttChartSquare,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  StarHalfIcon,
  StarIcon,
  TrendingUp,
  User,
  User2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import { Button } from "../ui/Button";

const navCategoryItems = [
  {
    url: "/feed",
    label: "Feed",
    Icon: StarHalfIcon,
  },
  {
    url: "/garden",
    label: "Garden",
    Icon: User2Icon,
  },
];

const navSettingItems = [
  {
    url: "https://starsailors.space",
    label: "STAR",
    Icon: StarHalfIcon,
  },
  {
    url: "/profile",
    label: "PROFILE",
    Icon: User2Icon,
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const query = useSearchParams();

  const [openAside, setOpenAside] = useState(false);
  const [logoutClicked, setLogoutClicked] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    image: null | string;
    role: "common" | "developer" | string;
  }>({
    username: "",
    image: null,
    role: "common",
  });

  useEffect(() => {
    setOpenAside(false);
  }, [pathname, query]);

  return (
    <>
      <aside
        className={`
          lg:pl-[2rem] lg:border-r lg:pr-4 py-4 flex flex-col justify-between lg:w-1/5 h-screen lg:sticky lg:top-0 lg:px-0
          lg:z-10
          px-4 bg-secondary lg:bg-transparent lg:translate-y-0 transition-transform
          fixed inset-0 ${openAside ? "translate-y-0" : "-translate-y-[200%]"}
          z-20
      `}
      >
        <div>
          <h2 className="text-lg font-bold text-foreground/70 mb-4">
            Components
          </h2>
          <ul className="space-y-4">
            {navCategoryItems.map((item, idx) => (
              <NavItem {...item} key={idx} active={pathname === item.url} />
            ))}
          </ul>

          <h2 className="text-lg font-bold mt-4 text-foreground/70">
            Your stuff
          </h2>
          <ul className="space-y-4 mt-4">
            {navSettingItems.map((item, idx) => (
              <NavItem {...item} key={idx} active={pathname === item.url} />
            ))}
            {user.role === "developer" && (
              <NavItem
                url="/reported-post"
                label="Reported Post"
                Icon={Megaphone}
                active={pathname === "/reported-post"}
              />
            )}
          </ul>
        </div>

        <div>
          <div className="flex items-start gap-2">
            <Avatar className="rounded-full">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="rounded-full">
                {user.username && user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <Button
            className="w-full flex items-center space-x-2 justify-start mt-4 bg-white lg:hidden"
            variant="outline"
            onClick={() => setOpenAside(false)}
          >
            <Menu className="w-6 aspect-square" />
            <span>Menu</span>
          </Button>
        </div>
      </aside>
      <div className="fixed lg:hidden bottom-0 p-4 inset-x-0 z-10 bg-white supports-[backdrop-filter]:bg-white/60 border-t supports-[backdrop-filter]:backdrop-blur-md">
        <Button
          onClick={() => setOpenAside(true)}
          className="w-full flex items-center justify-start space-x-2"
        >
          <Menu className="w-6 aspect-square" />
          <span>Menu</span>
        </Button>
      </div>
    </>
  );
};

export default Sidebar;

export function DesktopSidebar () {
  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800">
      <div className="fixed flex flex-col top-0 left-0 w-64 bg-white h-full border-r">
        <div className="flex items-center justify-center h-14 border-b">
          <div>Star Sailors Alpha 0.2.1</div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          <ul className="flex flex-col py-4 space-y-1">
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-500">Dashboard</div>
              </div>
            </li>
            <li>
              <a href="/feed" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Feed</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Inbox</span>
                <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-indigo-500 bg-indigo-50 rounded-full">New</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Messages</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Notifications</span>
                <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-red-500 bg-red-50 rounded-full">1.2k</span>
              </a>
            </li>
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-500">Your Garden</div>
              </div>
            </li>
            <li>
              <a href="/garden" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Garden</span>
              </a>
            </li>
            <li>
              <a href="/garden" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Planets</span>
                <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-green-500 bg-green-50 rounded-full">3</span>
              </a>
            </li>
            <li>
              <a href="/planets/1" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Water/Checkup</span>
                <span className="px-2 py-0.5 ml-auto text-xs font-medium tracking-wide text-green-500 bg-green-50 rounded-full">5</span>
              </a>
            </li>
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-500">Missions</div>
              </div>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Profile</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Tasks</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Inventory</span>
              </a>
            </li>
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Gather</span>
              </a>
            </li>
      </ul>
  </div>
  </div>
</div>
);
};