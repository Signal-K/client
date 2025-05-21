'use client';

import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";

interface Classification {
  author: string;
  id: number;
  content: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  image_url?: string;
  images?: string[];
  anomalyContent?: string;
  relatedClassifications?: Classification[];
  anomalies?: {
    content: string;
  };
}

interface Props {
  selected?: Classification | null;
  setSelectedLocation: (location: Classification) => void;
  open?: boolean; // Optional controlled open state
  onOpenChange?: (open: boolean) => void; // Optional handler
};

export default function SelectLocationForAutomatonDeploymentDropdown({
  setSelectedLocation,
  selected,
}: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [myLocations, setMyLocations] = useState<Classification[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  function formatLabel(classification: Classification): string {
    return classification.anomalyContent || classification.content || `#${classification.id}`;
  }

  async function fetchUserLocationClassifications() {
    if (!session?.user?.id) {
      setError("No user session found.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: lcError } = await supabase
        .from("classifications")
        .select("*, anomalies(content)")
        .in("classificationtype", ["planet", "telescope-minorPlanet"])
        .eq("author", session.user.id)
        .limit(10);

      if (lcError) throw lcError;
      setMyLocations(data);
    } catch (error) {
      console.error("Error occurred while fetching user locations:", error);
      setError("Error fetching locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) fetchUserLocationClassifications();
  }, [session]);

  if (loading) return <>Loading...</>;
  if (error) return <p>{error}</p>;
  if (!myLocations || myLocations.length === 0) {
    return <p>You need to discover more objects to visit!</p>;
  }

  return (
    <Menu as="div" className="relative inline-block text-left w-64">
      <Menu.Button className="w-full text-left px-4 py-2 bg-black/60 text-yellow-300 rounded-md hover:bg-yellow-500/20 focus:outline-none flex justify-between items-center">
        <span className="truncate">{selected ? formatLabel(selected) : "Select Location"}</span>
        <svg
          className="ml-2 h-5 w-5 text-yellow-300"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-black/90 backdrop-blur-md border border-yellow-500/30 shadow-lg focus:outline-none">
          {myLocations.map((location) => (
            <Menu.Item key={location.id}>
              {({ active }) => (
                <button
                  onClick={() => setSelectedLocation(location)}
                  className={`${
                    active ? "bg-yellow-500/30 text-yellow-100" : "text-yellow-300"
                  } group flex w-full items-start px-4 py-2 text-sm truncate`}
                >
                  <div>
                    <p className="font-semibold">{location.anomalies?.content || "Unnamed object"}</p>
                    <p className="text-xs mt-0.5">
                      {location.classificationtype === "planet"
                        ? "Planet"
                        : location.classificationtype === "telescope-minorPlanet"
                        ? "Asteroid"
                        : "Unknown Type"}
                    </p>
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};