import SkillTreeComp from '@/components/Gameplay/Inventory/Structures/TechTree';
import React from 'react';

export const Slidebar = ({ showSidebar, setShowSidebar }: { showSidebar: boolean, setShowSidebar: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <>
      {showSidebar ? (
        <p
          className="flex text-4xl text-white items-center cursor-pointer fixed right-10 top-6 z-50"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          x
        </p>
      ) : (
        <svg
          onClick={() => setShowSidebar(!showSidebar)}
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

      <div
        className={`top-0 right-0 w-[80vw] lg:w-[80.5vw] p-10 pl-20 overflow-auto text-white fixed h-full transform ease-in-out duration-300 z-40 ${
          showSidebar ? 'translate-x-0 ' : 'translate-x-full'
        }`}
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1658211208906-429cd4aa0e5b?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
      >
        <h2 className="mt-20 text-4xl font-semibold text-white">
          <SkillTreeComp />
        </h2>
      </div>
    </>
  );
};