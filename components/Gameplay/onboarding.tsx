import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { InventoryBlock } from "../dashboard-logs";
import { ItemsVerticalList } from "../Content/Inventory/UserOwnedItems";
import { UserOwnedSectorGrid } from "../Content/Planets/Sectors/SectorSetup";

export function OnboardingWindows() {
  const session = useSession();

  return (
    <div className="w-full">
      <div className="container px-4 md:px-6">
        <div className="grid max-w-6xl grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start min-h-[calc(10vh-1px)] py-6 mx-auto">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="collapse bg-base-200">
              <input type="radio" name="my-accordion-1" id={`accordion-${index}`} />
              <div className="collapse-title text-xl font-medium flex items-center space-x-2">
                {getAccordionIcon(index)}
                <span>{getAccordionTitle(index)}</span>
              </div>
              <div className="collapse-content">
                {getAccordionContent(index)}
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          .grid-cols-3 > *:nth-child(n+4) {
            margin-top: calc(-1.5 * var(--accordion-collapsed-height));
          }
        `}</style>
      </div>
    </div>
  );  
};

function getAccordionIcon(index) {
  switch (index) {
    case 0:
      return <HomeIcon className="w-6 h-6" />;
    case 1:
      return <GoalIcon className="w-6 h-6" />;
    case 2:
      return <WarehouseIcon className="w-6 h-6" />;
    case 3:
      return <BotIcon className="w-6 h-6" />;
    case 4:
      return <SettingsIcon className="w-6 h-6" />;
    case 5:
      return <SectorsIcon className="w-6 h-6" />;
    default:
      return null;
  }
}

function getAccordionTitle(index) {
  switch (index) {
    case 0:
      return "Home";
    case 1:
      return "Missions";
    case 2:
      return "Inventory";
    case 3:
      return "Automations";
    case 4:
      return "Sectors";
    case 5:
      return "Structures";
    default:
      return null;
  }
}

function getAccordionContent(index) {
  switch (index) {
    case 0:
      return <p>Content for Section 1</p>;
    case 1:
      return <p>Content for Section 2</p>;
    case 2:
      return (
        <ItemsVerticalList />
      );
    case 3:
      return <p>Content for Section 4</p>;
    case 4:
      return (
        <UserOwnedSectorGrid />
      );
    case 5:
      return <p>A component that will show all the structures the user has created (along with a popup to use them)</p>;
    default:
      return null;
  }
}

function HomeIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GoalIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 13V2l8 4-8 4" />
      <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
      <path d="M8 10a5 5 0 1 0 8.9 2.02" />
    </svg>
  );
}

function WarehouseIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
      <path d="M6 18h12" />
      <path d="M6 14h12" />
      <rect width="12" height="12" x="6" y="10" />
    </svg>
  );
}

function BotIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SectorsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}