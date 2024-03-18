import Link from "next/link"
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const SectorItems: React.FC= ( planetSectorId ) => {

  const supabase = useSupabaseClient();
  const [items, setItems] = useState<any[]>([]); // Change the type as per your data structure

  useEffect(() => {
    const fetchSectorItems = async () => {
      try {
        // Fetch items belonging to the sector from your database
        const { data, error } = await supabase
          .from('inventoryUSERS')
          .select('*')
          .eq('sector', planetSectorId);

        if (error) {
          throw error;
        }

        if (data) {
          setItems(data);
        }
      } catch (error) {
        console.error('Error fetching sector items:', error.message);
      }
    };

    fetchSectorItems();
  }, [supabase, planetSectorId]);

  return (
    <div>
      <h2>Sector Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}><p>{item}</p></li>
        ))}
      </ul>
    </div>
  );
};

export default SectorItems;

export function SectorItemStructures(planetAndSectorId) {
  const supabase = useSupabaseClient();
  // Add discriminator to prevent users who don't own that sector/perms
  const [sectorItems, setSectorItems] = useState([]);

  useEffect(() => {

  })
}

export function SectorStructuresList() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 space-y-4 md:space-y-0 md:flex-row md:space-x-4">
      <div className="grid gap-4 w-full max-w-sm md:max-w-none md:grid-cols-3">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <SwordIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Sword</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <PillIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Potion</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <ShieldIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Shield</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <ScrollIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Scroll</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <AxeIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Axe</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
            <BellRingIcon className="w-8 h-8 text-gray-200 dark:text-gray-800 translate-y-1" />
          </div>
          <span className="text-sm font-medium">Ring</span>
          <Link className="text-sm underline" href="#">
            View More
          </Link>
        </div>
      </div>
    </div>
  )
}

function AxeIcon(props) {
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
      <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9" />
      <path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z" />
    </svg>
  )
}


function BellRingIcon(props) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
      <path d="M22 8c0-2.3-.8-4.3-2-6" />
    </svg>
  )
}


function PillIcon(props) {
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
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  )
}


function ScrollIcon(props) {
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
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    </svg>
  )
}


function ShieldIcon(props) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  )
}


function SwordIcon(props) {
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
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" x2="19" y1="19" y2="13" />
      <line x1="16" x2="20" y1="16" y2="20" />
      <line x1="19" x2="21" y1="21" y2="19" />
    </svg>
  )
};