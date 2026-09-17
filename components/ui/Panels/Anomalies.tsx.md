import React from 'react';
import SkillTreeComp from '@/components/Gameplay/Inventory/Structures/TechTree';
import LaunchPad from '@/components/Animations/Travelling/Launchpad'; 

interface SlidebarProps {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Slidebar: React.FC<SlidebarProps> = ({ showSidebar, setShowSidebar }) => {
  return (
    <>
      {showSidebar ? (
<div
        className={`top-0 right-0 w-[80vw] lg:w-[80.5vw] p-10 pl-20 overflow-auto text-white fixed h-full transform ease-in-out duration-300 z-40 ${
          showSidebar ? 'translate-x-0 ' : 'translate-x-full'
        }`}
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1658211208906-429cd4aa0e5b?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
      >
        <h2 className="mt-20 text-4xl font-semibold text-white">
          <SkillTreeComp />
          {/* <LaunchPad /> */}
        </h2>
      </div>
      ) : (
        <svg
          onClick={() => setShowSidebar(true)}
          className="fixed z-30 flex items-center cursor-pointer right-10 top-6"
          fill="#2563EB"
          viewBox="0 0 100 80"
          width="40"
          height="40"
        >
          <rect width="100" height="10"></rect>
          <rect y="30" width="100" height="10"></rect>
          <rect y="60" width="100" height="10"></rect>
        </svg>
      )}

      
    </>
  );
};

import { useState } from "react";
import PickYourPlanet from '@/components/Onboarding';

import {
    Drawer,
    Button,
    Typography,
    IconButton,
  } from "@material-tailwind/react";

type PickYourPlanetProps = {
    onPlanetSelect: (planetId: string) => void;
};

const Sidebar = () => {

    const [open, setOpen] = React.useState(false);
 
  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
    return (
<React.Fragment>
      <Button onClick={openDrawer}>Open Drawer</Button>
      <Drawer open={open} onClose={closeDrawer} className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Material Tailwind
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <Typography color="gray" className="mb-8 pr-4 font-normal">
          Material Tailwind features multiple React and HTML components, all
          written with Tailwind CSS classes and Material Design guidelines.
        </Typography>
        <div className="flex gap-2">
          <Button size="sm" variant="outlined">
            Documentation
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </Drawer>
    </React.Fragment>
    );
};

const Sidebar1 = () => {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
        {showSidebar ? (
            <>
                <div
            className={`top-0 right-0 w-[80vw] lg:w-[80.5vw] p-10 pl-20 overflow-auto text-white fixed h-full transform ease-in-out duration-300 z-40 ${
            showSidebar ? "translate-x-0 " : "translate-x-full"
            }`}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1658211208906-429cd4aa0e5b?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        >
                <div className="flex flex-col">
                    <PickYourPlanet onPlanetSelect={() => {}} />
                    <SkillTreeComp />
                    <div className='p-1'>
                        <LaunchPad />
                    </div>
                    <p className="m-0">Test</p>
                </div>
            </div>
            <button
            className="flex text-4xl text-white items-center cursor-pointer fixed right-10 top-6 z-50"
            onClick={() => setShowSidebar(!showSidebar)}
            >
            x
            </button></>
        ) : (
            <svg
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed  z-30 flex items-center cursor-pointer right-10 top-6"
            fill="#2563EB"
            viewBox="0 0 100 80"
            width="40"
            height="40"
            >
            <rect width="100" height="10"></rect>
            <rect y="30" width="100" height="10"></rect>
            <rect y="60" width="100" height="10"></rect>
            </svg>
        )}

        <div
            className={`top-0 right-0 w-[80vw] lg:w-[80.5vw] p-10 pl-20 overflow-auto text-white fixed h-full transform ease-in-out duration-300 z-40 ${
            showSidebar ? "translate-x-0 " : "translate-x-full"
            }`}
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1658211208906-429cd4aa0e5b?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        >
                <div className="flex flex-col">
                    <PickYourPlanet onPlanetSelect={() => {}} />
                    <SkillTreeComp />
                    <div className='p-1'>
                        <LaunchPad />
                    </div>
                    <p className="m-0">Test</p>
                </div>
            </div>
        </>
    );
};

export default Sidebar;