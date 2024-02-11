import Link from "next/link";
import { useRouter } from "next/router";

import { BuildingIcon, CarIcon, RocketIcon, CpuIcon, MessageSquareDashedIcon } from "lucide-react";
import { CircleMenu, CircleMenuItem, TooltipPlacement} from 'react-circular-menu';
import { useState } from "react";

import { ClassificationFeedForIndividualPlanet } from "../Content/ClassificationFeed";
import ContentPlaceholder from "../Content/Planets/PlanetData/ContentPlaceholder";

const bottombarLinks = [
  {
    imgURL: "/home.svg",
    route: "/feed",
    label: "Feed",
  },
  {
    imgURL: "/planet.svg",
    route: "/garden",
    label: "Garden",
  },
  {
    imgURL: "/eagle.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/rover.svg",
    route: "/create-post",
    label: "Gather",
  },
  {
    imgURL: "/satellite.svg",
    route: "/create-post",
    label: "Missions",
  },
];

const Bottombar = () => {
  const { pathname } = useRouter();

  return (
    <section className="bottom-bar flex justify-between items-center p-4 bg-white fixed bottom-0 left-0 w-full border-t">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link legacyBehavior key={`bottombar-${link.label}`} href={link.route} passHref>
            <a className={`${
              isActive && "rounded-[10px] bg-primary-500 "
            } flex flex-col items-center justify-center p-2 transition`}>
              <img
                src={link.imgURL}
                alt={link.label}
                width={24} 
                height={24}
                className={`mb-1 ${isActive ? "invert-white" : "text-light-2"}`}
              />
              <p className={`tiny-medium ${isActive ? "text-light-3" : "text-light-2"}`}>
                {link.label}
              </p>
            </a>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;

export const CreateBar = ({ onTabClick }) => {
  return (
    <div className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-gray-700 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        <button
          data-tooltip-target="tooltip-home"
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={() => onTabClick('home')}
        >
          <svg
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
            />
          </svg>
          <span className="sr-only">Home</span>
        </button>
        <div
          id="tooltip-home"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Home
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button
          data-tooltip-target="tooltip-wallet"
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={() => onTabClick('wallet')}
        >
          <svg
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M11.074 4 8.442.408A.95.95 0 0 0 7.014.254L2.926 4h8.148ZM9 13v-1a4 4 0 0 1 4-4h6V6a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-2h-6a4 4 0 0 1-4-4Z"
            />
            <path
              d="M19 10h-6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm-4.5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12.62 4h2.78L12.539.41a1.086 1.086 0 1 0-1.7 1.352L12.62 4Z"
            />
          </svg>
          <span className="sr-only">Wallet</span>
        </button>
        <div
          id="tooltip-wallet"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Wallet
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <div className="flex items-center justify-center">
          <button
            data-tooltip-target="tooltip-new"
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
          >
            <svg
              className="w-4 h-4 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 1v16M1 9h16"
              />
            </svg>
            <span className="sr-only">New item</span>
          </button>
        </div>
        <div
          id="tooltip-new"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Create new item
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button
          data-tooltip-target="tooltip-settings"
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
        >
          <svg
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"
            />
          </svg>
          <span className="sr-only">Settings</span>
        </button>
        <div
          id="tooltip-settings"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Settings
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button
          data-tooltip-target="tooltip-profile"
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
        >
          <svg
            className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM0 10a10 10 0 1 1 20 0 10 10 0 0 1-20 0Z"
            />
          </svg>
          <span className="sr-only">Profile</span>
        </button>
        <div
          id="tooltip-profile"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Profile
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      </div>
    </div>
  );
};

export const CreateMenuBar = ({ onUpdatesClick, onSecondButtonClick }) => {
  return (
    <ul className="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4 bg-gray-200 rounded-full p-2 shadow-lg">
      <li className="flex flex-col items-center justify-center">
        <a onClick={onUpdatesClick} className="flex flex-col items-center justify-center p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="bg-gray-500 text-white text-xs px-1 rounded">99+</span>
          <span>Inbox</span>
        </a>
      </li>
      <li className="flex flex-col items-center justify-center">
        <a onClick={onSecondButtonClick} className="flex flex-col items-center justify-center p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="bg-yellow-500 text-white text-xs px-1 rounded">NEW</span>
          <span>Feed</span>
        </a>
      </li>
      <li className="flex flex-col items-center justify-center">
        <a onClick={onUpdatesClick} className="flex flex-col items-center justify-center p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="bg-gray-500 text-white text-xs px-1 rounded">99+</span>
          <span>Inbox</span>
        </a>
      </li>
      <li className="flex flex-col items-center justify-center">
        <a onClick={onUpdatesClick} className="flex flex-col items-center justify-center p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="bg-gray-500 text-white text-xs px-1 rounded">99+</span>
          <span>Inbox</span>
        </a>
      </li>      
    </ul>
  );
};

export const SectorCircularMenu = (props) => {
  const [activeComponent, setActiveComponent] = useState(null);

  const handleItemClick = (itemName) => {
    // Set the active component based on the clicked item
    switch (itemName) {
      case 'Email':
        setActiveComponent('ClassificationFeedForIndividualPlanet');
        break;
      case 'Help':
        setActiveComponent('ContentPlaceholder');
        break;
      case 'Location':
        // Set active component for other items if needed
        break;
      case 'Info':
        // Set active component for other items if needed
        break;
      default:
        setActiveComponent(null);
    }
  };

  return (<>
    <CircleMenu
      startAngle={-90}
      rotationAngle={360}
      itemSize={2}
      radius={5}
      rotationAngleInclusive={false}
    >
      <CircleMenuItem
        onClick={() => alert("Clicked the item")}
        tooltip="Email"
        tooltipPlacement={TooltipPlacement.Right}
      >
        <BuildingIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Help">
        <MessageSquareDashedIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Location">
        <CarIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Info">
        <RocketIcon />
      </CircleMenuItem>
    </CircleMenu>

    {activeComponent === 'ContentPlaceholder' && <ContentPlaceholder />}</>
  );;
};