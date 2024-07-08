"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowDownIcon } from 'lucide-react';

type NavMenuProps = {
  onMyDiscoveriesClick: () => void; // Add this prop
};

export default function NavMenu({ onMyDiscoveriesClick }: NavMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Discoveries
          <ArrowDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          <MenuItem>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onMyDiscoveriesClick(); // Trigger the modal open
              }}
              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
            >
              My discoveries
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/tests"
              className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
            >
              All discoveries
            </a>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}